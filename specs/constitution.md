# Agento Nénufar — Constitution (v2.1 MVP pivot)

> **Root document of Spec-Driven Development.**
> The single source of truth across all capabilities. Each capability spec
> references this document instead of redefining tables, states, stack or
> decisions. When something changes here, the specs inherit the change.

| | |
|---|---|
| **Version** | 2.1 (MVP pivot — storefront + blog + CRM + Telegram command center) |
| **Status** | Refactor phase — agentic v1.0 frozen, v2.1 foundation laid |
| **Scope** | MVP: Nénufar — handmade jewelry (Cartagena, Colombia) |
| **Language** | Spanish (storefront copy + Telegram messages), COP |
| **Last edit** | 2026-07 |
| **Source of truth** | `docs/BRD.md` v2.1 · `docs/PRD.md` v2.1 |
| **Supersedes** | v1.0 (agentic chat MVP, frozen — contained architectural hallucinations) |

---

## 1. Philosophy and North Star

Agento v2.1 **is not an agentic e-commerce platform.** It is the **operational
backbone** of a solopreneur — three simple tools that replace her memory +
WhatsApp + notebook with a system. The owner does not manage "leads" or
dashboards; she runs the business from her phone. There is no LLM in the
runtime path: that includes answering questions, recommending, and closing
sales. **Shirley closes sales on WhatsApp because she is the context layer of
the MVP.**

**MVP hypothesis (measurable north star, BRD §5):**
If a solopreneur jeweler has (1) a professional editorial storefront showing
her catalog and blog, (2) a lightweight CRM to track orders and confirm
payments, and (3) a Telegram bot that lets her confirm payments, mark
dispatches, and receive a daily digest from her phone, she will:

- Save ≥ 5 hours/week on administrative tasks.
- Reduce order drop-rate by ≥ 80% (target ≤ 2 drops/month vs ~10 today).
- Upload ≥ 2x more products to the catalog because photo-to-draft removes
  the friction of opening a laptop.
- Get a clear picture of weekly revenue and outstanding items in < 10s from
  her phone, without manual calculation.

The agentic hypothesis (LLM replaces Shirley closing sales) is **NOT tested
in this MVP.** It is deferred to a later phase once the operational backbone
is in place and Shirley is using the system.

**Validation metrics (BRD §6):**
- Hours/week saved (target ≥ 5h).
- % of inquiries that become tracked orders (target ≥ 80%, baseline ≈ 30%).
- New products uploaded per month (target ≥ 5 in month 1).
- Days per month Shirley interacts with the bot (target ≥ 90%).
- Operational visibility in < 10s from phone (100%).

> Note BRD §6: **there is no token-cost metric** in this MVP because there is
> no LLM in the runtime path. That metric returns in the agentic phase.

---

## 2. Non-negotiable principles

These principles are implicit acceptance criteria for all specs.

1. **No LLM in the runtime path.** No Vercel AI SDK, no Gemini, no embeddings,
   no pgvector, no Pre-LLM Guardian. That entire surface is frozen for the
   agentic phase excluded from MVP v2.1. Reintroducing it without explicit
   authorization breaks the contract with the BRD/PRD.

2. **No n8n.** All async work lives in Next.js route handlers
   (`/api/webhooks/telegram`, `/api/cron/daily-digest`) triggered by external
   cron (Upstash QStash or equivalent). Fewer infrastructure moving parts >
   scaling orchestration tools.

3. **No payment gateway in the runtime path.** Payment is reconciled
   externally (Nequi, bank transfer, cash on delivery). Shirley confirms
   manually with `/pagado AX-XXXX` (Telegram) or "Confirm payment" (admin).

4. **Shirley is the context layer of the MVP.** She manually bridges WhatsApp /
   Instagram → system by typing `/nuevo` in Telegram. There are no social-media
   API integrations in v2.1. If volume scales, `/nuevo` becomes a bottleneck —
   that is the signal to move to the agentic phase.

5. **Telegram belongs to Shirley, not to customers.** Authorization is by chat ID
   (`SHIRLEY_TELEGRAM_CHAT_ID`). Any other sender receives "Not authorized."
   There is no customer-facing chatbot in the MVP.

6. **End-to-end typed monorepo.** One repo, one deploy, pnpm workspaces
   (`apps/web` + `packages/db` + `packages/types` + `packages/telegram`).
   `payload-types.ts` and Drizzle schemas are imported directly.
   `tsc --noEmit` blocks merge.

7. **Commercial determinism.** Every `orders.status` transition
   (`CHECKOUT_READY → PAID → DISPATCHED`, or `→ CANCELLED` admin-only) is
   triggered by **deterministic code fired by an explicit human action**
   (a Telegram command or an admin button). No inference, no automatic payment
   webhook, no event bus.

8. **Command-level idempotency.** `/pagado` on an already-`PAID` order responds
   "Already confirmed ✅" without mutating. `/despachado` on an
   already-`DISPATCHED` order responds "Already dispatched 📦" without
   mutating. A retried Telegram Update causes no second effect.

9. **The storefront is a marketing surface, not a checkout.** The editorial
   storefront (home, `/tienda`, `/blog`) hydrates from Payload with **server
   components** + `getPayload`. ISR + on-demand revalidation via `afterChange`
   hook on `products` / `posts`. There is no "Add to cart." The only purchase
   CTA is "Contact on WhatsApp" → `wa.me/{shirley-number}`.

10. **Immutable snapshot of `orders.items`.** When an order is created, the
    name + `price_cop` per item is frozen. Editing a product afterwards does
    **not** rewrite existing orders.

11. **`products.available = false` excludes the product from the storefront.**
    No exceptions. The masonry grid, the carousel, and any public listing
    filter by `available=true`. Photo-to-draft creates with `available=false`.

12. **Strict webhook security.** `POST /api/webhooks/telegram` validates
    `X-Telegram-Bot-Api-Secret-Token` against `TELEGRAM_WEBHOOK_SECRET` using
    constant-time comparison; returns 401 if missing or mismatched, without
    touching the DB. Any `AX-XXXX` in a command is validated against
    `^AX-[A-Z2-9]{4}$` before reading the DB.

---

## 3. Canonical stack (v2.1)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack, RSC, ISR) | Single orchestrator; Payload embedded |
| CMS / CRM | Payload CMS 3.0 (embedded in `apps/web`, headless + admin) | Admin for Shirley, headless for storefront |
| ORM | Drizzle (`packages/db`) | Mirrors the Payload schema |
| Shared types | `packages/types` | `payload-types.ts` + Zod |
| DB | PostgreSQL 15+ (Supabase DBaaS, free tier) | **No pgvector, no extensions** |
| Media storage | Supabase Storage (bucket `product-drafts`; blog `coverImage` + audio) | `/public/` is read-only on Vercel |
| Async work | Next.js route handlers + external cron | **No n8n** |
| Scheduled tasks | Upstash QStash (or equivalent) calling `/api/cron/daily-digest` | 09:00 America/Bogota |
| Operational channel | Telegram Bot API (webhook, not long-polling) | Single route handler |
| Customer closing channel | WhatsApp via `wa.me` deep link from the storefront | No Meta API integration, no chatbot |
| Payments | None in runtime | External manual reconciliation |
| Monorepo | pnpm workspaces (`apps/*` + `packages/*`) | One deploy; end-to-end typing |
| Storefront frontend | Tailwind v4, UI cloned from the Krafti reference site using the `ai-website-cloner-template` tool (JCodesMore) and rebranded to Nénufar with the Krafti palette (terracotta + cream + navy, Alegreya/Lato) | Editorial design system. Cloning tool: https://github.com/JCodesMore/ai-website-cloner-template. The cloned output lives in `apps/web/src/` and IS the Nénufar storefront. |
| CI/CD | GitHub Actions + husky / lint-staged | `tsc --noEmit`, ESLint |
| Runtime LLM | **None in MVP** | Deferred to the agentic phase |

### Components removed relative to v1.0 (audit)

| Removed | Used for (v1.0) | Reason v2.1 |
|---|---|---|
| Vercel AI SDK | Web Agent Orchestrator + Closing Agent | No LLM. Phase frozen. |
| Gemini 2.5 Flash | WhatsApp closing conversation | No LLM. |
| Gemini Embedding 2 + pgvector | Semantic catalog search | No RAG. |
| Pre-LLM Guardian | Regex session-code check before invoking LLM | No LLM to protect. |
| n8n (Oracle/GCP/Ubuntu) | Marketing/catalog webhooks, dispatch sheet | Route handlers + cron cover it. |
| Wompi/Stripe + payment webhook | Payment link, state mutation post-payment | Manual external payment. |
| `token_usage_logs` | Unit economics < 2.5% cost vs ticket | No tokens to audit. |
| `product_embeddings` | pgvector vectors | No semantic search. |
| `handoff_sessions` | Intent Chips + handoff AX-XXXX via WhatsApp | AX-XXXX is reused as `orders.sessionCode`, different lifecycle. |
| `dispatch_sheets` | Auto-generated technical sheet post-payment | Shirley packs manually. |

---

## 4. Canonical data model (v2.1)

Engine: PostgreSQL (Supabase) accessed by Payload and by Drizzle in
`packages/db`. **No pgvector, no embeddings, no vector index, no
`token_usage_logs`.** Three operator-facing collections + one internal:

### 4.1 `products` (managed by Payload)

Native Payload collection, editable from admin or via photo-to-draft.

| Field | Type | Notes |
|---|---|---|
| `name` | text | required |
| `description` | textarea | optional |
| `price_cop` | number | required, integer COP |
| `materials` | text[] | hasMany |
| `images` | array[{ url }] | hasMany |
| `available` | checkbox | default `true`. `false` excludes from storefront. |
| `handoff_ttl_hours` | number | DEPRECATED — unused in v2.1 |
| `is_upsell` | checkbox | default `false` — unused in v2.1 (reserved for agentic phase) |

### 4.2 `orders` (CRM — Dispatches)

The dispatch queue. `status` mutates ONLY via admin or Telegram commands.

| Field | Type | Notes |
|---|---|---|
| `sessionCode` | text (unique) | Format `AX-XXXX` |
| `customerName` | text | required |
| `customerPhone` | text | |
| `customerAddress` | textarea | |
| `items` | array[{ productId, name, price_cop, quantity }] | Immutable snapshot |
| `totalPrice` | number | required |
| `status` | select | `CHECKOUT_READY` \| `PAID` \| `DISPATCHED` \| `CANCELLED` |
| `paymentMethod` | select | `Nequi` \| `Transferencia` \| `Efectivo` |
| `paidAt` | date | set by `/pagado` or admin |
| `dispatchedAt` | date | set by `/despachado` or admin |

`items` is an **immutable snapshot** of name + price at order-creation time.
Editing the product afterwards does **not** affect existing orders (AC-03.5).

### 4.3 `posts` (Blog)

Editorial content for `/blog` and `/blog/[slug]`.

| Field | Type | Notes |
|---|---|---|
| `title` | text | required |
| `excerpt` | textarea | |
| `content` | richText (Lexical) | |
| `coverImage` | upload → `media` | Supabase Storage |
| `author` | text | |
| `category` | text | |
| `format` | select | `standard` \| `quote` \| `audio` |
| `audioUrl` | text (conditional on `format=audio`) | External URL or Supabase Storage |
| `quoteText` | textarea (conditional on `format=quote`) | |
| `quoteAuthor` | text (conditional on `format=quote`) | |
| `publishedAt` | date | |
| `slug` | text (unique) | auto-generated if left empty |

### 4.4 `users` + `media` (Payload internals)

`users` with `auth: true` for admin login. `media` as an `upload` collection
for blog `coverImage`. They are not operator-facing in the CRM sense.

### Tables removed relative to v1.0

| Removed | Was | Reason |
|---|---|---|
| `product_embeddings` | pgvector 1:1 with products | No semantic search. |
| `handoff_sessions` | bidirectional WA/web bridge | `AX-XXXX` is now `orders.sessionCode`. |
| `token_usage_logs` | LLM cost auditing | No LLM in runtime. |

---

## 5. `orders` state machine

```
   /nuevo (Telegram)  |  Admin "Create order"
            │
            ▼
   [ CHECKOUT_READY ] ──── Admin "Cancel" (admin only) ──► [ CANCELLED ]
            │
            │  /pagado AX-XXXX  |  Admin "Confirm payment"
            ▼
         [ PAID ] ── Admin "Cancel" (admin only) ──► [ CANCELLED ]
            │
            │  /despachado AX-XXXX  |  Admin "Mark dispatched"
            ▼
      [ DISPATCHED ]  (end of cycle)
```

**Transition rules:**

- `/nuevo` or Admin "Create order" → `CHECKOUT_READY`. `AX-XXXX` is auto-generated.
- `CHECKOUT_READY → PAID`: only `/pagado AX-XXXX` (Telegram) or admin "Confirm
  payment". Sets `paidAt = now`. `/pagado` on `PAID` → "Already confirmed ✅"
  without mutating (idempotent).
- `PAID → DISPATCHED`: only `/despachado AX-XXXX` or admin "Mark dispatched".
  Sets `dispatchedAt = now`. Idempotent.
- Any state `CHECKOUT_READY | PAID → CANCELLED`: admin only. **There is no
  Telegram command to cancel.**
- `CHECKOUT_READY → DISPATCHED` (skipping `PAID`) is forbidden — the system
  rejects the transition. No shortcuts.

Every transition is **idempotent**: the same Telegram Update delivered twice
(retry) causes no second effect or duplicate ping. See PRD §3.4.1 and
AC-04.4 / AC-04.5.

---

## 6. Capabilities and index (v2.1)

| # | Capability | BRD ref | Key artifacts |
|---|---|---|---|
| 01 | Storefront | BRD §3.1 Cap 01 | Next.js App Router, ISR, masonry `/tienda`, `wa.me` CTA, COP |
| 02 | Blog | BRD §3.1 Cap 02 | `Posts` collection, format-aware rendering, SEO/OG |
| 03 | CRM (Payload admin) | BRD §3.1 Cap 03 | `/admin`, `products` + `orders`, manual transitions |
| 04 | Telegram Command Center | BRD §3.1 Cap 04 | `/api/webhooks/telegram`, commands, photo-to-draft, ping |
| 05 | Monorepo Structure | BRD §3.1 Cap 05 | `apps/web` + `packages/{db,types,telegram}`, pnpm |

Capabilities 06-vector-indexing, 02-semantic-discovery, 03-handoff-bridge,
04-whatsapp-closing, 07-observability from v1.0 are **frozen** and outside the
MVP v2.1.

---

## 7. ADRs (v2.1 decision log)

| ID | Decision | Status |
|---|---|---|
| **D-2.1-01** | No LLM in v2.1 runtime. AI SDK, Gemini, embeddings, pgvector, Pre-LLM Guardian frozen for the agentic phase. | ✅ |
| **D-2.1-02** | No n8n. All async in route handlers + external cron (QStash). | ✅ |
| **D-2.1-03** | No payment gateway. External manual reconciliation (Nequi, transfer, cash). | ✅ |
| **D-2.1-04** | Telegram as Shirley's command center, not customer-facing. Auth by chat ID. | ✅ |
| **D-2.1-05** | Shirley is the context layer. She bridges WA/IG → system via `/nuevo`. No social-media APIs. | ✅ |
| **D-2.1-06** | pnpm monorepo (`apps/web` + `packages/db,types,telegram`). One deploy. E2E typing. | ✅ |
| **D-2.1-07** | `products.available = false` excludes from storefront. Photo-to-draft starts with `false`. | ✅ |
| **D-2.1-08** | `orders.items` is an immutable snapshot. Editing a product does not affect existing orders. | ✅ |
| **D-2.1-09** | `AX-XXXX` reused as `orders.sessionCode`. Same semantic format as v1.0, different lifecycle. | ✅ |
| **D-2.1-10** | Telegram webhook validates `X-Telegram-Bot-Api-Secret-Token` (constant-time compare) + authorized chat ID. 401 before touching DB. | ✅ |
| **D-2.1-11** | `/pagado` and `/despachado` commands are idempotent. Telegram retries do not duplicate mutations. | ✅ |
| **D-2.1-12** | Storefront = marketing surface. Server components + ISR + `afterChange` revalidate. No cart. `wa.me` CTA. | ✅ |
| **D-2.1-13** | `posts` collection with `standard \| quote \| audio` formats. SEO/OG metadata. | ✅ |
| **D-2.1-14** | Drizzle combo (`packages/db`) + payload-types (`packages/types`) with drift check that blocks the build. | ✅ |
| **D-2.1-15** | Cost target: zero recurring infra in the MVP (Vercel free, Supabase free, Telegram Bot API free). | ✅ |

v1.0 ADRs (D-001..D-016) remain frozen as historical reference;
they do not apply to MVP v2.1.

---

## 8. Open gaps (to be resolved within each spec)

- **Cap 01 / 02:** rebranding the storefront from its current state (an
  unbranded clone of the Krafti reference site, still with English copy and
  USD demo data) to Nénufar — Krafti palette (terracotta `#a55e3f` + cream
  `#f4f2ee` + navy `#0d1e64`, Alegreya/Lato), replacing "Krafti" copy with
  "Nénufar", hydrating the components with `getPayload({config})`
  (Navbar home, HeroSection, ProductsCarousel, ShopMasonryGrid→`/tienda`,
  BlogSection→`/blog`), `wa.me` CTA on every product card; ISR policy
  (revalidate time) vs strict on-demand.
- **Cap 03:** formalized roles in Payload (MVP uses `read: () => true` as a
  known limitation); how to prevent public admin access without breaking the bot.
- **Cap 04:** multiline `/nuevo` parsing (separators `— - : \|`, strip `$ . , COP`);
  photo-to-draft upload to Supabase Storage (path, ACL, draft expiration);
  external cron signing (QStash signing key vs alternative).
- **Cap 05:** single-deploy strategy for the monorepo on Vercel (pnpm
  workspaces are supported, but documenting `pnpm install --frozen-lockfile`
  in CI is advisable).

---

## 9. Spec conventions

Each `spec.md` follows this template:

1. **Context and objective** — what it solves, where it fits in the layers.
2. **Functional requirements** — numbered `RF-NN.x`, one capability per
   requirement.
3. **Acceptance criteria** — **Given / When / Then** format, verifiable
   (testable without ambiguity). Numbered `CA-NN.x`.
4. **Out of scope** — what it explicitly does NOT do.
5. **Dependencies** — prior specs and artifacts.
6. **Open questions** — pending decisions marked `PENDING`.

Every table / column / state identifier must match §4 and §5 of this
constitution.

Language for all specs: **English** (in sync with existing `docs/` and
mixed-language teams). The *bot voice* and *storefront copy* are Spanish;
specs as technical artifacts are EN.

---

## 10. Glossary (v2.1)

- **Context layer (MVP):** Shirley. She manually translates WhatsApp/Instagram
  context into the system by typing `/nuevo`. In the agentic phase, the context
  layer moves to the LLM.
- **Command center (Telegram):** the bot Shirley operates from her phone. It
  does not serve customers; it receives pings, executes commands, and sends
  the daily digest.
- **Immutable snapshot:** a copy of `name` + `price_cop` per item frozen at
  order creation. Editing products afterwards does not change it.
- **Photo-to-draft:** Shirley sends a photo → a draft is created in `products`
  with `available=false` and `name="Draft — {date}"`. Completed in admin later.
- **Daily digest:** a passive summary of yesterday (new orders, outstanding
  payments, paid, pending dispatch) sent at 9am by the bot.
- **Marketing surface:** the editorial storefront drives qualified traffic and
  showcases the catalog; it is not a checkout. The `wa.me` CTA routes to the
  manual close with Shirley.

v1.0 glossary (handoff, rehydration, Synthetic Memory, RAG-governed discovery,
bidirectional) is archived — it does not apply to v2.1.

---

## 11. Changes relative to constitution v1.0

| Before (constitution v1.0) | Now (constitution v2.1) | Reason |
|---|---|---|
| "Agentic e-commerce with intrinsic CRM" | "Operational backbone of a solopreneur" | MVP pivot |
| LLM closes sales on WhatsApp | No LLM in runtime | D-2.1-01 |
| Handoff `AX-XXXX` with Intent Chips | `AX-XXXX` reused as `orders.sessionCode` | D-2.1-09 |
| Wompi + payment webhook | External manual reconciliation | D-2.1-03 |
| n8n async orchestration | Route handlers + external cron | D-2.1-02 |
| WhatsApp Cloud API signed webhook | Telegram Bot API webhook with `X-Telegram-Bot-Api-Secret-Token` | D-2.1-04, D-2.1-10 |
| `product_embeddings` + pgvector | Only `products`, `orders`, `posts` | D-2.1-01 |
| `handoff_sessions` (bidirectional bridge) | No table — `AX-XXXX` lives in `orders` | D-2.1-09 |
| `token_usage_logs` (unit economics) | No LLM → no tokens to audit | D-2.1-01 |
| States `ACTIVE / EXPIRED / CHECKOUT_READY / ABANDONED / PAID / DISPATCHED` | `CHECKOUT_READY / PAID / DISPATCHED / CANCELLED` | §5 simplified |
| Pre-LLM Guardian regex | Direct regex validation in the route handler | D-2.1-10 |
| Storefront with declarative chat (`<DiscoveryChat />`) | Editorial storefront, direct `wa.me` CTA | D-2.1-12 |
| Capability 06-vector-indexing, 02-semantic-discovery, 03-handoff-bridge, 04-whatsapp-closing, 07-observability | Frozen, outside MVP v2.1 | BRD §3.2 |
| Picks `maxSteps: 2` / `maxSteps: 3` | No step limit — no agent | D-2.1-01 |
| Cost metric < 2.5% AOV | No cost metric (no LLM) | BRD §6 note |
| Handoff rate / autonomous closing metrics | Time-saved / order capture / catalog freshness / digest engagement metrics | BRD §6 |
