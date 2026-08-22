# SPEC-002: Management Bot Runtime & MCP Tools Subsystem

* **Author:** Engineering Team
* **Status:** Migration Target (Phase 4 SDLC)
* **Related ADR:** [ADR-002](../adr/ADR-002-claude-agent-sdk-litellm-groq.md)
* **Primary Source Files:**
  * `src/app/(app)/telegram/webhook/route.ts`
  * `src/lib/agent/runShirleyAgent.ts`
  * `src/lib/agent/tools.ts`
  * `litellm/config.yaml`
  * `docker-compose.yml`

---

## 1. System Overview & Security Guard

The Management Bot is Shirley's mobile operating tool on Telegram. It processes natural language messages, extracts parameters, and executes typed tools directly on Payload CMS via `@anthropic-ai/claude-agent-sdk` and LiteLLM (`:4000`) on Groq Llama 3.3 70B ($0 cost).

### Security Architecture:
* **Webhook Secret Token:** Validates the `X-Telegram-Bot-Api-Secret-Token` header against `process.env.TELEGRAM_WEBHOOK_SECRET`.
* **Single-Admin Guard:** Rejects any incoming message where `update.message.chat.id !== Number(process.env.TELEGRAM_ADMIN_CHAT_ID)` with a silent `200 OK`.
* **Deduplication:** Tracks the last 1,000 `update_id`s in an in-memory Set to avoid duplicate processing on Telegram delivery retries.

---

## 2. In-Process MCP Tool Definitions (Catalog & Operations)

The bot exposes 7 typed tools using Zod schemas:

### 1. `buscarProducto`
* **Purpose:** Find jewelry pieces by natural language criteria (material, price, category).
* **Zod Schema:**
  ```typescript
  z.object({
    query: z.string().describe('Search term e.g. "collar plata" or "esmeralda"'),
    category: z.string().optional().describe('Category slug e.g. "collares", "aretes"'),
  })
  ```
* **Payload Action:** `payload.find({ collection: 'products', where: { title: { like: query } } })`.

### 2. `destacarProducto`
* **Purpose:** Highlight or un-highlight a product on the landing page featured block.
* **Zod Schema:**
  ```typescript
  z.object({
    slug: z.string().describe('Product slug identifier'),
    featured: z.boolean().describe('True to highlight on landing, false to remove'),
  })
  ```
* **Payload Action:** `payload.update({ collection: 'products', where: { slug }, data: { featured } })`.

### 3. `actualizarInventario`
* **Purpose:** Instant stock and COP price adjustment.
* **Zod Schema:**
  ```typescript
  z.object({
    slug: z.string().describe('Product slug identifier'),
    stock: z.number().int().nonnegative().optional().describe('New inventory count'),
    priceInCOP: z.number().int().positive().optional().describe('New price in Colombian Pesos'),
  })
  ```
* **Payload Action:** `payload.update({ collection: 'products', where: { slug }, data: { stock, priceInCOP } })`.

### 4. `pedidosPendientes`
* **Purpose:** List all open orders currently awaiting Shirley's confirmation.
* **Zod Schema:** `z.object({})`
* **Payload Action:** `payload.find({ collection: 'orders', where: { status: { equals: 'processing' } } })`.

### 5. `confirmarPedido`
* **Purpose:** Mark an order as paid and completed once Nequi/Daviplata transfer is verified.
* **Zod Schema:**
  ```typescript
  z.object({
    orderId: z.string().describe('Order ID number'),
  })
  ```
* **Payload Action:** `payload.update({ collection: 'orders', id: orderId, data: { status: 'completed' } })`.

### 6. `publicarEvento`
* **Purpose:** Add an upcoming artisan pop-up or fair in Cartagena to the landing page.
* **Zod Schema:**
  ```typescript
  z.object({
    title: z.string().describe('Event name e.g. "Feria de Las Bóvedas"'),
    date: z.string().describe('Event date (YYYY-MM-DD)'),
    location: z.string().describe('Location e.g. "Getsemaní, Cartagena"'),
  })
  ```
* **Payload Action:** `payload.create({ collection: 'events', data: { title, date, location } })`.

### 7. `crearProductoDraft`
* **Purpose:** Create a draft product record from a photo sent on Telegram.
* **Zod Schema:**
  ```typescript
  z.object({
    title: z.string().describe('Product title'),
    priceInCOP: z.number().int().positive().describe('Price in COP'),
    mediaId: z.string().describe('Uploaded Media ID'),
  })
  ```
* **Payload Action:** `payload.create({ collection: 'products', data: { title, priceInCOP, gallery: [mediaId], _status: 'draft' } })`.

---

## 3. Resilience & Turn Bounds

* **Max Turns:** Bounded to `maxTurns: 4` to prevent runaway LLM loops.
* **Fallback Recovery:** Catches Groq HTTP 429/500 errors and transparently routes to Google Gemini 2.0 Flash via LiteLLM.
* **Final Response:** Always delivered asynchronously via `sendTelegramReply(chatId, message)`.
