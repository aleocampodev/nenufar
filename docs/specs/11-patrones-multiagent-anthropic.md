# Patrones Multi-Agente — Referencia de Anthropic

**Proyecto:** Nénufar — Bot Concierge (@NenufarAdminBot)
**Versión:** v1 · 2026-08-20
**Fuente:** [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (Anthropic Engineering, Jun 2025)
**Propósito:** Extraer los patrones que aplicamos al diseño del bot. Cada patrón incluye **cómo se traduce a Nénufar**. Este documento es norma de referencia: cuando haya duda de diseño en el bot, se consulta este archivo.

---

## 0. Decisión de arquitectura que motiva este doc

- **Un solo bot:** @NenufarAdminBot (bidireccional). El bot @NenufarPedidosBot se **elimina**; la notificación de pedidos la absorbe el AdminBot.
- Arquitectura **orchestrator-worker** (lead agent + subagentes), como en el artículo.

---

## 1. Patrones de arquitectura

### P1 — Orchestrator-worker (lead agent + subagententes)

**Qué dice Anthropic:** un lead agent planifica y delega a subagentes especializados que corren en paralelo, cada uno con su propia ventana de contexto, y devuelven resultados comprimidos al lead.

**Nénufar:** el orquestador (Agent SDK `query()`) recibe el mensaje de Telegram, resuelve el rol por `chat.id` y delega a los subagentes ya definidos en `03-SDD.md`:

| Subagente | Modelo | Responsabilidad |
|---|---|---|
| Catálogo | Haiku | Búsqueda y consulta de productos (lectura) |
| Pedido | Sonnet | Creación de pedidos (escritura, con gates) |
| Gestión | admin | Confirmar pedidos, uploads (solo Shirley) |

**Regla:** cada subagente tiene su propio contexto → el catálogo completo (grande) nunca satura la ventana del orquestador. El subagente comprime: devuelve al lead solo la lista relevante, no los documentos crudos.

### P2 — Comprimir es la esencia

**Qué dice:** el valor del subagente es *destilar* información de un corpus grande en pocos tokens útiles para el lead.

**Nénufar:** `buscar_productos` nunca devuelve el producto completo (descripciones Lexical, todas las imágenes, todas las variantes). Devuelve: id, título, slug, precio COP, stock, categoría — lo mínimo para que el lead (o el cliente) decida. El detalle completo solo si se pide explícitamente.

### P3 — Separación de responsabilidades por subagente

**Qué dice:** cada subagente tiene tools, prompts y trayectorias distintas → reduce dependencia de camino y evita duplicación.

**Nénufar:** Catálogo **solo lee** (no tiene tools de escritura). Pedido **solo escribe pedidos** (no toca productos). Gestión tiene tools administrativas con gate de rol. Un subagente no puede hacer el trabajo de otro por diseño — el toolset lo impide, no el prompt.

---

## 2. Patrones de prompting

### P4 — Enseñar al orquestador a delegar bien

**Qué dice:** instrucciones cortas y vagas → subagentes que duplican trabajo o dejan huecos. Cada delegación necesita: **objetivo, formato de salida, tools/fuentes a usar, límites claros de la tarea**.

**Nénufar:** el prompt del orquestador incluye plantillas de delegación. Ejemplo malo: "buscá collares". Ejemplo bueno: "buscá en el catálogo piezas de la categoría 'collares' con stock > 0, devolvé id, título, precio COP y slug, máximo 5 resultados, no incluyas descripciones".

### P5 — Escalar el esfuerzo a la complejidad

**Qué dice:** los agentes no juzgan bien cuánto esfuerzo gastar. Reglas explícitas en el prompt: pregunta simple = 1 agente, 3–10 tool calls; comparación = 2–4 subagentes; investigación compleja = 10+.

**Nénufar (reglas de escala del orquestador):**
- Saludo / pregunta de horario → responder directo, **0 tools**.
- "¿Tenés aretes?" → 1 subagente Catálogo, 1–2 calls.
- "Quiero pedir este collar talla 7 con grabado" → 1 Catálogo (verificar) + 1 Pedido (crear).
- "Armame un pedido con varias piezas y compará opciones" → subagentes en paralelo.
- **Nunca** spawnear subagentes "por si acaso" — cada uno cuesta tokens (~15× un chat según Anthropic).

### P6 — Guiar el proceso de pensamiento (extended/interleaved thinking)

**Qué dice:** el lead usa thinking para planificar (qué tools, cuántos subagentes, roles); los subagentes usan thinking intercalado después de cada tool result para evaluar calidad y ajustar la siguiente query.

**Nénufar:** habilitar thinking en el orquestador (plan de delegación) y en el subagente Pedido (verificación de datos del cliente antes de `crear_pedido` — el thinking es el checkpoint de calidad, la tool es la acción irreversible).

### P7 — Empezar ancho, luego angostar

**Qué dice:** los agentes tienden a queries largas y específicas que devuelven poco. Invertirlo: query corta y amplia primero, evaluar, luego refinar.

**Nénufar:** `buscar_productos` con query vacía o categoría sola primero; solo refinar por texto si los resultados amplios no alcanzan. Documentado en la descripción de la tool (ver P9).

---

## 3. Patrones de tools

### P8 — El diseño de tools es tan crítico como el de UIs

**Qué dice:** una tool mal descrita manda al agente por un camino completamente equivocado. Cada tool necesita propósito único y descripción clara. Dar heurísticas explícitas de selección.

**Nénufar:** mínimo viable Etapa 1 — cada una con contrato en `04-TSD.md`:

| Tool | Propósito único | Notas de diseño |
|---|---|---|
| `buscar_productos` | Lectura del catálogo | Descripción incluye P7 (ancho→angosto) y P2 (qué devuelve) |
| `crear_pedido` | Escritura de pedido | **El monto lo calcula el servidor**, no el modelo (05-seguridad) |

**Anti-patrón prohibido:** una tool "hacer_cualquier_cosa" que acepte SQL o queries arbitrarias.

### P9 — Las tools definen el permiso, no el prompt

**Nénufar:** el gate de consentimiento (Ley 1581) y la idempotencia viven **dentro** de `crear_pedido`, no en el prompt del orquestador. Aunque el modelo "se salte" una instrucción, la tool la exige. Determinismo donde importa; heurísticas donde no.

---

## 4. Patrones de evaluación

### P10 — Evals chicos desde el día 1

**Qué dice:** en desarrollo temprano los efectos son enormes (un prompt puede ir de 30% a 80%). ~20 casos representativos alcanzan. No esperar la "eval grande".

**Nénufar:** ya definido en `07-evals.md` (E1–E20, LLM-juez, seguridad ≥ 0.95). Correrlos **en cada cambio de prompt**, no "cuando termine".

### P11 — LLM-as-judge con rúbrica simple

**Qué dice:** un solo LLM call con un solo prompt, scores 0.0–1.0 + pass/fail — más consistente que múltiples jueces. Criterios: exactitud, completitud, calidad de fuentes, eficiencia de tools.

**Nénufar:** adaptar la rúbrica: ¿el pedido creado coincide con lo pedido? ¿pidió consentimiento antes de PII? ¿usó las tools correctas un número razonable de veces? ¿el monto lo calculó el servidor?

### P12 — Evaluación de estado final (end-state), no del camino

**Qué dice:** en agentes que mutan estado, evaluar el **resultado final**, no cada paso. Varios caminos válidos llegan al mismo resultado.

**Nénufar:** el eval de `crear_pedido` verifica el estado de la base (pedido creado, ítems correctos, total correcto, consentimiento registrado), no la secuencia de mensajes del bot. Checkpoints discretos cuando un cambio de estado específico debió ocurrir.

### P13 — Evaluación humana para lo que la automatización no ve

**Nénufar:** Shirley (o Ale) prueba el bot manualmente cada tanto — especialmente casos límite: coloquialismos colombianos, pedidos a medias, cambios de opinión a mitad de conversación.

---

## 5. Patrones de producción / confiabilidad

### P14 — Los agentes son stateful y los errores se componen

**Qué dice:** un fallo menor puede descarrilar todo el trayecto. Necesitamos: retomar desde donde falló, retries, checkpoints, y avisarle al agente cuando una tool falla para que se adapte.

**Nénufar:**
- Si `crear_pedido` falla, el mensaje de Telegram queda respondido con error claro (no silencio).
- La tool devuelve errores **descriptivos** ("stock insuficiente en la variante talla 7") para que el subagente se adapte y ofrezca alternativas — no un 500 genérico.
- Idempotencia existente (`idempotency.ts`) = checkpoint contra duplicación.

### P15 — Observabilidad completa de decisiones

**Qué dice:** sin tracing no se puede diagnosticar por qué un agente falló. Monitorear patrones de decisión e interacciones.

**Nénufar:** ya en la Definición de Done (10-operacion-y-costos): log de cada tool call (nombre, args, duración, resultado), tokens por turno, y rol del chat. Privacidad: loguear **metadatos**, no contenido de conversaciones de clientas.

### P16 — Presupuesto de tokens como defensa

**Qué dice:** multi-agente gasta ~15× los tokens de un chat. Solo vale para tareas de valor alto. `maxTurns` y spend cap son obligatorios.

**Nénufar:** `maxTurns` en cada `query()` + **spend cap en la consola de Anthropic antes de la primera corrida** (regla dura del HANDOFF). Presupuesto por conversación estimado en 10-operacion-y-costos.

### P17 — Deploy sin romper conversaciones en curso

**Qué dice:** rainbow deployments — no actualizar todo a la vez; el agente puede estar a mitad de tarea.

**Nénufar (Etapa 1, baja exigencia):** el bot corre en contenedor (Oracle Cloud Always Free). Al deployar, drenar: terminar conversaciones activas (timeout corto) antes de reiniciar. Documentar el procedimiento en el runbook del contenedor.

---

## 6. Anti-patrones que Anthropic sufrió (y evitamos)

| Anti-patrón observado por Anthropic | Nuestra defensa |
|---|---|
| Spawner 50 subagentes para una pregunta simple | P5: reglas de escala en el prompt del orquestador |
| Buscar indefinidamente fuentes inexistentes | `maxTurns` + P5 (presupuesto de esfuerzo) |
| Subagentes que se distraen entre sí | P3: subagentes aislados, no conversan entre ellos — solo con el lead |
| Elegir fuentes SEO-basura sobre autorizadas | N/A para catálogo propio; análogo: priorizar Payload (fuente de verdad) sobre contexto del modelo — el modelo **nunca** "recuerda" stock o precios |
| Prompts como reglas rígidas | Prompts como **heurísticas + marcos de colaboración** con guardrails deterministas (P9) |

---

## 7. Checklist de aplicación (Etapa 1)

Al implementar `apps/bot`, verificar:

- [ ] P1: orquestador delega a subagentes con contexto separado
- [ ] P2: `buscar_productos` devuelve resúmenes, no documentos completos
- [ ] P4: plantillas de delegación (objetivo + formato + límites) en el prompt del lead
- [ ] P5: reglas de escala (cuántos subagentes por tipo de query) en el prompt del lead
- [ ] P8/P9: descripciones de tools según este doc; gates dentro de las tools
- [ ] P10/P11/P12: evals E1–E20 corriendo con LLM-juez, evaluación end-state
- [ ] P14: errores de tool descriptivos; idempotencia activa
- [ ] P15: logs de tool calls + tokens
- [ ] P16: `maxTurns` seteado + spend cap verificado en consola

---

## Referencias

- Artículo original: https://www.anthropic.com/engineering/multi-agent-research-system
- Prompts open-source del sistema (Anthropic Cookbook): https://platform.claude.com/cookbook/patterns-agents-basic-workflows
- Specs internas: `03-SDD.md` (arquitectura), `04-TSD.md` (tools), `05-seguridad-guardrails.md`, `07-evals.md`, `10-operacion-y-costos.md`
