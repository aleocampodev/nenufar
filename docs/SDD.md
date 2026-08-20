# SDD — Software Design Document
**Project:** Nénufar — Handcrafted Jewelry Store
**Version:** 1.0
**Date:** August 2026
**Audience:** Tech Lead, Senior Developers, Architect

---

## 1. High-Level Architecture

Nénufar is a **monolithic full-stack application** running Next.js and Payload CMS in the same Node.js process. There are no microservices, no external API backends — everything lives in one deployed unit.

```
┌─────────────────────────────────────────────────────┐
│                  Browser / Mobile                   │
└──────────────┬──────────────────────┬───────────────┘
               │ HTTP (App Router)    │ HTTP (/admin)
┌──────────────▼──────────────────────▼───────────────┐
│              Next.js 15 (Node.js process)            │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │  App Router (RSC)   │  │   Payload CMS v3       │ │
│  │  /shop, /blog,      │  │   Admin UI + REST API  │ │
│  │  /pedidos,          │  │   /api/[collection]    │ │
│  │  /telegram/webhook  │  │                        │ │
│  └──────────┬──────────┘  └──────────┬─────────────┘ │
│             │                        │                │
│             └──────────┬─────────────┘                │
│                        │ Payload Local API             │
│  ┌─────────────────────▼──────────────────────────┐   │
│  │              PostgreSQL (Drizzle ORM)           │   │
│  └────────────────────────────────────────────────┘   │
│             │                        │                │
│             │ sendMessage (orders)   │ Groq API       │
│             ▼                        ▼  (agents)      │
│     Telegram Channel          llama-3.3-70b           │
│     (Shirley's phone)                                  │
└─────────────────────────────────────────────────────┘
               ▲
               │ POST /telegram/webhook (Shirley's admin messages)
        Telegram Bot API
```

**Key design constraints:**
- No payment gateway — Shirley coordinates manually via WhatsApp.
- Single bot (`TELEGRAM_BOT_TOKEN`) serves both order notifications (outbound to Shirley) and Shirley's admin assistant (inbound from Shirley only).
- Buyers never touch the bot — they stay on the web (catalog + cart + form) and leave a WhatsApp number.
- Groq free tier — no infra cost for the AI layer.
- No Redis, no queues — keeps operational complexity at zero.

---

## 2. Module Breakdown

### 2.1 Frontend — App Router (`src/app/(app)/`)

| Module | Route | Responsibility |
|--------|-------|----------------|
| Home | `/` | CMS-driven page (page builder blocks) |
| Shop | `/shop` | Product catalog, search, sort, filter by category |
| Product | `/products/[slug]` | Product detail, variant selector, add to cart |
| Cart | (drawer) | Client-side cart state, quantity edit, item removal |
| Order | `/pedidos/enviar` | Order form — name, contact, consent (Ley 1581) |
| Confirmation | `/pedidos/enviar/confirmacion` | Success screen after order submission |
| Blog | `/blog`, `/blog/[slug]` | Blog listing and Lexical rich text articles |
| Events | `/eventos` | Upcoming and past events from CMS |
| Account | `/(account)/` | User orders, addresses, profile |
| Static pages | `/sobre-nenufar`, `/contacto`, `/privacidad`, `/terminos` | Brand, contact, legal |

### 2.2 Payload CMS (`src/collections/`, `src/globals/`, `src/blocks/`)

| Collection / Global | Purpose |
|--------------------|---------|
| `Products` | Jewelry catalog — title, slug, variants, price (COP), stock, images, categories |
| `Media` | Image library — auto-generates WebP variants (thumbnail, card, hero, og) via Sharp |
| `Posts` | Blog — title, slug, content (Lexical), publishedAt, author, SEO |
| `Events` | Events and fairs — title, date, endDate, location, image, link |
| `Pages` | CMS pages with layout blocks (Hero, Content, CallToAction, UpcomingEvents, etc.) |
| `Users` | Buyers (customer role) and admins — Shirley's account is `admin` |
| `Categories` | Product taxonomy |
| `Header` (global) | Navigation links |
| `Footer` (global) | Footer links |

### 2.3 Telegram — Single Bot, Dual Role

The system uses **one bot** (`TELEGRAM_BOT_TOKEN`) for two distinct functions. **Both audiences are Shirley** — buyers never interact with the bot.

| Function | Direction | Who |
|----------|-----------|-----|
| **Order notifications** | System → Shirley's channel | A buyer's web order lands in `TELEGRAM_CHANNEL_ID`; Shirley reads it |
| **Admin assistant** | Shirley ↔ bot | Shirley writes to the bot to manage her store; the multi-agent system acts on Payload |

Buyers stay on the web: they browse `/shop`, add to cart, and submit the order (or the personalization form), leaving their **WhatsApp** number. That submission arrives in Shirley's channel as a notification. Buyers have no conversational channel with the bot.

#### Order Notifications — One-Way Inbox

When a buyer submits their cart, the order arrives in Shirley's channel as a structured HTML message. Shirley reads it and contacts the buyer via WhatsApp. No commands, no replies — read-only.

#### Admin Assistant — Multi-Agent System (v3.2)

When **Shirley** writes to the bot, `POST /telegram/webhook` is called:

```
Shirley escribe al bot ("¿qué pedidos tengo?")
         │
POST /telegram/webhook
         │
  ┌──────▼────────────────┐
  │ chat_id == ADMIN?      │  ← auth: solo el chat_id de Shirley
  │  no → 200, ignora      │
  └──────┬────────────────┘
         │ sí
  ┌──────▼───────┐
  │ routeAndRun()│  orchestrator.ts
  └──────┬───────┘
         │ Groq: interpreta la intención (temp=0)
         │
   ┌─────┴───────────┬──────────────┐
'pedidos'        'catalogo'      'inventario'
   │                 │                │
┌──▼──────────┐ ┌────▼─────┐ ┌───────▼────────┐
│ pedidos-    │ │ buscar-  │ │ actualizar-    │
│ Pendientes  │ │ Producto │ │ Inventario     │
│ confirmar-  │ │          │ │                │
│ Pedido      │ │          │ │                │
└──┬──────────┘ └────┬─────┘ └───────┬────────┘
   │                 │               │
payload.find/update  payload.find    payload.update
(orders)            (products)      (products.stock)
   │                 │               │
   └────────┬────────┴───────────────┘
            │
    sendTelegramReply()
    (responde a Shirley)
```

**Guardarraíl:** the buyer's purchase decision always stays with Shirley — the bot never charges or closes a sale on the buyer's behalf. Its writes to Payload (confirm order, update stock) are Shirley's own actions, expressed conversationally.

| File | Responsibility | Estado |
|------|---------------|--------|
| `src/lib/groq.ts` | Groq client singleton (reads `GROQ_API_KEY`) | ✅ slice 1 |
| `src/lib/agents/types.ts` | `AgentContext`, `Skill`, `Agent` interfaces | ✅ slice 1 |
| `src/lib/agents/runtime.ts` | Tool-calling loop (max 4 rounds) | ✅ slice 1 |
| `src/lib/agents/orchestrator.ts` | `routeAndRun()` — interprets and delegates | ✅ slice 1 (rutas por ampliar) |
| `src/lib/agents/skills/buscarProductos.ts` | `payload.find(products)` → pieces with COP prices | ✅ slice 1 (se reorienta a Shirley) |
| `src/app/(app)/telegram/webhook/route.ts` | POST handler — validates secret, dedup by `update_id` | ✅ slice 1 (falta guard por `chat_id`) |
| `src/lib/agents/skills/pedidosPendientes.ts` | `payload.find(orders, status=pending)` | ⬜ siguiente slice |
| `src/lib/agents/skills/confirmarPedido.ts` | `payload.update(orders.status)` | ⬜ siguiente slice |
| `src/lib/agents/skills/actualizarInventario.ts` | `payload.update(products.stock)` | ⬜ siguiente slice |

### 2.4 Order Flow (`src/app/(app)/pedidos/`)

```
OrderForm.tsx (client component)
  → submitOrderAction.ts (server action)
      → idempotency.ts (in-memory dedup by cartHash+email)
      → payload.create('orders', {...}) 
      → telegram.ts → order-formatter.ts → TELEGRAM_CHANNEL_ID
  → redirect to /pedidos/enviar/confirmacion
```

### 2.5 Blocks (`src/blocks/`)

Page builder blocks available in the CMS editor:

| Block | Slug | Description |
|-------|------|-------------|
| ArchiveBlock | `archive` | Lists posts or products by category |
| Banner | `banner` | Highlighted text banner |
| CallToAction | `cta` | CTA with headline and button |
| Carousel | `carousel` | Image carousel |
| Code | `code` | Syntax-highlighted code block |
| Content | `content` | Rich text column layout |
| Form | `formBlock` | Dynamic forms (contact, etc.) |
| MediaBlock | `mediaBlock` | Full-width image or video |
| ThreeItemGrid | `threeItemGrid` | 3-column product/content grid |
| UpcomingEvents | `upcomingEvents` | Dynamic upcoming events from CMS |

---

## 3. Database Design

Payload manages the schema via Drizzle ORM. In development, `push: true` auto-syncs without explicit migrations. In production, migrations are generated and run manually.

### Key entities

```
users
  id, email, password (hashed), role (admin|customer), name
  → has many: orders, addresses

products
  id, title, slug, price (int, COP), stock, status (draft|published)
  → has many: variants, images (→ media)
  → belongs to: categories[]

orders
  id, createdAt, status, items (JSONB), total (int, COP)
  → shippingAddress: { firstName (buyerName), phone (buyerContact) }
  → belongs to: user (optional — guest orders allowed)

media
  id, filename, url, width, height, mimeType
  → sizes: { thumbnail, card, hero, og } — generated on upload

posts
  id, title, slug, content (Lexical JSON), publishedAt, status
  → belongs to: authors[] (→ users)

events
  id, title, date, endDate, location, description, link, status
  → image → media

pages
  id, title, slug, layout (blocks[]), status
```

> **Note:** `buyerName` and `buyerContact` are stored in `shippingAddress.firstName` and `.phone` as a temporary workaround. These will be migrated to dedicated top-level fields in a future version.

---

## 4. API Interface Overview

Payload exposes a full REST API automatically at `/api/[collection]`.

### Endpoints used internally

| Method | Path | Used by |
|--------|------|---------|
| `POST` | `/api/orders` | `submitOrderAction.ts` via Payload local API |
| `GET` | `/api/products?where[slug][equals]=...` | Product detail page |
| `GET` | `/api/posts?where[slug][equals]=...` | Blog article page |
| `GET` | `/api/events?where[date][greater_than]=...` | Events page, UpcomingEvents block |
| `GET` | `/api/pages?where[slug][equals]=home` | Home page |
| `GET` | `/api/globals/header` | Header navigation |
| `GET` | `/api/globals/footer` | Footer links |

> Prefer the **Payload local API** (`payload.find(...)`, `payload.create(...)`) inside server components and server actions — it bypasses HTTP overhead. Use the REST API only from client components or external integrations.

### Telegram notification (outbound)

```
POST https://api.telegram.org/bot{TOKEN}/sendMessage
Body: { chat_id, parse_mode: "HTML", text: formattedOrder }
```

One-way, fire-and-forget. If Telegram fails, the order is already saved in Payload — the catch block logs but does not block the user.

### Webhook — Shirley's admin assistant (inbound, v3.2)

```
POST /telegram/webhook
Headers: X-Telegram-Bot-Api-Secret-Token: {TELEGRAM_WEBHOOK_SECRET}
Body: Telegram Update object (JSON)
```

Validates the secret header, checks `chat.id === TELEGRAM_ADMIN_CHAT_ID` (Shirley only — any other sender returns 200 and is ignored), deduplicates by `update_id` (in-memory Set, max 1000 entries), extracts `message.text`, calls `routeAndRun()`, and replies to Shirley via `sendTelegramReply()`.

---

## 5. Security Considerations

| Concern | Approach |
|---------|----------|
| Admin access | Payload role-based access — `admin` role required for all CMS operations |
| Customer data | Buyers can only read/modify their own orders and addresses (`adminOrSelf` access rule) |
| Server actions | Next.js server actions run server-side only — no client exposure of DB credentials |
| Secrets | `.env` is gitignored. `PAYLOAD_SECRET` and `TELEGRAM_BOT_TOKEN` never reach the client bundle |
| Colombian Law 1581 | Explicit consent checkbox on order form — stored as `consentGiven: true` on the order |
| SQL injection | Drizzle ORM with parameterized queries — no raw SQL |
| XSS | Lexical rich text renders via Payload's `RichText` component — no `dangerouslySetInnerHTML` with user input |
| Webhook authentication | `POST /telegram/webhook` validates `X-Telegram-Bot-Api-Secret-Token` against `TELEGRAM_WEBHOOK_SECRET`; requests without the header return 401 |
| Webhook authorization | Only `chat.id === TELEGRAM_ADMIN_CHAT_ID` (Shirley) is processed; any other sender is silently ignored — the admin bot is single-user by design |
| Webhook deduplication | `update_id` tracked in an in-memory Set (max 1000 entries); duplicate POSTs return 200 without reprocessing |

---

## 6. Data Flow — Order Submission

```
1. Buyer fills OrderForm (client)
2. submit → submitOrderAction (server action)
3. Check idempotency: sha256(cartItems + buyerContact) → in-memory Map
   - If seen within 5 min → reject duplicate
4. payload.create('orders', { items, buyerName, buyerContact, total, consentGiven })
   → Drizzle INSERT into PostgreSQL
5. formatOrderMessage(order) → HTML string
6. fetch(telegram API) → POST sendMessage
   - On failure: log error, continue (order already saved)
7. redirect('/pedidos/enviar/confirmacion?orderId=...')
```

---

## 7. Image Processing Flow

```
Admin uploads file
  → Payload middleware intercepts upload
  → Sharp resizes and converts to WebP (quality: 92)
  → Generates 4 size variants in parallel:
      thumbnail (400×500), card (800×1000), hero (1920×1080), og (1200×630)
  → Saves original + all variants to /public/media/
  → Stores URLs in media.sizes.{name}.url in PostgreSQL
Frontend:
  → <Media sizeName="card"> reads sizes.card.url
  → Falls back to original url if variant not available
```
