# Premortem — Nénufar (nenufar.co)

**Fecha:** 2026-08-22 · **Método:** Gary Klein / retrospectiva prospectiva · 7 agentes de análisis en paralelo

---

## Contexto recopilado

- **Qué es:** Tienda online de joyería artesanal colombiana (Shirley, Cartagena). Stack: Next.js 15 + Payload CMS v3 + PostgreSQL + Tailwind/shadcn, sobre el template `@payloadcms/plugin-ecommerce`. Sin pasarela de pago (ADR-001): formulario web → Order en Payload + notificación Telegram (@pedidos_nenufar) → Shirley cierra por WhatsApp manual: cobro por transferencia Nequi/Daviplata y coordinación de envío. Bot de gestión v3.2 solo para Shirley (webhook `/telegram/webhook`, Groq free).
- **Restricción dura (política #253):** todo 100% gratis. La API de WhatsApp Business cobra por conversación → el cierre por WhatsApp queda condenado a ser 100% manual para siempre; toda automatización vive en Telegram (gratis). Infraestructura objetivo: Oracle Cloud Always Free.
- **Quién:** compradoras (turistas/regalo/joyería artesanal Colombia), Shirley (no técnica, "vive en su teléfono"), Ale (único builder).
- **Éxito esperado:** nenufar.co en producción generando ventas reales que Shirley puede operar sola desde su teléfono.
- **Estado real hoy:** todo en localhost:3002; deploys a Netlify cancelados; historial de pivotes v2→v3.0 Shopify→v3.1 Payload→v3.2 bot→migración SDK→SDK descartado (contradicción activa entre AGENTS.md y la decisión vigente).

## Encuadre

*Han pasado 6 meses. Nénufar ha fallado. Está hecho.*

## Premortem en bruto — 7 razones de fallo

1. El cierre manual por WhatsApp mata la conversión y no escala ni pagando.
2. Los pedidos se pierden en silencio por dependencia absoluta de un solo canal frágil (Telegram).
3. Shirley no puede operar el sistema sin Ale: la tienda se ve muerta y Ale se vuelve operador.
4. Cero demanda: se construyó la tienda antes que la audiencia.
5. La infraestructura $0/mes se cae exactamente en el peor momento (temporadas).
6. Dependencia del fundador + pivotes perpetuos: Nénufar nunca se lanza.
7. Confianza y compliance: marca desconocida cobrando por transferencia; un incidente destruye la marca.

---

# Análisis profundos (uno por agente)

## Fallo 1 — El cierre manual por WhatsApp mata la conversión

### La historia del fallo
El primer trimestre fue prometedor: el catálogo web funcionaba, los pedidos llegaban a Telegram, y las primeras ventas se cerraron porque Shirley respondía en minutos desde su celular. Pero en abril llegó la primera feria artesanal en Cartagena: ocho horas fuera de línea. Ese día entraron 6 pedidos calientes por /pedidos/enviar; cuando Shirley abrió WhatsApp a las 10 p.m., 4 compradoras no contestaban. Dos habían preguntado precio por Instagram a la competencia mientras esperaban. Nadie lo registró como dato — parecía mala suerte.

Mayo trajo el patrón invisible: pedidos guardados en Payload sin venta asociada. El formulario capturaba intención (nombre, WhatsApp, personalización), pero no había forma de saber cuántos pedidos morían entre el formulario y la transferencia Nequi. Las compradoras jóvenes —el público de joyería artesanal— ignoraban el primer mensaje del número desconocido de Shirley; algunas bloquearon el número pensando que era spam. La hipótesis de "el cierre humano genera confianza" se invirtió: un mensaje tardío de un desconocido genera desconfianza, no confianza.

En junio un video de TikTok hizo viral un arete de concha. Pedidos: 40 en una semana. Shirley durmió 5 horas por noche escribiendo mensajes manuales uno por uno. Cerró 9 ventas y perdió 31. La política #253 —"gratis para siempre"— convirtió el éxito en castigo: sin API de pago, ni recordatorios automáticos, ni estados de pedido. Cada venta adicional consumía más horas de Shirley. En agosto, agotada, dejó de responder pedidos nuevos en dos días seguidos. Tres semanas después, la tienda seguía online pero funcionalmente muerta.

### Supuesto subyacente
Que Shirley estaría disponible para responder por WhatsApp dentro de la ventana crítica (minutos) cada vez que una compradora tuviera intención caliente.

### Señales tempranas
- **Tasa de pedidos huérfanos**: % de pedidos en Payload que nunca llegan a transferencia confirmada. Si supera ~30% sostenido, la intención se está enfriando.
- **Tiempo medio hasta primer contacto**: minutos entre notificación de Telegram y primer mensaje enviado. Si la mediana pasa de ~30 minutos, el modelo está muriendo.

---

## Fallo 2 — Pedidos perdidos en silencio (canal único Telegram)

### La historia del fallo
Semana 3: Shirley actualiza su teléfono y el token del bot se revoca sin que nadie lo note. El primer pedido llega ese mismo día: el formulario funciona, la server action guarda el Order en Postgres con estado `pending`, el `sendMessage` a Telegram falla silenciosamente en un try/catch que solo hace `console.log`. No hay error visible. La compradora espera 24 horas, escribe por Instagram preguntando "¿y mi pedido?". Shirley, confundida, revisa Telegram: nada. Asume que fue un problema puntual de la compradora.

Mes 2: un redeploy en Oracle desregistra el webhook de `/telegram/webhook`. Los pedidos siguen guardándose —la base de datos hace exactamente lo que le pidieron— pero el canal hacia los ojos de Shirley está muerto. Cuatro órdenes `pending` se acumulan en una tabla que nadie consulta porque la UI admin nunca existió como flujo diario; el diseño entero asumía que Telegram era la interfaz. Una compradora paga por transferencia sin confirmación, otra desiste y compra en una tienda competidora. Shirley descubre las órdenes al azar, seis días después, cuando abre pgAdmin buscando otra cosa.

Meses 4–6: el patrón se normaliza. Sin health-check, sin alerta de "pedido con >24h sin respuesta", cada fallo nuevo (rate limit de Telegram tras un pico de ventas, cambio del canal ID, reinicio de instancia Ampere) repite la misma secuencia invisible: Order creado → notificación perdida → nadie mira la BD. El negocio sigue "funcionando" según todos los dashboards técnicos. Solo falla lo único que importaba: que Shirley se enterara.

### Supuesto subyacente
Que Telegram siempre funcionará y que Shirley lo revisará constantemente, sin necesidad de ningún mecanismo que verifique o garantice ninguna de las dos cosas.

### Señales tempranas
1. Contador de Orders en `pending` con más de X horas desde `createdAt` — cualquier valor >0 recurrente es el modo de fallo activándose.
2. Tras cada deploy: pedido de prueba y verificación observable de que el mensaje llegó al canal (logs de éxito del `sendMessage`).

---

## Fallo 3 — Shirley no puede operar el sistema

### La historia del fallo
Semana 2: Shirley publica su primer producto sola. Tarda 34 minutos: el admin en el navegador de su teléfono colapsa al subir las fotos (la optimización WebP se traba con la conexión de Cartagena), y el page builder no responde al scroll táctil. Lo logra, pero le dice a Ale "esto es muy difícil". Ale lo escucha como una anécdota, no como un dato.

Mes 1: llega el bug de Events — queda oculta del admin. Para Shirley es una pared: no puede cargar la feria de San Diego ni el bazar de Getsemaní. Escribe a Ale. Él lo agrega a una lista "pendiente de revertir" entre builds. Mientras tanto, el bot v3.2 — que era la promesa móvil — falla tres veces seguidas con timeouts en Groq cuando Shirley pregunta `pedidosPendientes` desde una feria con mala señal. Ella deja de usarlo.

Meses 2–6: el patrón se consolida. Publicar un producto requiere: escritorio (que Shirley no tiene), flujo de variantes pensado para developers, y paciencia técnica que nadie le pagó por tener. El catálogo queda congelado en los productos que Ale subió durante el desarrollo. Los precios de COP quedan desactualizados frente a la inflación y al costo de materiales. Cada viernes Shirley manda fotos por WhatsApp: "¿puedes subir estas?". Ale, que construyó el sistema para NO ser operador, ahora pasa 3 horas semanales subiendo fotos. El punto del proyecto — autonomía — muere exactamente por la herramienta que debía garantizarla.

### Supuesto subyacente
Que Shirley podría operar una interfaz de administración diseñada para desarrolladores en escritorio, usando solo un teléfono.

### Señales tempranas
- Tiempo de publicación >15 min en el primer intento solo de Shirley.
- Mensajes "¿puedes…?" de Shirley a Ale a ritmo >1/semana después del mes 1; Eventos creados por Shirley = 0 tras el bug de ocultamiento.

---

## Fallo 4 — Cero demanda: tienda antes que audiencia

### La historia del fallo
En el mes 1, Shirley y el proyecto tomaron una decisión silenciosa pero fatal: el primer entregable fue un ADR formal sobre la elección de Payload CMS. Nadie preguntó "¿quién va a comprar aquí?". Esa pregunta nunca entró al BRD. El documento que debía definir clientas definió arquitectura.

Los meses 2 a 8 se consumieron en lo que se sentía como progreso: specs TRD de 40 páginas, el tema violeta del admin para que Shirley "se sintiera orgullosa", diagramas HTML desplegados a Netlify, el bot de Telegram con skills — v1, luego v2, luego v3.2. Cada entrega era visible, medible y gratificante. Mientras tanto, las clientas de las ferias de Cartagena seguían comprando en persona yéndose con una joya y un número de WhatsApp que nadie registró. Cero correos capturados. Cero contactos migrados. La lista más valiosa del negocio existía solo en el teléfono personal de Shirley y nunca fue tratada como activo.

En el mes 10, con el stack pulido y $0 de pauta por política #253, el sitio se lanzó. El formulario de pedidos esperó. En el mes 13, el analytics decía la verdad: tráfico casi exclusivo de Shirley, su familia y los desarrolladores revisando sus propios deploys. El dominio nenufar.co, sin backlinks ni contenido, era invisible frente a Instagram, donde la competencia colombiana de joyería artesanal publica Reels diarios. La hipótesis "si construyo una buena tienda, vendré" resultó ser la versión digital del letrero en el sótano: si lo construyes, no vendrán.

### Supuesto subyacente
Que el producto digital generaría su propia demanda — que la calidad técnica de la tienda sustituiría a la distribución.

### Señales tempranas
1. A las 8 semanas: backlog con cero tareas de adquisición/contenido y 3+ ADRs técnicos acumulados.
2. En cualquier feria: Shirley vende joyas y ninguna compradora queda registrada en una lista verificable (email/WhatsApp).

---

## Fallo 5 — La infraestructura $0 cae en el peor momento

### La historia del fallo
En agosto, durante Amor y Amistad, todo parecía funcionar. Pero las señales estaban: los 5-120s por request del servidor dev nunca se investigaron a fondo — se achacaron al "free tier". En octubre, Oracle reclama la instancia A1 por "inactividad": CPU promedio bajo su umbral porque la tienda apenas tenía tráfico. Shirley tardó 4 días en recuperarla (soporte lento, región agotada), reconfigurando Docker, Postgres y el webhook de Telegram a mano desde notas. Nadie documentó el procedimiento.

Llegó noviembre: un reel de Shirley se vuelve viral en Colombia. El tráfico llega. Next.js + Postgres + imágenes de productos compitiendo por los recursos que ahora sí se usan → OOM killer mata Postgres en el pico de un viernes. La tienda responde pero sin catálogo. Reinician Postgres manualmente; nadie sabe que `pgdata` quedó corrupto parcialmente hasta que los pedidos empiezan a fallar al escribirse.

Diciembre. Un log de Docker sin rotación + imágenes subidas sin límite llenan el disco. Postgres no puede escribir → caída total, 502 en toda la tienda. Sin backups fuera de la instancia (el script existía, nunca se probó una restauración), el historial de pedidos de Navidad —el 60% del año— es irrecuperable. El bot de Groq ya llevaba semanas devolviendo 429 intermitentes, así que las clientas que preguntaban no recibían respuesta ni para avisar del fallo. Shirley descubre la caída por un DM de una clienta dos días después.

### Supuesto subyacente
Que "gratis e ilimitado" significa confiable: que Oracle no reclamaría *su* instancia idle y que sistemas sin redundancia aguantarían justo cuando dejaron de ser idle.

### Señales tempranas
- Requests >10s sostenidos o errores 429/503 del bot más de 3 veces por semana.
- Uso de disco >70%, o backups cuya restauración nunca se probó con éxito documentado.

---

## Fallo 6 — Nunca se lanza: pivotes y dependencia del fundador

### La historia del fallo
En mayo de 2026 Shirley tenía joyas y clientes potenciales; Ale tenía un monorepo Next.js+Payload llamado Agento. La primera decisión fatal no fue técnica sino de encuadre: el proyecto se trató como un ejercicio de arquitectura, no como una tienda que debía cobrar. V2 murió cuando apareció la promesa de Shopify Hydrogen (v3.0) — "menos código propio" sonó racional. Hydrogen murió en semanas y la reversión a Payload (v3.1) trajo el momento más revelador del proyecto: el servidor tardaba 5-120 segundos por request y los tests Playwright expiraban. Ese era el punto para preguntar "¿estoy construyendo lo correcto?". En cambio, la respuesta fue otro pivote: v3.2, un bot con orquestador propio sobre Groq, luego un plan de migración al Claude Agent SDK vía LiteLLM, y finalmente la política #253 que descartó APIs pagas y el SDK — dejando AGENTS.md afirmando que una migración "en curso" ya estaba muerta. Nadie cerró el ciclo. Mientras tanto, el nav perdía blog, eventos y contacto; eventos volvía como bloque de landing; la colección Events quedaba oculta por error sin revertir. Cada uno de esos micro-cambios consumía las mismas horas escasas que separaban a Nénufar de producción. A los 13 meses: BRD, PRD, SDD, TRD, tres ADRs, specs y diagramas HTML — cero pesos ganados, cero deploys a Netlify completados, todo en localhost:3002. El fallo no fue un colapso; fue una acumulación de decisiones localmente racionales, cada una documentada, ninguna desplegada.

### Supuesto subyacente
Que Ale siempre tendrá tiempo libre y motivación suficiente para terminar él solo el deploy.

### Señales tempranas
1. Ratio docs/código: más documentos (ADRs, specs, diagramas) que commits que acercan un checkout funcional en cualquier semana.
2. Deploys cancelados o pospuestos ≥3 veces seguidas (Netlify ya suma 1; dos más confirman el patrón).

---

## Fallo 7 — Confianza y compliance matan la conversión y luego la marca

### La historia del fallo
A las tres semanas del lanzamiento, Shirley revisó el panel del formulario: 47 visitas al checkout, 9 formularios enviados, 3 transferencias recibidas. El 80% de las abandonadoras escribieron lo mismo por WhatsApp antes de desaparecer: *"¿no hay otra forma de pagar?"*. Ella respondía con paciencia que Nequi era seguro, pero el mensaje ya estaba en el mercado: capturas de la conversación circularon en un grupo de Facebook de Cartagena con el título "cuidado con esta tienda".

La compradora número 12 —Daniela, primera compra, aretes de $89.000 COP— envió su formulario con nombre completo, celular y dirección de su casa. Nunca firmó nada más: no había política de datos visible, solo el checkbox. Su transferencia se cruzó con un fin de semana largo; Shirley, gestionando pedidos sola desde el celular, no registró el envío. El paquete quedó dos semanas en una oficina de Servientrega sin reclamo. Cuando Daniela preguntó, la respuesta llegó tarde y defensiva. Publicó la historia en sus stories: *"Llevan 15 días con mi plata y mi paquete aparece perdido"*. Sus seguidoras —el público exacto de Nénufar— compartieron.

En un mes, tres stories virales y un hilo en X local hicieron más ruido que todo el marketing de Shirley en seis meses. Una marca sin reviews, sin garantías visibles y sin devoluciones definidas no tenía nada que oponer a la evidencia. Las ventas cayeron a cero; las consultas pasaron a ser preguntas sobre "lo del escándalo". Los datos de 31 compradoras quedaron en una hoja de cálculo sin respaldo, sin responsable declarado, esperando el siguiente incidente: una filtración.

### Supuesto subyacente
Que las desconocidas confiarían su dinero —primero, y sus datos después—a una cuenta personal Nequi basándose únicamente en la buena fe percibida de una marca sin historial.

### Señales tempranas
1. Tasa de abandono post-formulario: menos del 40% de formularios enviados terminan en transferencia dentro de 48h.
2. Preguntas repetidas de verificación: >30% de conversaciones incluyen "¿esto es estafa?" o "¿tienes página verificada?".

---

# SÍNTESIS

## 1. El fallo más probable
**Cero demanda (Fallo 4).** Todo el histórico del proyecto apunta ahí: 13 meses de trabajo técnico (ADRs, specs, bots, temas) y cero horas invertidas en adquisición. Aunque el deploy salga perfecto y nada se caiga, sin tráfico calificado el formulario recibirá pedidos solo de conocidas. Es el fallo que ocurre incluso si todo lo demás sale bien.

## 2. El fallo más peligroso
**Pedidos perdidos en silencio (Fallo 2).** Es invisible (no hay error en ningún log), golpea justo las ventas que sí consigue, y cada pedido perdido alimenta directamente el Fallo 7: una compradora ignorada es una story viral esperando a pasar. Combínalo con el Fallo 1 (Shirley responde tarde) y tienes el escenario compuesto más destructivo para una marca sin reputación que defender.

## 3. El supuesto oculto
**Que construir la tienda era el proyecto.** Todos los modos de fallo comparten la misma raíz: se asumió que el software era el trabajo y que la demanda, la operación diaria y la distribución aparecerían solas cuando estuviera listo. No es un supuesto técnico sino de encuadre — y explica por qué 13 meses produjeron arquitectura impecable y cero pesos.

## 4. Plan revisado
| # | Revisión | Fallo que mitiga |
|---|----------|------------------|
| R1 | **Deploy en 14 días, imperfecto.** Congelar pivotes: regla escrita "nada de trabajo de arquitectura nuevo hasta las primeras 10 órdenes reales". Cerrar la contradicción AGENTS.md vs política #253 (marcar la migración SDK como DESCARTADA). | F6 |
| R2 | **Capturar la lista ANTES de lanzar.** QR en la mesa de Shirley en cada feria → grupo/lista de broadcast de WhatsApp. Meta: 50 contactos capturados antes del deploy. Son la demanda inicial. | F4 |
| R3 | **Red de seguridad de pedidos esta misma semana:** cron diario gratis que lista al canal los Orders `pending` >24h + email de respaldo si `sendMessage` falla + ritual de pedido de prueba tras cada deploy. | F2 |
| R4 | **Sesión de operación medida con Shirley:** que suba 5 productos sola, con cronómetro. Si promedia >15 min/producto, priorizar flujo móvil-simple antes de cualquier feature nueva. Revertir YA la colección Events oculta. | F3 |
| R5 | **Reinterpretar la política #253 con precisión:** pasarelas tipo Wompi/PayU no tienen costo fijo (solo % por transacción) — discutir si "gratis" significa "$0 fijo/mes". Si sí, activar Wompi elimina de raíz F1 y F7. Si no, publicar garantías/devoluciones/reviews visibles en la home y guiar el pago con instrucciones paso a paso + confirmación automática por Telegram. | F1, F7 |
| R6 | **Hosting gestionado free en vez de self-hosted frágil:** Vercel free (Next.js) + Neon free (Postgres, con backups) eliminan el riesgo Oracle-idle/OOM/disco lleno. Ambos son $0. Probar UNA restauración de backup y documentarla. | F5 |

## 5. Checklist pre-lanzamiento

1. ☐ **Deploy a producción con dominio + HTTPS**, validado con un pedido end-to-end hecho desde el teléfono de alguien ajeno al proyecto (criterio: la orden aparece en admin Y llega al canal Telegram). *(F6, F2)*
2. ☐ **Ritual post-deploy documentado:** pedido de prueba → verificar mensaje en @pedidos_nenufar → verificar orden en admin. *(F2)*
3. ☐ **Cron diario de pedidos huérfanos** (`pending` >24h → mensaje al canal) + fallback por email si `sendMessage` falla. *(F2)*
4. ☐ **≥50 contactos capturados** en lista de WhatsApp/broadcast antes del lanzamiento + compromiso de 3 posts/semana de contenido. *(F4)*
5. ☐ **Prueba de operación con Shirley** (5 productos solos, cronometrados <15 min c/u) **y una restauración de backup probada y documentada.** *(F3, F5)*

---

*Generado por premortem skill · 2026-08-22 13:26 · Sujeto: plan de lanzamiento de Nénufar (nenufar.co)*
