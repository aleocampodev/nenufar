# PRD — Product Requirements Document

**Proyecto:** Bot Concierge de Nénufar
**Versión:** v1 · 2026-08-18
**Estado:** Borrador
**Deriva de:** [BRD](./01-BRD.md)

---

## 1. Resumen del producto

Un **bot de Telegram único** que conversa con clientes y asiste a Shirley, potenciado por el
**Claude Agent SDK**. Distingue a quién atiende por el `chat.id`:

- Chat de Shirley → **rol admin** (gestión).
- Cualquier otro chat → **rol cliente** (consulta y pedido).

## 2. Personas

**Valentina (clienta).** Ve una pieza en Instagram, quiere saber precio, si hay en plata,
y si se puede personalizar. Espera respuestas rápidas y cercanas, sin fricción ni pagos raros.

**Shirley (dueña/admin).** Recibe muchos mensajes. Quiere que el bot le resuma pedidos
pendientes, le redacte respuestas y le deje cambiar estados sin entrar al panel.

## 3. User stories por etapa

### Etapa 1 — Agente + herramientas
- **US1.1** Como *clienta*, quiero preguntar por piezas ("¿tenés aretes de plata?") y que el
  bot me muestre opciones con precio, para decidir sin esperar a Shirley.
- **US1.2** Como *clienta*, quiero armar un pedido por el chat (elegir pieza, dar mi nombre y
  WhatsApp, **aceptar el consentimiento**) y que quede registrado.
- **US1.3** Como *Shirley*, quiero que al crearse un pedido me llegue el aviso al canal como hoy.
- **US1.4** Como *sistema*, si la clienta reenvía el pedido, no debe duplicarse (idempotencia).

### Etapa 2 — RAG
- **US2.1** Como *clienta*, quiero preguntar "¿cómo cuido la plata?" o "¿cuánto tarda un
  personalizado?" y recibir respuestas **fundamentadas** en la info real de Nénufar.
- **US2.2** Como *Shirley*, quiero mantener esa base de conocimiento desde contenido que ya
  administro (páginas/blog de Payload).

### Etapa 3 — Multiagente
- **US3.1** Como *Shirley*, quiero pedir "revisá los pendientes de +3 días y redactá un mensaje
  para cada cliente" y que el bot lo haga delegando en subagentes.
- **US3.2** Como *Shirley*, quiero cambiar el estado de un pedido y pedir un resumen del día.

## 4. Requisitos funcionales

| ID | Requisito | Etapa |
|----|-----------|-------|
| RF1 | Recibir mensajes entrantes de Telegram (webhook con secret) | 1 |
| RF2 | Resolver rol (cliente/admin) por `chat.id` | 1 |
| RF3 | Tool `buscar_productos` (lectura de catálogo Payload) | 1 |
| RF4 | Tool `crear_pedido` con gate de consentimiento + idempotencia | 1 |
| RF5 | Responder al usuario por Telegram (`sendMessage`) | 1 |
| RF6 | Conservar el aviso saliente de pedido al canal de Shirley | 1 |
| RF7 | Tool `buscar_conocimiento` sobre base vectorial (pgvector) | 2 |
| RF8 | Ingesta/indexado de conocimiento desde Payload | 2 |
| RF9 | Subagentes especializados (catálogo, pedido, gestión) | 3 |
| RF10 | Tools admin: `listar_pedidos`, `cambiar_estado`, `resumen_dia`, `redactar_respuesta` | 3 |

## 5. Requisitos no funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RNF1 | **Privacidad** | Consentimiento explícito (Ley 1581) antes de persistir PII. Reusa `validateConsent`. |
| RNF2 | **Costo** | Infra en planes free; modelos baratos por defecto (Haiku); spend cap; `maxTurns`. |
| RNF3 | **Seguridad** | Verificar secret del webhook; el modelo nunca toca la DB directo (solo vía tools). |
| RNF4 | **Idempotencia** | Reenvíos no duplican pedidos. Reusa `idempotency`. |
| RNF5 | **Moneda** | COP sin decimales (`Intl.NumberFormat('es-CO')`). Reusa `order-formatter`. |
| RNF6 | **Idioma/tono** | Español rioplatense-neutro cálido, cercano al de la marca. |
| RNF7 | **Observabilidad** | Logs de tool calls; OTEL cuando pase a contenedor. |

## 6. Criterios de aceptación (Etapa 1)

- [ ] Un mensaje desde un chat cliente dispara una respuesta del agente.
- [ ] "¿Tenés X?" devuelve piezas reales del catálogo con precio en COP.
- [ ] Un flujo de pedido crea una `Order` en Payload con estado inicial y **muestra el
      texto de consentimiento**; sin aceptación, no crea nada.
- [ ] Se envía el aviso al canal de Shirley al crear el pedido.
- [ ] Reenviar el mismo pedido no crea un segundo (idempotencia).
- [ ] Un mensaje desde el chat de Shirley se trata como **admin** (aunque en Etapa 1 las tools
      admin aún no existan, el rol se resuelve).

## 7. Fuera de alcance (por ahora)

- Pagos online, otros canales, envíos.
- Multi-idioma.
- Sesiones persistentes avanzadas (Etapa 1 puede usar memoria simple).
