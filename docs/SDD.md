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
│  │  /pedidos, etc.     │  │   /api/[collection]    │ │
│  └──────────┬──────────┘  └──────────┬─────────────┘ │
│             │                        │                │
│             └──────────┬─────────────┘                │
│                        │ Payload Local API             │
│  ┌─────────────────────▼──────────────────────────┐   │
│  │              PostgreSQL (Drizzle ORM)           │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
               │
               │ Telegram Bot API (HTTP POST — one-way)
               ▼
        Telegram Channel (Shirley's phone)
```

**Key design constraint:** No external services except Telegram. No Redis, no queues, no CDN — keeps operational cost at zero beyond the server.

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

### 2.3 Order Flow (`src/app/(app)/pedidos/`)

```
OrderForm.tsx (client component)
  → submitOrderAction.ts (server action)
      → idempotency.ts (in-memory dedup by cartHash+email)
      → payload.create('orders', {...}) 
      → telegram.ts → order-formatter.ts → Telegram Bot API
  → redirect to /pedidos/enviar/confirmacion
```

### 2.4 Blocks (`src/blocks/`)

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

### Telegram notification

```
POST https://api.telegram.org/bot{TOKEN}/sendMessage
Body: { chat_id, parse_mode: "HTML", text: formattedOrder }
```

One-way, fire-and-forget. If Telegram fails, the order is already saved in Payload — the catch block logs but does not block the user.

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
