# SDD — Software Design Document

**Proyecto:** Bot Concierge de Nénufar
**Versión:** v1 · 2026-08-18
**Estado:** Borrador
**Deriva de:** [PRD](./02-PRD.md)

---

## 1. Vista de arquitectura

Diagrama vivo: <https://claude.ai/code/artifact/ab3e9525-3e45-4cce-97d2-68a7868d9af5>

```
Cliente / Shirley
      │  (Telegram, 2 vías)
      ▼
┌─────────────────────────────────────────────┐
│ EDGE · Vercel / Next.js (ingress, stateless) │
│  webhook: verifica secret · resuelve ROL      │
│  por chat.id · reenvía turno                  │
└───────────────┬──────────────────────────────┘
                ▼
┌─────────────────────────────────────────────┐
│ CONTENEDOR · Claude Agent SDK (long-running)  │
│  Orquestador query()  [Etapa 1]               │
│    · system prompt por rol · maxTurns         │
│  Sesión por chat (SessionStore)               │
│  Subagentes: catálogo · pedido · gestión [E3] │
└───────┬───────────────────────┬───────────────┘
        │ tool calls            │ retrieval [E2]
        ▼                       ▼
  Herramientas → Payload    RAG · pgvector
  Local API  [E1]           (buscar_conocimiento)
        │                       │
        ▼                       ▼
   PostgreSQL (orders · carts · products · + pgvector)   +   Payload CMS
        │
        └──► aviso saliente al canal de Shirley (conservado)
```

## 2. Componentes

| Componente | Responsabilidad | Etapa |
|-----------|-----------------|-------|
| **Edge webhook** | Recibir updates de Telegram, verificar secret, resolver rol, reenviar | 1 |
| **Orquestador (query)** | Correr el agent loop con system prompt por rol y `maxTurns` | 1 |
| **Herramientas de dominio** | Puente tipado a Payload Local API (lectura/escritura validada) | 1 |
| **Cliente Telegram** | Enviar respuestas y avisos (`sendMessage`, `sendPhoto`) | 1 |
| **SessionStore** | Persistir transcript por `chat.id` entre reinicios | 1–2 |
| **RAG / pgvector** | Indexar y recuperar conocimiento (embeddings) | 2 |
| **Subagentes** | Tareas especializadas delegadas por el orquestador | 3 |

## 3. Resolución de rol

```
rol = (chatId === TELEGRAM_ADMIN_CHAT_ID) ? "admin" : "cliente"
```

El rol selecciona: (a) el **system prompt**, y (b) el **set de tools/subagentes** habilitados.
Un solo bot, un solo token, un solo servicio.

## 4. Flujo (Etapa 1) — secuencia

```
Cliente → Telegram → Edge(webhook)
  Edge: verifica secret → extrae chatId, text → resuelve rol
  Edge → Servicio-bot: { chatId, rol, text }
  Servicio-bot: query({ systemPrompt(rol), tools, maxTurns })
     loop:
        modelo → tool_use? → ejecuta tool (Payload Local API) → tool_result → modelo
     modelo → texto final
  Servicio-bot → Telegram.sendMessage(chatId, textoFinal)
  [si se creó pedido] → Telegram.sendMessage(canalShirley, aviso)
```

## 5. Modelo de datos

**Reutilizado (Payload, sin cambios en Etapa 1):**
- `products` — catálogo (título, precio COP, variantes, galería).
- `carts` — carrito (items, subtotal, note).
- `orders` — pedido (items, amount, currency, status, shippingAddress con nombre/WhatsApp).

**Nuevo:**

- `conversations` *(Etapa 1–2, opcional en E1)* — implementa el `SessionStore`.
  | Campo | Tipo | Notas |
  |-------|------|-------|
  | `id` | uuid/serial | PK |
  | `chatId` | text | **único**; identifica la sesión de Telegram |
  | `rol` | enum(`cliente`,`admin`) | rol resuelto |
  | `messages` | jsonb | `[{ role, content, ts }]` (transcript) |
  | `createdAt` / `updatedAt` | timestamptz | para purga por retención (ver [operación §4](./10-operacion-y-costos.md)) |

- `knowledge_chunks` *(Etapa 2)* — requiere extensión **pgvector**.
  | Campo | Tipo | Notas |
  |-------|------|-------|
  | `id` | uuid/serial | PK |
  | `content` | text | fragmento indexable |
  | `embedding` | `vector(N)` | N depende del modelo (ver nota) |
  | `source` | text/ref | pieza, post o página de Payload de origen |
  | `metadata` | jsonb | título, tipo, url |
  | índice | ivfflat / hnsw | sobre `embedding` |

  > **Nota de alineación:** ya existe una branch `feat/vector-indexing-gemini`. El RAG debería
  > usar **embeddings de Gemini** (p. ej. `text-embedding-004`, dimensión **768**) para ser
  > consistente con ese trabajo. `N` = dimensión del modelo elegido.

## 6. Decisiones de diseño (ADR breves)

- **ADR-1 · Claude Agent SDK** (no API Tool Runner puro): el objetivo de aprendizaje pide el
  SDK con subagentes nativos. Consecuencia: el servicio-bot es **long-running** (contenedor),
  no serverless.
- **ADR-2 · Edge separado del contenedor:** Vercel recibe el webhook (barato, rápido, stateless)
  y reenvía al contenedor. Desacopla ingreso de cómputo.
- **ADR-3 · Tools sobre Payload Local API** (no acceso directo a DB): toda escritura pasa por
  validación; el modelo nunca ejecuta SQL.
- **ADR-4 · RAG con pgvector** (no un vector store nuevo): reusa el Postgres existente → sin
  infra adicional ni costo.
- **ADR-5 · Reuso del núcleo actual:** `validateConsent`, `idempotency`, `order-formatter`,
  `telegram` se reutilizan; el bot es una nueva **capa de entrada**, no un reemplazo.
- **ADR-6 · Acceso a Payload desde el contenedor del bot:** la Local API corre en cualquier
  proceso Node con el `payload.config` + `DATABASE_URL` (no está atada a Next). El bot usa
  Local API importando el config compartido (monorepo). Alternativa: REST/GraphQL por HTTP.
  Migraciones: solo `apps/web`. Detalle en [09-estructura-proyecto](./09-estructura-proyecto.md).

## 7. Hosting

- **Edge:** Vercel (Hobby, free).
- **Servicio-bot:** contenedor long-running (local mientras se aprende; luego Fly.io/Railway).
  El Agent SDK levanta un subproceso `claude` con estado en disco → **no serverless**.
- **DB:** PostgreSQL (Docker en dev; plano free tipo Supabase/Neon en prod). pgvector en Etapa 2.

## 8. Seguridad y cumplimiento

- Verificación del header `X-Telegram-Bot-Api-Secret-Token`.
- Gate de consentimiento (Ley 1581) antes de crear pedidos.
- Rate-limit por `chat.id`; `maxTurns` para acotar loops.
- Secretos (`ANTHROPIC_API_KEY`, token de Telegram) fuera del alcance del modelo.

## 9. Reuso de código existente

| Módulo actual | Uso en el bot |
|---------------|---------------|
| `src/lib/consent.ts` | Gate de consentimiento en `crear_pedido` |
| `src/lib/idempotency.ts` | Evitar pedidos duplicados |
| `src/lib/order-formatter.ts` | Mensaje del pedido para el canal de Shirley |
| `src/lib/telegram.ts` | Envío (extender para aceptar `chatId`) |
| Payload Local API | Fuente de datos de todas las tools |
