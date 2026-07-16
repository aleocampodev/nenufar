# TSD — Technical Specification Document
**Project:** Agento — Nénufar (Handmade Jewelry)
**Version:** 2.1 (MVP pivot — catalog + blog + CRM + Telegram command center)
**Date:** July 2026
**Source of truth:** `docs/BRD.md` v2.1 · `docs/PRD.md` v2.1
**Supersedes:** v1.0 (agentic chat MVP, frozen — contained architectural hallucinations)
**Product overview diagram:** `specs/product-overview.excalidraw` (see SDD §2)
**Architecture diagram:** `specs/architecture.excalidraw` (layered architecture)

> **Naming note:** the file on disk is `docs/TRD.md` (kept for git history).
> The document title is TSD (Technical Specification Document) per the v1.0
> header; the two acronyms refer to the same artifact.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [API Specification / Integrations](#2-api-specification--integrations)
3. [Data Schema](#3-data-schema)
4. [Testing Strategy](#4-testing-strategy)
5. [Deployment](#5-deployment)
6. [Removed Stack (relative to v1.0)](#6-removed-stack-relative-to-v10)
7. [Cross-Reference Matrix (BRD / PRD)](#7-cross-reference-matrix-brd--prd)
8. [ChangeLog](#changelog)

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend / Edge | Next.js (App Router, Turbopack, server components, ISR) |
| Admin / CRM (headless CMS) | Payload CMS, embedded in `apps/web` (same Next.js process) |
| ORM / DB access | Drizzle ORM (`packages/db`) — schema mirrors Payload collections |
| Type sharing | `packages/types` → `payload-types.ts` + Drizzle schemas + Zod |
| Database | Supabase PostgreSQL (no extensions in MVP — **no pgvector**) |
| Media storage | Supabase Storage (bucket `product-drafts` for photo-to-draft; blog `coverImage` and audio hosting) |
| Async work | Next.js Route Handlers (`/api/webhooks/telegram`, `/api/cron/daily-digest`) — **no n8n, no external orchestrator** |
| Scheduled tasks | External cron (e.g. Upstash QStash) calling Next.js route handlers. 09:00 America/Bogota |
| Telegram Bot | Telegram Bot API (webhook only, no long-polling). Single handler in `apps/web` |
| Closing channel (customer) | WhatsApp via `wa.me` deep link from the storefront (no Meta API integration, no chatbot) |
| Payments | None in runtime. Settlement is external (Nequi, transfer, cash on delivery). No Wompi/Stripe, no payment webhook. Shirley confirms manually |
| Monorepo | pnpm workspaces. `apps/web` + `packages/db` + `packages/types` + `packages/telegram`. One deploy. End-to-end TypeScript. `tsc --noEmit` blocks merge |
| Runtime AI / LLM | **None in v2.1.** No Vercel AI SDK, no Gemini, no embeddings. The agentic layer is explicitly deferred |

(See §6 for the explicit list of v1.0 stack components that were removed and why.)

---

## 2. API Specification / Integrations

### 2.1 Storefront (public, read-only)

| Route | Method | Behaviour | Ref |
|---|---|---|---|
| `/` | GET | Home: Navbar → Hero → ProductsMasonry (from `products`, excludes `available=false`) → BlogSection (from `posts`) → Footer. ISR. | PRD §3.1, AC-01.1 |
| `/tienda` | GET | Masonry product gallery, hydrated from Payload. | PRD §3.1, M3 |
| `/blog` | GET | Blog list with sidebar + pagination. | PRD §3.2, AC-02.3 |
| `/blog/[slug]` | GET | Format-aware single post (`standard \| quote \| audio`). SEO metadata + Open Graph. | PRD §3.2, AC-02.1–02.4 |
| Product CTA | External | `https://wa.me/{WHATSAPP_BUSINESS_NUMBER}?text=Hola+Shirley,+vi+{productName}+en+nenufar.co`. No cart, no checkout. | PRD §3.1, AC-01.2 |

All storefront data is hydrated via Next.js server components using
`getPayload({ config })`. No hardcoded arrays. ISR + on-demand revalidation
triggered by Payload `afterChange` hooks on `products` and `posts`
(PRD §3.1 — G5 fix).

### 2.2 Telegram Webhook — `POST /api/webhooks/telegram`

Receives Telegram bot updates. This route is the **only** entry point for
Telegram traffic and contains all command dispatch. (PRD §3.4, §3.4.5.)

**Request envelope (Telegram Update object):**

```json
{
  "update_id": 123456789,
  "message": {
    "chat": { "id": 555555555 },
    "from":  { "id": 555555555 },
    "text":  "/pagado AX-H3B9"
  }
}
```

**Strict security validation (in order, fail-fast):**

1. **Secret token.** Compare the `X-Telegram-Bot-Api-Secret-Token` header
   against `TELEGRAM_WEBHOOK_SECRET` using a constant-time compare. Missing or
   mismatched → **401 Unauthorized**, no further processing, no DB call.
   (PRD §3.4.5, AC-04.12.)
2. **Authorized chat.** Compare `message.from.id` against
   `SHIRLEY_TELEGRAM_CHAT_ID`. Mismatch → respond `200` with body
   `"No autorizado"` and return (we respond 200 so Telegram does not retry; we
   do NOT mutate state, we do NOT call `sendMessage` beyond the rejection).
   (AC-04.13.)
3. **Command / input validation.** Any argument matching `AX-XXXX` MUST
   validate against `^AX-[A-Z2-9]{4}$` before any DB read. Invalid → respond
   with `"Código inválido. Formato esperado: AX-XXXX"`. (PRD §3.4.5.)

**Ack contract:** the route MUST return `200` to Telegram within a few seconds
of receiving the update to avoid retries. Long work (photo download + Supabase
upload) is awaited but kept fast; the v2.1 single-tenant, low-volume context
makes this acceptable. Tracked for hardening in the agentic phase.

**Commands handled (see PRD §3.4.1 for exact copy):**

| Input | Action | Idempotency | AC |
|---|---|---|---|
| `/help` | Reply with the command list. | n/a | AC-04.8 |
| `/nuevo` + multiline body | Parse customer + address/phone + item lines (separators `— - : \|`, strip `$ . , COP`). Create `order` with `status=CHECKOUT_READY`, auto-gen `AX-XXXX`. On parse failure → reply with format example, **no order created**. | n/a | AC-04.1, AC-04.2 |
| `/pagado AX-XXXX` | If `status=PAID` → reply `"Ya está confirmado ✅"` without mutating. Else set `status=PAID`, `paidAt=now`, optionally `paymentMethod`. Reply `"✅ AX-XXXX marcado como PAID. A empacar 🌸"`. | Yes | AC-04.3, AC-04.4 |
| `/despachado AX-XXXX` | If `status=DISPATCHED` → reply `"Ya está despachado 📦"` without mutating. Else set `status=DISPATCHED`, `dispatchedAt=now`. Reply `"📦 AX-XXXX → DISPATCHED. ¡Buen envío!"`. | Yes | AC-04.5 |
| `/pedido AX-XXXX` | Reply with full order details (customer, address, phone, items, total, status, timestamps). | n/a | AC-04.6 |
| `/pendientes` | Reply with all `CHECKOUT_READY` and `PAID` (not `DISPATCHED`) orders, sorted `CHECKOUT_READY` first, or `"✨ Todo al día."` if empty. | n/a | AC-04.7 |
| Photo (no command) | `getFile` → download → upload to Supabase Storage `product-drafts/draft-{ts}.jpg` → create `products` doc with `available=false`, `name="Draft — {YYYY-MM-DD}"`. Reply with admin edit URL. | n/a | AC-04.11 |
| Unrecognized text | Reply `"No entendí. Envía /help para ver comandos."` | n/a | AC-04.14 |
| New order created (via `/nuevo` or admin) | Outbound ping to Shirley with order summary + `/pagado` hint. | n/a | AC-04.9 |

### 2.3 Daily Digest Cron — `POST /api/cron/daily-digest`

Called by an external scheduler at **09:00 America/Bogota** (Upstash QStash or
equivalent). MUST validate the cron's signed request (e.g. QStash signing key
sent in a header / payload signature) before processing — unauthenticated
invocations return 401. (PRD §3.4.3, AC-04.10.)

Action: query Payload for yesterday's `orders` activity (new, paid, pending
dispatch) and push the digest message to Shirley via the Telegram Bot API
(`sendMessage`). If no activity, sends
`"昨日 sin movimiento. ¡Día tranquilo! 🌿"`. Exactly one `sendMessage` per
invocation to `SHIRLEY_TELEGRAM_CHAT_ID`.

### 2.4 Telegram Bot API integration

- **setWebhook** is called on deploy with:
  `url = https://nenufar.co/api/webhooks/telegram`,
  `secret_token = TELEGRAM_WEBHOOK_SECRET`.
- Outbound replies use `sendMessage` (chat_id = `SHIRLEY_TELEGRAM_CHAT_ID`).
  No inline keyboards, no menus in v2.1. (PRD §5.)
- Photo download uses `getFile` →
  `https://api.telegram.org/file/bot<token>/<file_path>`.

### 2.5 Payment settlement (explicitly non-automated)

There is **no** payment webhook in v2.1. Shirley confirms payments manually via
`/pagado AX-XXXX` in Telegram or via the admin "Confirmar pago" button. The BRD
explicitly rules out Wompi/Stripe and any pasarela integration for this MVP.
(BRD §3.2, PRD §1 — "No LLM in MVP" / "No payment pasarela").

---

## 3. Data Schema

Mirrored between Payload collections and Drizzle tables in `packages/db`. Only
three operator-facing collections plus the internal `users` collection. **No
`product_embeddings`, no `token_usage_logs`, no pgvector extension.**

| Collection | Key fields | Technical notes | Ref |
|---|---|---|---|
| `products` | `name`, `description`, `price_cop` (int), `materials[]`, `images[{url}]`, `available` (bool, default true), `handoff_ttl_hours` (deprecated), `is_upsell` (bool, default false) | Edited from Payload admin or photo-to-draft (creates draft, `available=false`). `available=false` excluded from storefront. | PRD §3.3 |
| `orders` | `sessionCode` (unique `AX-XXXX`), `customerName`, `customerPhone`, `customerAddress`, `items[{productId, name, price_cop, quantity}]`, `totalPrice`, `status` (`CHECKOUT_READY \| PAID \| DISPATCHED \| CANCELLED`), `paymentMethod` (`Nequi \| Transferencia \| Efectivo`), `paidAt`, `dispatchedAt` | `items` is an **immutable price snapshot**. `status` mutates ONLY via admin buttons or Telegram commands. | PRD §3.3, AC-03.5 |
| `posts` | `title`, `excerpt`, `content` (Lexical), `coverImage` (upload → Supabase Storage), `author`, `category`, `format` (`standard \| quote \| audio`), `audioUrl`, `quoteText`, `quoteAuthor`, `publishedAt`, `slug` | Drives `/blog` and `/blog/[slug]`. | PRD §3.2 |
| `users` (internal) | `email`, `passwordHash` | `auth: true`. Admin login only. | PRD §3.3 |

---

## 4. Testing Strategy

There are **no LLM assertions in v2.1** — no latency-vs-LLM tests, no token-cost
per-session audit, no schema-vs-agent-output tests, no Pre-LLM Guardian tests.
The strategy focuses on idempotency of the Telegram commands, webhook security,
order state machine correctness, and ISR correctness for the storefront.

### 4.1 Webhook security tests

- Missing `X-Telegram-Bot-Api-Secret-Token` → 401, no DB call, no
  `sendMessage`. (AC-04.12.)
- Wrong secret token → 401, no DB call, no `sendMessage`.
- Valid secret + non-Shirley chat ID → 200 `"No autorizado"`, no state
  mutation, no outbound `sendMessage` beyond the rejection. (AC-04.13.)
- Constant-time compare used (lint-level guard / code review checklist).

### 4.2 Command idempotency tests (Telegram)

- `/pagado AX-XXXX` on `CHECKOUT_READY` → `PAID`, `paidAt` set, success reply.
  (AC-04.3.)
- `/pagado AX-XXXX` on an already-`PAID` order → `"Ya está confirmado ✅"`,
  **DB untouched**, exactly one outbound `sendMessage`. (AC-04.4.)
- `/despachado AX-XXXX` on `PAID` → `DISPATCHED`, `dispatchedAt` set.
  (AC-04.5.)
- `/despachado AX-XXXX` on already-`DISPATCHED` → `"Ya está despachado 📦"`,
  DB untouched.
- **Telegram retry simulation:** the same Update delivered twice (Telegram
  retries on non-2xx) MUST NOT cause a second mutation or duplicate ping — the
  second delivery sees the post-first-call state and short-circuits via the
  idempotency branch.

### 4.3 Input validation tests

- `AX-XXXX` argument validated against `^AX-[A-Z2-9]{4}$`; invalid codes
  short-circuit before any DB read with the expected error reply.
  (PRD §3.4.5.)
- `/nuevo` parser tolerance: separators `— - : |`, strips `$ . , COP`, trims
  whitespace; free-text fallback when product name does not match.
  (PRD §3.4.1, G3 fix.)
- `/nuevo` malformed payload (missing lines, invalid price) → format-example
  reply and **zero** created orders. (AC-04.2.)

### 4.4 Order state machine tests

- Allowed transitions:
  - `CHECKOUT_READY → PAID` (admin "Confirmar pago" or `/pagado`).
  - `PAID → DISPATCHED` (admin "Marcar despachado" or `/despachado`).
  - any operational status → `CANCELLED` (admin only, no Telegram command).
- Disallowed transitions are rejected; no skips
  (`CHECKOUT_READY → DISPATCHED` is invalid).
- `orders.items` snapshot immutability: editing a product's `price_cop` after
  an order exists does NOT change that order's `items[].price_cop`. (AC-03.5.)

### 4.5 Storefront ISR tests

- `/`, `/tienda`, `/blog`, `/blog/[slug]` serve from the ISR cache on repeat
  hits (cache headers / revalidate tag present). LCP < 2s cold and warm.
  (PRD §4 — Performance.)
- Payload `afterChange` on `products` / `posts` triggers on-demand
  revalidation of the affected paths; stale content is purged.
  (PRD §3.1 — G5 fix.)
- Products with `available=false` never appear in masonry, carousel, or any
  public listing, even after revalidation. (AC-01.5.)
- COP formatting via `Intl.NumberFormat('es-CO', {style:'currency',
  currency:'COP'})` verified on product cards. (PRD §3.1, AC-01.4.)
- Storefront pages render responsively at 375px / 768px / 1280px without
  horizontal scrolling. (AC-01.6.)

### 4.6 Daily digest tests

- `POST /api/cron/daily-digest` rejects unsigned/invalid cron requests with
  401.
- Digest message format matches PRD §3.4.3 for both an active day and a
  zero-activity day (`"昨日 sin movimiento. ¡Día tranquilo! 🌿"`).
  (AC-04.10.)
- Exactly one `sendMessage` per digest invocation to Shirley's chat ID.

### 4.7 End-to-end tests

- Full `/nuevo` flow: command → order created → new-order ping received →
  `/pagado` → `/despachado` → `/pedido` reflects final state. (AC-04.1,
  04.9, 04.3, 04.5, 04.6.)
- Photo-to-draft flow: photo → Supabase Storage upload → `products` doc
  created with `available=false` → admin edit URL returned. (AC-04.11.)

### 4.8 Type-safety gate

- `tsc --noEmit` across the monorepo blocks merge. (PRD §4.)
- Drizzle schema in `packages/db` matches Payload `payload-types.ts`; a
  consistency check (script) fails the build on drift.

---

## 5. Deployment

- **Single deploy:** the entire monorepo (`apps/web` + `packages/*`) deploys as
  one Next.js app on Vercel (free tier in MVP). Payload admin is served by the
  same Next.js process at `/admin`.
- **Telegram webhook registration** runs as a post-deploy step:
  `setWebhook` with `secret_token = TELEGRAM_WEBHOOK_SECRET`.
- **Daily digest** is scheduled by an external cron (Upstash QStash or
  equivalent) hitting `POST /api/cron/daily-digest` at 09:00 America/Bogota.
  No n8n, no internal worker, no queue infra.
- **Storage:** Supabase free tier hosts PostgreSQL + Storage
  (`product-drafts` bucket, blog `coverImage`, audio hosting). No pgvector
  extension is enabled.
- **Environment variables** (managed outside the repo, never committed):
  `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`,
  `SHIRLEY_TELEGRAM_CHAT_ID`, `WHATSAPP_BUSINESS_NUMBER`, Supabase URL/keys,
  cron signing key.
- **Observability:** structured logs for webhook security failures (401,
  unauthorized chat ID), command parse failures, state transitions, and digest
  invocation. **No token / consumption metrics** — there is no LLM in the
  runtime path. The cost metric returns in the deferred agentic phase.
- **Cost target:** zero recurring infrastructure cost in MVP (Vercel free tier,
  Supabase free tier, Telegram Bot API is free, Payload is open-source).
  (PRD §4 — Cost.)

---

## 6. Removed Stack (relative to v1.0)

Documented so reviewers and future agents can see what is intentionally gone
and why — not just what replaced it.

| Removed | Was used for (v1.0) | Why removed (v2.1) | Reference |
|---|---|---|---|
| Vercel AI SDK | Web Agent Orchestrator + Closing Agent tool steps | No LLM in runtime. Agentic chat deferred. | BRD §3.2, PRD v1.1 → v2.0 changelog |
| Gemini 2.5 Flash | Closing conversation on WhatsApp | Same. | BRD §3.2 |
| Gemini Embedding 2 + pgvector | Catalog semantic search | No RAG / no semantic discovery in v2.1. | BRD §3.2 |
| Pre-LLM Guardian | Regex filtering of session codes before invoking the LLM | No LLM to protect. | PRD v1.1 → v2.0 |
| n8n (Oracle/GCP/Ubuntu) | Marketing/catalog webhooks, dispatch sheet generation | Next.js route handlers + external cron cover the same surface with less infra. | PRD §4 — Maintainability |
| Wompi / Stripe + payment webhook | Payment link generation, checkout status mutation | Payment settles externally (Nequi, transfer, cash). Shirley confirms manually. | BRD §3.2, PRD §1 |
| `token_usage_logs` table | Unit Economics (< 2.5% cost vs ticket) | No tokens to audit. Cost metric returns in agentic phase. | BRD §6 note |
| `product_embeddings` table | pgvector vectors for semantic search | No semantic search. | BRD §3.2 |
| `sessions` table | Frozen Intent Chips + `AX-XXXX` handoff codes | No Intent Chips / no WhatsApp handoff. `AX-XXXX` is now re-used as the `orders.sessionCode` (manual input via `/nuevo`). | PRD §3.3 |
| `dispatch_sheets` table | Auto-generated dispatch sheet post-payment | Shirley packs manually; no auto generation. | BRD §3.2 |

> The `AX-XXXX` code reuse is intentional and not a leftover: in v2.1 it is the
> `orders.sessionCode`, generated when Shirley registers an order via `/nuevo`
> (PRD §3.4.1) — semantically identical format, different lifecycle.

---

## 7. Cross-Reference Matrix (BRD / PRD)

| TSD section | BRD ref | PRD ref |
|---|---|---|
| §1 (Stack) | §3.1, §3.2 | §4 |
| §2.1 (Storefront API) | §3.1 Cap 01 | §3.1, AC-01.1–01.6 |
| §2.2 (Telegram webhook) | §3.1 Cap 04 | §3.4, §3.4.5, AC-04.1–04.14 |
| §2.3 (Daily digest cron) | §3.1 Cap 04 | §3.4.3, AC-04.10 |
| §2.5 (No payment webhook) | §3.2 | §1 |
| §3 (Schema) | §3.1, §3.2 | §3.2, §3.3, AC-03.5 |
| §4 (Testing) | §6, §3.2 | §3.x AC, §4 |
| §5 (Deployment) | §3.1 Cap 05 | §4 |
| §6 (Removed stack) | §3.2, §6 note | v1.1 → v2.0 changelog |

---

## ChangeLog

### v1.0 → v2.1 (this refactor)
- **Document re-aligned** with BRD v2.1 and PRD v2.1, the single source of truth.
  v1.0 references to agentic features removed throughout.
- **§1 Stack:** removed rows for Vercel AI SDK, Gemini 2.5 Flash, Gemini
  Embedding 2 + pgvector, n8n, Wompi/Stripe. Added `packages/types` and
  Supabase Storage rows. Made monorepo structure explicit.
- **§2 API:** removed Intent Endpoint, Closing Agent (`maxSteps: 2`), WhatsApp
  Inbound Webhook + Pre-LLM Guardian, Payment Confirmation Webhook. Replaced
  with: storefront table, Telegram webhook with strict
  `X-Telegram-Bot-Api-Secret-Token` + chat-ID validation, daily digest cron,
  Telegram Bot API integration, explicit non-automated payment settlement.
- **§3 Schema:** dropped `product_embeddings`, `token_usage_logs`, `sessions`,
  `dispatch_sheets` from the active schema; kept the three payload collections
  + internal `users`.
- **§4 Testing:** removed latency-under-3s vs LLM, per-session cost vs 2.5%,
  Pre-LLM Guardian, agent vs Zod-schema. Replaced with: webhook security,
  command idempotency (incl. Telegram retry simulation), input validation,
  order state machine, ISR / on-demand revalidation, daily digest, end-to-end,
  type-safety gate.
- **§5 Deployment:** removed n8n-on-Oracle/GCP/Ubuntu, payment webhook, Gemini
  token monitoring. Added external cron (QStash), Supabase Storage, observability
  note (no token metrics in v2.1).
- **§6 Removed Stack added** so the diff vs v1.0 is auditable in one place.
- **§7 Cross-reference matrix added** so each TSD section traces to BRD/PRD.
- **TOC added.**
- **File rename:** document title kept as TSD (Technical Specification
  Document) per the v1.0 header; the disk file remains `docs/TRD.md` for git
  continuity. Naming note added at the top.