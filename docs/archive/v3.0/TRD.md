# TSD — Technical Specification Document
**Project:** Nénufar (Handmade Jewelry)
**Version:** 3.0 (Shopify headless pivot — self-service order → Telegram)
**Date:** July 2026
**Source of truth:** `docs/BRD.md` v3.0 · `docs/PRD.md` v3.0
**Design authority:** `docs/SDD` v3.0 (tool-agnostic)
**Supersedes:** v2.1 (Payload + Next.js + Telegram command center — frozen)

> **Naming note:** the file on disk is `docs/TRD.md` (kept for git history); the
> document title is **TSD** (Technical Specification Document) — the developer
> playbook. This is where every technology choice, route, schema, test, and
> deploy detail lives. The SDD stays tool-agnostic; do not duplicate stack here
> into the SDD or constitution.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Structure](#2-project-structure)
3. [API Specification / Integrations](#3-api-specification--integrations)
4. [Data Schemas](#4-data-schemas)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment](#6-deployment)
7. [Removed Stack (relative to v2.1)](#7-removed-stack-relative-to-v21)
8. [Cross-Reference Matrix](#8-cross-reference-matrix-brd--prd)
9. [ChangeLog](#changelog)

---

## 1. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Storefront framework | **Hydrogen** (on React Router v7 / Remix) | Single app. Replaces Next.js. |
| Catalog & blog backend | **Shopify admin** | Shirley manages products, variants, articles. |
| Storefront data layer | **Shopify Storefront API** (GraphQL) | Public token, client-safe. Products, variants, articles, cart. |
| Cart | Storefront API **Cart** object + Hydrogen cart helpers | `note`, cart `attributes`, and line `attributes` carry personalization. |
| Order submission | Remix **action** (server-side) | Reads cart → formats → posts to Telegram. |
| Notification | **Telegram Bot API** `sendMessage` | One-way, to a channel (bot is channel admin). |
| Language | TypeScript end-to-end | `tsc --noEmit` blocks merge. |
| Styling | Tailwind CSS (Hydrogen ships with it) | Final palette/typography TBD by Shirley (rebrand). |
| Hosting | **Oxygen** (Shopify) — native to Hydrogen | Single deploy. Vercel/Netlify are alternatives if needed. |
| Admin API | **Not used in MVP** | Deferred (Draft Orders, photo-to-product) to agentic L3+. |
| Runtime LLM | **None in MVP** | Deferred. |

**Storefront API version:** pin the latest stable at scaffold time (e.g.
`SHOPIFY_STOREFRONT_API_VERSION=2025-07` or newer). Hydrogen's `storefront`
client sends the version header automatically from config.

---

## 2. Project Structure

Single Hydrogen app (no monorepo, no `packages/`):

```
apps/web/  (or repo root after collapse — see migration note)
├── app/
│   ├── routes/
│   │   ├── (_index).tsx              # /            home
│   │   ├── colecciones.tsx           # /colecciones  catalog (all products)
│   │   ├── colecciones.$handle.tsx   # /colecciones/:handle  collection
│   │   ├── productos.$handle.tsx     # /productos/:handle     product detail + personalization
│   │   ├── blog._index.tsx           # /blog        blog list
│   │   ├── blog.$articleHandle.tsx   # /blog/:slug  article
│   │   ├── carrito.tsx               # /carrito     cart review
│   │   ├── pedidos.enviar.tsx        # /pedidos/enviar  order form + action
│   │   └── privacidad.tsx            # /privacidad  privacy notice (Ley 1581)
│   ├── lib/
│   │   ├── telegram.ts               # sendMessage to channel (server-only)
│   │   ├── order-formatter.ts        # cart → OrderMessage (pure function)
│   │   ├── consent.ts                # consent validation
│   │   └── idempotency.ts            # cart-id dedupe within window
│   ├── components/                   # storefront UI (Navbar, Hero, ProductCard, CartLine, ...)
│   └── root.tsx + shopify.config.ts
├── public/
├── package.json
└── .env / .env.example
```

**Migration note:** the current repo is a pnpm monorepo with `apps/web`
(Next.js + Payload). The migration removes `packages/{db,types,telegram}`,
replaces `apps/web` with the Hydrogen scaffold, and (per D-3.0-05) collapses to a
single app. Whether the app stays at `apps/web/` or moves to the repo root is a
mechanical decision taken at scaffold time.

---

## 3. API Specification / Integrations

### 3.1 Storefront routes (Remix)

| Route | Method | Behaviour | PRD ref |
|---|---|---|---|
| `/` | GET | Home: hero, catalog grid, blog teaser. Reads products + articles via Storefront API. | AC-01.1 |
| `/colecciones` | GET | Catalog grid. Lists published products (`available:true`). | AC-01.2 |
| `/productos/:handle` | GET | Product detail: images, description, materials, COP price, variant picker, personalization field. | AC-01.5, AC-04.1 |
| `/blog` | GET | Article list with cover/title/author/date/category + pagination. | AC-02.1, AC-02.3 |
| `/blog/:slug` | GET | Article: cover, metadata, `contentHtml`, SEO/OG. | AC-02.2 |
| `/carrito` | GET/POST | Cart: lines + personalization + note + COP total; add/remove/qty actions (Hydrogen `CartForm`). | AC-04.1–04.4 |
| `/pedidos/enviar` | GET/POST | GET: order form (name, contact, consent). POST (action): format + send to Telegram + idempotency. | AC-05.1–05.6 |
| `/privacidad` | GET | Ley 1581 privacy notice. | AC-06.1 |

### 3.2 Shopify Storefront API (GraphQL, public token)

The Hydrogen `storefront` client is injected in the loader/action context.
Representative operations (full fragments generated by Hydrogen's codegen):

- `products(first:, query:)` → catalog + search.
- `product(handle:)` → product detail with `variants`, `images`, `priceRange`,
  `description`, `options`.
- `blog(handle: "News")` / `articleByHandle(handle:)` → `contentHtml`, `image`,
  `seo`, `publishedAt`, `authorV2`.
- **Cart:** `cartCreate(input:{lines, note, attributes})`,
  `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`,
  `cartAttributesUpdate`, `cartNoteUpdate`. Each `line` accepts an
  `attributes: [{key, value}]` array — this is where free-text personalization
  (engraving, instructions) is stored per line.

Caching: Hydrogen subrequests are cached via its `Cache` API; product/article
loaders use `storefront.CacheLong`/`CacheShort`. Detail pages revalidate on
Shopify webhooks (optional) or on a short TTL.

### 3.3 Order submission action (`/pedidos/enviar`)

Server-side Remix action. Steps:

1. Parse form: `buyerName`, `buyerContact`, `consent` (boolean), `cartId`.
2. **Consent guard:** if `consent !== true` → return 422 with an error
   (AC-05.2). No further work.
3. **Idempotency guard:** check `cartId` against a short-lived in-memory or
   KV store of recently-sent carts; if seen within the window → return the same
   success response without re-sending (AC-05.5).
4. Fetch the cart via Storefront API (`cart(id:)` with lines, attributes, note).
5. Build the `OrderMessage` via `order-formatter.ts` (see §4.2).
6. `telegram.ts` → `sendMessage` to `TELEGRAM_CHANNEL_ID`.
7. On success → mark `cartId` sent, return 200 + confirmation data.
8. On failure → return 500 + retryable error (AC-05.6).

### 3.4 Telegram Bot API integration

- One outbound call: `POST https://api.telegram.org/bot<TOKEN>/sendMessage`
  with `{ chat_id: TELEGRAM_CHANNEL_ID, text: OrderMessage, parse_mode: "HTML" }`.
- The bot must be added as an **admin of the channel**.
- No inbound webhook, no `setWebhook`, no command parsing. The bot only sends.
- Message length: Telegram caps ~4096 chars; `order-formatter` truncates or
  splits a large cart gracefully (known gap §6 of the constitution).

---

## 4. Data Schemas

### 4.1 Cart (Storefront API object — read in the action)

Conceptual shape (the concrete GraphQL type is generated by Hydrogen codegen):

```ts
type Cart = {
  id: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string; currencyCode: 'COP' } };
  note: string | null;                 // cart-level note
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      merchandise: {                 // the chosen variant
        id: string;
        title: string;
        product: { handle: string; title: string; featuredImage?: { url: string } };
        selectedOptions: Array<{ name: string; value: string }>; // material, size, ...
      };
      attributes: Array<{ key: string; value: string }>;          // personalization
    }>;
  };
};
```

### 4.2 OrderMessage format (pure function `order-formatter.ts`)

Input: `Cart` + `{ buyerName, buyerContact }` + timestamp.
Output: an HTML string for Telegram. Example:

```
🔔 <b>Nuevo pedido — Nénufar</b>
📅 2026-07-18 14:32

<b>Cliente:</b> María Quintana
<b>Contacto:</b> +57 321 456 7890

<b>Items:</b>
• Collar Esmeralda (Oro 18k · Talla M) ×1 — $480.000
   ✏️ Grabado: "Para mamá"
• Aros complementarios (Plata) ×2 — $180.000

<b>Nota:</b> regalo para el 20 de julio

<b>Total: $660.000 COP</b>
```

COP formatting: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`.

### 4.3 Environment variables

Managed outside the repo (`.env` local; Oxygen env in prod). Never committed.

| Variable | Used by | Exposed to client? |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | storefront client | yes (public) |
| `SHOPIFY_STOREFRONT_API_PUBLIC_TOKEN` | storefront client | yes (public, client-safe) |
| `SHOPIFY_STOREFRONT_API_VERSION` | storefront client | yes |
| `TELEGRAM_BOT_TOKEN` | `lib/telegram.ts` (server-only) | **no** |
| `TELEGRAM_CHANNEL_ID` | `lib/telegram.ts` (server-only) | **no** |

There is intentionally **no** Admin API token and **no** database URL in the MVP.

---

## 5. Testing Strategy

No LLM assertions (no LLM). Focus: formatting correctness, idempotency, consent
guard, Storefront-API-shape contracts.

### 5.1 Unit

- `order-formatter.test.ts` — given a fixture cart, produces the exact
  OrderMessage (items, variants, personalization, note, total, COP format).
  Snapshot or string-assert.
- `consent.test.ts` — submission blocked when consent missing (AC-05.2).
- `idempotency.test.ts` — same `cartId` twice within the window → one send
  (AC-05.5); outside the window → allowed.
- COP formatting test — `Intl.NumberFormat('es-CO')` on sample prices (AC-01.3).

### 5.2 Integration

- Order-submission action with a **mocked** Storefront cart fixture and a
  **mocked** `sendMessage`: success path posts exactly one message; failure path
  returns a retryable error (AC-05.3, AC-05.6).
- Storefront loader contracts: products/article queries return expected shapes
  (mocked GraphQL).

### 5.3 End-to-end

- Buyer flow: browse → pick variant + personalization → cart → fill form +
  consent → send → confirmation. Asserts a message reached the mocked channel.

### 5.4 Type-safety gate

- `tsc --noEmit` blocks merge across the app.
- Hydrogen codegen (`storefrontapi.generated.ts`) keeps the Storefront types in
  sync with the queries used.

### 5.5 Manual smoke (pre-deploy)

- Submit a real order to a **test** Telegram channel and confirm the message
  format reads cleanly on a phone.

---

## 6. Deployment

- **Target:** Oxygen (Hydrogen's native host). Single command deploy from the
  Hydrogen CLI / Shopify admin. Vercel and Netlify are viable alternatives.
- **Environment:** configure the five env vars in §4.3 on the host.
- **Channel setup (one-time, manual):** create the Telegram channel, create the
  bot via @BotFather, add the bot as channel admin, set `TELEGRAM_CHANNEL_ID`.
- **Shopify setup (one-time, manual):** create a custom app with Storefront API
  read access + cart permissions; install the public token; pin the API version.
- **Domain:** point `nenufar.co` (or chosen domain) at the host.
- **Observability:** structured logs for submission successes/failures and
  Telegram delivery errors. No token/cost metrics (no LLM).
- **Cost:** Shopify subscription + Oxygen free/hobby tier. Concrete tiers
  decided at deploy time.

---

## 7. Removed Stack (relative to v2.1)

| Removed | Was (v2.1) | Reason (v3.0) |
|---|---|---|
| Next.js | Storefront framework | Replaced by Hydrogen (Remix) |
| Payload CMS | Admin CRM + blog + products | Shopify admin is the backend |
| Drizzle ORM + Supabase | DB layer | No DB on our side |
| Telegram webhook + command handler | Command bot (commands, digest, photo) | One-way notification only |
| Upstash QStash + daily digest cron | 9am digest | No async work in v3.0 |
| `wa.me` deep-link as the only CTA | Customer channel | Replaced by self-service cart → Telegram |
| WhatsApp Cloud API (never in v2.1 either) | — | Still out; Shirley closes manually |

---

## 8. Cross-Reference Matrix (BRD / PRD)

| TSD section | BRD ref | PRD ref | SDD ref |
|---|---|---|---|
| §1 (Stack) | §3.1, §3.2 | §4 | §1 |
| §2 (Structure) | §3.1 Cap 01 | §2 | §3 |
| §3.1–3.2 (Routes + Storefront API) | §3.1 Cap 01–03 | §3.1–3.3 | §3 |
| §3.3–3.4 (Submission + Telegram) | §3.1 Cap 05 | §3.5, AC-05.x | §3, §5 |
| §4 (Schemas) | §3.1 Cap 02, 04 | §3.2, §3.4 | §4 |
| §5 (Testing) | §6 | §6, AC-xx | §6 |
| §6 (Deployment) | §3.1, §7.1 | §7 | — |
| §7 (Removed stack) | §3.2 | — | — |

---

## ChangeLog

### v2.1 → v3.0 (this refactor)
- **Stack rewritten** for Hydrogen + Storefront API + Telegram Bot API
  (send-only). Next.js, Payload, Drizzle, Supabase, the Telegram webhook, the
  daily digest cron, and the WhatsApp-as-CTA model removed.
- **Project structure** collapsed to a single Hydrogen app; `packages/` removed.
- **Routes** specified in Spanish (`/colecciones`, `/productos/:handle`,
  `/carrito`, `/pedidos/enviar`, `/privacidad`).
- **Order submission action** specified end-to-end: consent guard → idempotency
  guard → cart fetch → format → `sendMessage`.
- **Data schemas** pinned: cart shape, the OrderMessage format, and the five env
  vars (no Admin API token, no DB url).
- **Testing** rewritten for formatting/idempotency/consent/E2E; removed v2.1's
  command-idempotency and webhook-security tests.
- **Deployment** moved to Oxygen; removed Vercel+Supabase+QStash.
- **Cross-reference matrix** updated to v3.0 BRD/PRD/SDD.
