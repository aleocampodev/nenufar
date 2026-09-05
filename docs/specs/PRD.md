# PRD — Product Requirement Document
**Proyecto:** Nénufar — Joyería Artesanal
**Versión:** 3.2 (Payload CMS + Next.js + Bot multiagente)
**Fecha:** Agosto 2026
**Supersede:** v3.0 (Shopify headless — archivado en `docs/archive/v3.0/PRD.md`)

> Este documento describe el **comportamiento del producto** — qué ven y hacen los usuarios. Las decisiones técnicas (rutas, esquema de base de datos, librerías) viven en el código y en `CLAUDE.md`.

---

## 1. Overview

**Nénufar.co** es la tienda profesional de Shirley. Los compradores exploran el catálogo y el blog, arman y personalizan un pedido, y al enviarlo Shirley recibe una notificación estructurada en Telegram. No hay pago online. Shirley cierra la venta por WhatsApp como siempre lo ha hecho, pero el comprador ya hizo todo el trabajo de intake.

### Rutas del sitio

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/` | Home — hero + bloques CMS | ✅ Funcional (requiere crear página en admin) |
| `/shop` | Catálogo con búsqueda y filtros | ✅ Funcional |
| `/products/[slug]` | Detalle de producto con variantes | ✅ Funcional |
| `/blog` | Listado de artículos | ✅ Funcional |
| `/blog/[slug]` | Artículo individual con rich text | ✅ Funcional |
| `/pedidos/enviar` | Formulario de pedido | ✅ Funcional |
| `/pedidos/enviar/confirmacion` | Pantalla de éxito | ✅ Funcional |
| `/sobre-nenufar` | Historia de la marca | ✅ Funcional (estático) |
| `/contacto` | Información de contacto | ✅ Funcional (estático) |
| `/privacidad` | Política de privacidad Ley 1581 | ✅ Funcional |
| `/terminos` | Términos y condiciones | ✅ Funcional |
| `/eventos` | Próximos eventos | ✅ Funcional (placeholder) |
| `/find-order` | Buscar pedido por ID + email | ✅ Funcional |
| `/(account)/` | Cuenta, pedidos, direcciones | ✅ Funcional |
| `/admin` | Admin de Payload (Shirley) | ✅ Funcional |
| `/telegram/webhook` | Webhook del bot de gestión de Shirley (POST — solo su `chat_id`) | ✅ Funcional (v3.2) |

---

## 2. User Stories

### Comprador — Explorar

| Como... | Quiero... | Para... |
|---------|-----------|---------|
| Comprador | ver el catálogo con fotos y precios en COP | decidir qué comprar sin preguntar |
| Comprador | filtrar por categoría y ordenar por precio | encontrar lo que busco rápido |
| Comprador | abrir el detalle de un producto | ver todas las fotos, descripción y variantes disponibles |
| Comprador | leer el blog de Shirley | conocer la marca y generar confianza antes de pedir |

### Comprador — Pedir

| Como... | Quiero... | Para... |
|---------|-----------|---------|
| Comprador | elegir una variante (talla, material) | obtener exactamente la pieza que quiero |
| Comprador | agregar una nota de personalización | pedir un grabado o instrucción especial |
| Comprador | ver y editar mi carrito con el total en COP | revisar antes de confirmar |
| Comprador | llenar nombre y **número de WhatsApp** | que Shirley me pueda contactar (muchas compradoras no usan Telegram) |
| Comprador | ver confirmación al enviar | saber que el pedido llegó |

### Comprador — Después del pedido

| Como... | Quiero... | Para... |
|---------|-----------|---------|
| Comprador registrado | ver mi historial de pedidos | hacer seguimiento |
| Comprador invitado | buscar mi pedido por ID + email | ver el estado sin cuenta |

### Shirley — Gestión

| Como... | Quiero... | Para... |
|---------|-----------|---------|
| Shirley | recibir cada pedido como un mensaje en Telegram | leer y actuar desde mi celular |
| Shirley | subir fotos de mis joyas al admin | que el catálogo tenga imágenes reales |
| Shirley | crear y editar productos en el admin | mantener el catálogo actualizado |
| Shirley | escribir artículos del blog en el admin | publicar contenido sin tocar código |
| Shirley | ver todos los pedidos en `/admin/collections/orders` | tener un registro consultable |

### Shirley — Bot de gestión por Telegram (v3.2)

El bot es **exclusivamente de Shirley** (autenticado por `chat_id`). Le permite operar la tienda desde el chat sin abrir el admin en el navegador.

| Como... | Quiero... | Para... |
|---------|-----------|---------|
| Shirley | preguntarle al bot "¿qué pedidos tengo pendientes?" | revisar sin abrir el admin |
| Shirley | decirle "confirma el pedido 42" | cambiar el estado desde el chat |
| Shirley | decirle "quedan 2 anillos esmeralda" | actualizar el inventario hablando natural |
| Shirley | pedirle "resumen de hoy" | ver el total de pedidos del día |
| Shirley | buscar un producto por nombre | operar sobre él (stock, precio) |

---

## 3. Functional Requirements

### 3.1 Tienda y catálogo

- El sitio renderiza todas las rutas listadas en §1 en español con precios en COP.
- Los productos no publicados no aparecen en ningún listado público.
- El detalle de producto muestra: galería de fotos (WebP automático), nombre, descripción rich text, precio en COP, variantes disponibles, botón "Agregar al carrito".
- Si una variante tiene inventario = 0, el botón "Agregar al carrito" se deshabilita.
- Las fotos suben automáticamente al admin de Payload y se convierten a WebP (calidad 92) en 4 tamaños: thumbnail 400×500, card 800×1000, hero 1920×1080, og 1200×630.

### 3.2 Blog

- Los artículos se crean desde el admin de Payload con rich text Lexical (texto, imágenes, encabezados, listas).
- Un artículo muestra: título, fecha, imagen de portada, y el contenido rich text completo.
- Cada artículo emite metadatos SEO y Open Graph.
- El listado de blog muestra cards con título, fecha y descripción.

### 3.3 Carrito y personalización

- El comprador puede agregar un producto al carrito con una variante seleccionada.
- Puede agregar atributos de personalización por línea (ej: "Talla: M", "Grabado: Ana").
- Puede agregar una nota general al carrito (instrucciones especiales para Shirley).
- Puede cambiar cantidades y eliminar líneas; el total en COP recalcula en tiempo real.
- **Sin pago, sin formulario de envío** — solo lo necesario para armar el pedido.

### 3.4 Formulario y envío del pedido → Telegram

- La página `/pedidos/enviar` pide: nombre completo, **número de WhatsApp** (contacto principal — muchas compradoras no usan Telegram), nota opcional, y consentimiento.
- Al enviar, el sistema:
  1. Valida los datos y el consentimiento (Ley 1581).
  2. Crea un `Order` en Payload con estado `pending`.
  3. Envía un mensaje HTML estructurado al canal de Telegram de Shirley.
  4. Redirige al comprador a la pantalla de confirmación.
- El envío es **idempotente**: doble clic en el mismo carrito no genera dos pedidos.
- Si Telegram falla, el pedido igual queda en Payload. La confirmación muestra un aviso amarillo ("hubo un problema de notificación, pero tu pedido fue registrado").

### 3.5 Privacidad (transversal — Ley 1581 de 2012)

- `/privacidad` describe: qué datos se recopilan, por qué, quién los ve (Shirley vía Telegram y el admin), y por cuánto tiempo.
- El formulario de pedido tiene un checkbox de consentimiento, **sin marcar por defecto**. El botón de envío está bloqueado hasta que se marque.
- Los datos recopilados se limitan a lo estrictamente necesario: nombre, contacto, y el pedido.

### 3.6 Cuenta de usuario

- Los compradores pueden registrarse y ver su historial de pedidos.
- Los compradores invitados pueden buscar un pedido por ID + email en `/find-order` — el sistema envía un link seguro al email con un `accessToken`.
- Shirley tiene rol `admin` y acceso completo al panel de Payload.

### 3.7 Bot de gestión de Shirley (v3.2)

- El bot vive en el mismo `TELEGRAM_BOT_TOKEN` que envía las notificaciones de pedidos.
- El webhook `POST /telegram/webhook` procesa **solo** mensajes cuyo `chat_id` coincida con `TELEGRAM_ADMIN_CHAT_ID` (Shirley). Cualquier otro remitente se ignora.
- El orquestador (Groq) interpreta el mensaje de Shirley y ejecuta la skill correspondiente sobre Payload; responde a Shirley en el mismo chat.
- Las skills que **escriben** en Payload (confirmar pedido, actualizar stock) son acciones de la propia Shirley expresadas en lenguaje natural — no las ejecuta ninguna compradora.
- **Las compradoras no tienen ningún canal conversacional con el bot** — su recorrido es 100% web.

---

## 4. Non-Functional Requirements

| Categoría | Requisito |
|-----------|-----------|
| Idioma y moneda | Todo el sitio en español (es-CO). Precios en COP formateados con `Intl.NumberFormat('es-CO')`. |
| Mobile-first | Responsive en 375 / 768 / 1280 px. Los compradores de Shirley están en móvil. |
| Imágenes | WebP calidad 92 generado automáticamente. El original siempre se preserva. |
| Rendimiento | LCP < 2s en páginas de catálogo (imágenes WebP + Next.js App Router). |
| Privacidad | Ley 1581 de 2012 — consentimiento explícito + minimización de datos + aviso público. |
| Idempotencia | El formulario de pedido deduplica por `cartId` en una ventana de 10 minutos. |
| Disponibilidad | Sitio autopropelido; el formulario de pedido es un server action de Next.js. |
| Color de marca | Magenta Nénufar `#E91E8C` (secundario `#3B032F`) = token `bg-brand` / `text-brand` en todo el sitio. |
| Fuentes | Playfair Display (serif, títulos) + Inter (sans, cuerpo) + Geist Mono (precios). |

---

## 5. Wireframes / UX

### Flujo principal del comprador

```
Home (hero + productos destacados)
  └─► /shop (grid de productos, filtros)
        └─► /products/[slug] (fotos, variantes, "Agregar al carrito")
              └─► Carrito (panel deslizante)
                    └─► /pedidos/enviar (nombre, contacto, consentimiento)
                          └─► /pedidos/enviar/confirmacion (✓ pedido enviado)
```

### Mensaje que llega a Telegram

```
🔔 Nuevo pedido — Nénufar
━━━━━━━━━━━━━━━━━━━━━━━
🎫 Pedido: #42
📅 14 de agosto de 2026 — 3:15 PM (Bogotá)

👤 Cliente
Nombre: María Quintana
Contacto: +57 321 456 7890

🛒 Items (2)

1. Collar de perlas
   Variantes: Material: Plata
   Cantidad: ×1
   Precio: $85.000

2. Aretes dorados
   Cantidad: ×2
   Precio: $45.000

📝 Nota del pedido
"Para regalo de cumpleaños, envolver en caja bonita"

💰 TOTAL: $175.000 COP
━━━━━━━━━━━━━━━━━━━━━━━
Ver en admin → nenufar.co/admin/collections/orders/42
```

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--brand` | `#E91E8C` (magenta, primario) | Botones CTA, links de marca |
| `--brand-dark` | `#1A0E2E` (índigo negro) | Texto principal, hover de botones |
| `--brand-secondary` | `#3B032F` (violeta profundo) | Footer, tile oscura |
| `--brand-accent` | `#FF4FA3` (rosa claro) | Badges, hovers secundarios |
| `--primary` | `oklch(32% 0.14 45deg)` | Color principal (warm brown) |
| `--accent` | `oklch(58% 0.22 25deg)` | Acento terracota |
| `--background` | `oklch(98.5% 0.003 45deg)` | Fondo off-white cálido |

---

## 6. Acceptance Criteria

### Catálogo (Cap 01, 02)

- **AC-01.1** Dado el catálogo, cuando carga, entonces muestra productos publicados con foto WebP, nombre y precio en COP.
- **AC-01.2** Dado un producto no publicado, cuando cualquier listado carga, entonces ese producto no aparece.
- **AC-01.3** Dado cualquier precio, cuando renderiza, muestra formato COP con `es-CO` (ej: `$85.000`).
- **AC-01.4** Dado el sitio en 375px de ancho, cuando carga, no hay scroll horizontal.
- **AC-01.5** Dado una variante con inventario = 0, el botón "Agregar al carrito" está deshabilitado.

### Blog (Cap 03)

- **AC-02.1** Dado el listado del blog, muestra título, fecha y descripción de cada artículo.
- **AC-02.2** Dado un artículo, muestra el contenido rich text completo (texto, imágenes, encabezados).
- **AC-02.3** Dado un artículo, el `<head>` incluye title, meta description y Open Graph tags.

### Carrito y personalización (Cap 04)

- **AC-04.1** Dado "Agregar al carrito", cuando el comprador elige una variante y hace clic, la línea aparece en el carrito con la variante correcta.
- **AC-04.2** Dado el carrito, cuando el comprador cambia cantidad o elimina una línea, el total en COP recalcula.
- **AC-04.3** Dado el carrito con nota del pedido, cuando se envía, la nota aparece en el mensaje de Telegram.

### Pedido → Telegram (Cap 05)

- **AC-05.1** Dado el formulario vacío, cuando el comprador hace clic en "Confirmar pedido" sin marcar el consentimiento, el envío se bloquea con mensaje de error claro.
- **AC-05.2** Dado un formulario válido, cuando el comprador envía, llega un mensaje estructurado al canal de Telegram con items, variantes, nota, contacto, total en COP y timestamp.
- **AC-05.3** Dado un envío exitoso, el comprador ve la pantalla de confirmación con su nombre.
- **AC-05.4** Dado el comprador hace doble clic en "Confirmar pedido", solo llega un mensaje a Telegram (idempotencia).
- **AC-05.5** Dado un fallo de Telegram, el pedido igual queda en Payload y la confirmación muestra aviso amarillo.

### Privacidad (Cap 06)

- **AC-06.1** Dado `/privacidad`, cuando carga, describe: datos recopilados, finalidad, quién los ve, y retención.
- **AC-06.2** Dado el formulario de pedido, el checkbox de consentimiento está sin marcar por defecto.

### Bot de gestión de Shirley (v3.2)

- **AC-08.1** Dado que **Shirley** escribe "¿qué pedidos pendientes tengo?", el bot lista los pedidos con estado `pending`.
- **AC-08.2** Dado que Shirley escribe "confirma el 42", el bot cambia el estado del pedido 42 a `confirmed` en Payload y confirma la acción.
- **AC-08.3** Dado que Shirley escribe "quedan 2 anillos esmeralda", el bot actualiza el stock del producto correspondiente.
- **AC-08.4** Dado un mensaje de un `chat_id` que **no es el de Shirley**, el webhook responde 200 y **no procesa nada**.
- **AC-08.5** Dado un mensaje sin secreto válido en el header, el webhook responde 401 y no procesa nada.
- **AC-08.6** Dado un mensaje duplicado (mismo `update_id`), el bot no ejecuta la acción dos veces.

### Imágenes (Cap 07)

- **AC-07.1** Dado una imagen subida al admin, cuando guarda, se generan variantes WebP en `public/media/` (thumbnail, card, hero, og).
- **AC-07.2** Dado el grid de productos, las imágenes sirven en formato WebP tamaño `card`.
- **AC-07.3** Dado el hero de una página, la imagen sirve en formato WebP tamaño `hero`.

---

## 7. Dependencies & Milestones

### Dependencias activas

| Dependencia | Estado | Notas |
|-------------|--------|-------|
| PostgreSQL corriendo | ✅ Local (docker-compose) | Pendiente servidor en producción |
| Variables de entorno (core) | ⚠️ Pendiente | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHANNEL_ID` sin configurar |
| Variables de entorno (v3.2) | ⚠️ Pendiente | `GROQ_API_KEY` + `TELEGRAM_WEBHOOK_SECRET` sin configurar |
| Bot de Telegram | ⚠️ Pendiente | Crear con `@BotFather`, agregar al canal, registrar webhook |
| Fotos reales de Shirley | ⚠️ Pendiente | Recibir vía Google Drive |
| Dominio `nenufar.co` | ⚠️ Pendiente | Para deploy en producción |

### Estado de funcionalidades (Agosto 2026)

| Funcionalidad | Estado |
|---------------|--------|
| Tienda y catálogo | ✅ Completo |
| Carrito + personalización | ✅ Completo |
| Formulario de pedido | ✅ Completo |
| Envío a Telegram | ✅ Implementado — pendiente configurar bot |
| Confirmación de pedido | ✅ Completo |
| Blog (listado + artículo) | ✅ Completo |
| Cuenta de usuario | ✅ Completo |
| Admin de Payload (Shirley) | ✅ Completo |
| Conversión de imágenes a WebP | ✅ Completo |
| Bot de gestión de Shirley (v3.2) | ⚙️ Runtime slice 1 listo — pendiente auth por chat_id + skills de gestión + config (GROQ_API_KEY, webhook) |
| Home page con fotos reales | ⚠️ Pendiente — crear desde admin |
| Fotos reales de productos | ⚠️ Pendiente — subir desde Drive |
| Bot de Telegram activo | ⚠️ Pendiente — configurar |
| Analytics | ❌ No implementado |
| Deploy en producción | ❌ No implementado |
| Rate limiting | ❌ No implementado |

---

## 8. Roadmap futuro (fuera de scope v3.2)

| Fase | Funcionalidad | Descripción |
|------|---------------|-------------|
| v3.3 | RAG del catálogo (Supabase) | `buscarProducto` pasa de búsqueda por título a búsqueda semántica: embeddings locales (Transformers.js) + pgvector en Supabase. Diseño en [`docs/RAG-MEMORY-design.md`](RAG-MEMORY-design.md). |
| v3.3 | Formulario en /contacto | Conectar el bloque de formulario existente con envío a email o Telegram. |
| v3.3 | Analytics | Umami o Plausible (self-hosted, privacy-first) para medir tráfico al catálogo. |
| v3.4 | MCP para el CMS | Exponer Payload como herramientas MCP para que los agentes consulten y actualicen el catálogo de forma estructurada. |
| v4.0 | Memoria de conversación (Supabase) | El bot recuerda los últimos turnos por `chat_id` (tabla en Supabase) → multi-turn para Shirley. Diseño en [`docs/RAG-MEMORY-design.md`](RAG-MEMORY-design.md). |
| v4.0 | Rate limiting | Evitar spam en formulario de pedidos y en el webhook del bot. |
| v5.0 | Wompi / PSE | Pasarela de pago colombiana si el volumen lo justifica. |
