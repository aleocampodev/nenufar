# Nénufar — Constitution (v3.0)

> **Root document of Spec-Driven Development — guardrails and decisions only.**
> This document defines non-negotiable principles, the decision log (ADRs), and
> the agentic roadmap. It deliberately does **not** define the tech stack or the
> data model — those live in the TSD (`docs/TRD.md` §1 and §3) to avoid a dual
> source of truth. Each capability spec references this document instead of
> redefining principles or decisions.

| | |
|---|---|
| **Version** | 3.0 (Shopify headless pivot — slimmed: stack & data model delegated to TSD) |
| **Status** | v3.0 refactor phase |
| **Scope** | MVP: Nénufar — handmade jewelry (Cartagena, Colombia) |
| **Language** | Spanish (storefront copy + Telegram messages), COP |
| **Last edit** | 2026-07 |
| **Source of truth** | `docs/BRD.md` v3.0 · `docs/PRD.md` v3.0 |
| **Tech & data authority** | `docs/TRD.md` v3.0 (§1 stack, §3 data) |
| **Supersedes** | v2.1 (Payload + Next.js + Telegram command center — frozen) |
| **Project name** | Nenúfar (brand) / `nenufar` (code, ASCII). |

---

## 1. Philosophy and North Star

Nénufar v3.0 is a **Shopify headless storefront** where buyers assemble a
personalized order themselves, and each submitted order lands as one structured
message in a Telegram channel Shirley reads from her phone. It is **not** an
agentic system and **not** a traditional e-commerce: there is no checkout, no
payment gateway, no database on our side, and no LLM in the runtime path.

**MVP hypothesis (BRD §5):** if a solopreneur jeweler has (1) a professional
storefront showing her catalog and blog, (2) a way for buyers to assemble and
personalize an order themselves, and (3) each order arriving structured in a
Telegram channel she reads from her phone, she will stop losing orders to messy
WhatsApp threads and remove herself from the order-intake bottleneck — while
keeping fulfillment manual and human.

**Validation metrics (BRD §6):** storefront traffic, order-submission →
fulfillment conversion, time saved per order, catalog freshness. **There is no
token-cost metric** because there is no LLM in the runtime path; it returns in
the agentic phase.

---

## 2. Non-negotiable principles

> The concrete stack and data model are defined in the TSD (`docs/TRD.md`).
> The principles below are the **constraints** every capability must obey; they
> intentionally do not list technologies.

1. **No Shopify Checkout, no payment gateway.** The cart is read and posted to
   Telegram; it NEVER redirects to Shopify Checkout. Payment is settled
   externally (Nequi, transfer, cash) by Shirley on WhatsApp.

2. **No database, no ORM, no CMS-of-our-own.** Catalog and blog live in Shopify.
   Orders are NOT persisted — the Telegram channel is the only record (see §7
   debt).

3. **Storefront API public token only — no Admin API in the MVP.** Client-safe
   credentials; minimal attack surface. Admin API may appear in the agentic phase
   (e.g. Draft Orders, photo-to-product).

4. **Telegram is a one-way notification channel.** No command bot, no inbound
   webhook, no command parser. Only outbound `sendMessage` to a channel where the
   bot is admin.

5. **Single deployable app.** One app, one deploy. No monorepo, no separate
   backend, no `packages/`.

6. **Server-side secrets.** The Telegram bot token lives only in server-side
   code, never shipped to the browser. Only the Storefront API public token is
   client-exposed.

7. **The cart IS the order.** Personalization travels inside the cart object:
   structured options (material, size) as Shopify variants; free text (engraving,
   notes) as cart line attributes. The "Send order" action reads the full cart.

8. **Spanish storefront, COP.** Catalog/blog copy and the Telegram order message
   are Spanish; all money is COP.

9. **No LLM in the runtime path.** No AI SDK, no embeddings, no RAG. The agentic
   layer is deferred — see the maturity ladder in §6.

10. **Idempotent order submission.** Clicking "Send order" twice must NOT post
    two messages to the channel — the action dedupes by cart id within a short
    window and/or disables the button client-side after first success.

11. **Privacy by default.** The order form collects only what Shirley needs to
    fulfill. Buyer consent is required before any PII is sent to the channel
    (Ley 1581 de 2012 — see §7 and PRD).

---

## 3. Order lifecycle (conceptual)

There is **no state machine.** The lifecycle is a single one-way flow:

```
Buyer browses catalog → picks options + personalization → cart
   → "Send order" → order is formatted
        → message posted to the Telegram channel
        → buyer sees "order sent ✓"
Shirley reads channel → closes on WhatsApp → fulfills (off-system)
```

No PAID/DISPATCHED states, no codes, no admin transitions. Fulfillment is
entirely outside the system. (The detailed data flow and module boundaries live
in the SDD `docs/SDD`.)

---

## 4. Capabilities and index (v3.0)

| # | Capability | BRD ref | SDD ref |
|---|---|---|---|
| 01 | Storefront | BRD §3.1 Cap 01 | SDD §2 |
| 02 | Catalog | BRD §3.1 Cap 02 | SDD §2 |
| 03 | Blog | BRD §3.1 Cap 03 | SDD §2 |
| 04 | Cart + personalization | BRD §3.1 Cap 04 | SDD §2 |
| 05 | Order submission → Telegram | BRD §3.1 Cap 05 | SDD §2 |
| 06 | Agentic layer (DEFERRED) | — | §6 ladder |

v2.1 capability 04-telegram-command-center (commands, photo-to-draft, daily
digest) and the Payload CRM admin are **frozen and outside v3.0**.

---

## 5. Agentic maturity ladder (deferred, documented)

The MVP is deterministic (Level 0). The agentic future is documented as a ladder
so "deferred" is a real plan, not a hand-wave. Each level has a trigger.

- **L0 (this MVP) — Deterministic.** Cart → Telegram. Shirley does everything.
- **L1 — LLM-enriched intake.** The "Send order" action uses an LLM to normalize
  the buyer's free-text personalization and draft a clearer summary for Shirley.
  Shirley still decides everything. **Trigger:** personalization notes become
  ambiguous/unparseable.
- **L2 — Catalog Q&A on the storefront.** A chat where the LLM answers from the
  catalog (products, variants, availability) and **proposes** a cart the buyer
  confirms. The catalog is the knowledge source — no vector DB needed.
  **Trigger:** buyers ask repetitive catalog questions before ordering.
- **L3 — Agent for Shirley in Telegram.** Reads incoming orders, drafts WhatsApp
  replies for approval, proposes payment confirmations. **Re-introduces order
  state + persistence** (Shopify Draft Orders or a mini-table) — the known debt
  from §7 is paid here. **Trigger:** order volume makes manual closing a
  bottleneck.
- **L4 — Autonomous close + nurture + photo-to-product.** Full agentic. Needs
  identity, persistence, and guardrails. **Trigger:** L3 proves the agent closes
  reliably.

> Reaching L3+ almost certainly requires re-adding persistence. The
> Telegram-channel-only choice (§7 debt) is taken knowingly to keep the MVP lean.

---

## 6. Known gaps and debts (explicit, tracked)

- **Telegram-channel-only = no searchable order history.** Shirley cannot query
  "what did this customer order last month?" without scrolling the channel.
  Acceptable for MVP volume; resolved at agentic L3+ (§5).
- **PII in a Telegram channel.** Orders may carry customer name/phone/address.
  Channel members see that PII. Channel membership must be restricted to Shirley.
  A privacy/consent treatment (Colombia **Ley 1581 de 2012**) is specified in the
  PRD (medium treatment: consent checkbox + `/privacidad` page).
- **Telegram message size/format limits.** A large cart may exceed message
  length; the formatter must truncate or split gracefully.
- **No rate-limiting / abuse handling** on the "Send order" action beyond
  idempotency (§2.10). Public endpoint — a malicious actor could spam the
  channel. Mitigation deferred.
- **No analytics instrumentation.** Several BRD success metrics are
  self-reported/qualitative because the MVP ships no analytics. Tracked as a gap.

---

## 7. ADRs (v3.0 decision log)

> ADRs legitimately record chosen technologies with rationale. They are the one
> place in the constitution where tech names appear — by design.

| ID | Decision | Status |
|---|---|---|
| **D-3.0-01** | Shopify as the commerce platform + Hydrogen (React Router/Remix) as the storefront framework. Supersedes Next.js. | ✅ |
| **D-3.0-02** | No Shopify Checkout, no payment gateway. Cart → Telegram only. (Reaffirms v2.1 D-2.1-03.) | ✅ |
| **D-3.0-03** | No database, no ORM, no CMS-of-our-own. Catalog/blog in Shopify; orders in Telegram only. | ✅ |
| **D-3.0-04** | Telegram is a one-way notification channel (no command bot). Supersedes D-2.1-04. | ✅ |
| **D-3.0-05** | Single deployable app, no monorepo. Supersedes D-2.1-06. | ✅ |
| **D-3.0-06** | Storefront API public token only — no Admin API in the MVP. | ✅ |
| **D-3.0-07** | Personalization via Shopify variants (structured) + cart line attributes (free text). | ✅ |
| **D-3.0-08** | No LLM in runtime. Agentic future documented as a ladder (§5). (Reaffirms v2.1 D-2.1-01.) | ✅ |
| **D-3.0-09** | Project renamed "Nenúfar" (brand) / `nenufar` (code). | ✅ |
| **D-3.0-10** | Fresh Hydrogen starter, rebranded. No website-clone / Krafti port. | ✅ |
| **D-3.0-11** | Doc convention: constitution = guardrails/decisions only; stack & data live in the TSD. | ✅ |

### v2.1 ADR supersession map

| v2.1 ADR | v3.0 status |
|---|---|
| D-2.1-01 (No LLM) | Reaffirmed → D-3.0-08 |
| D-2.1-02 (No n8n) | Moot — no async work in v3.0 |
| D-2.1-03 (No payment) | Reaffirmed → D-3.0-02 |
| D-2.1-04 (Telegram command center) | **Superseded** → D-3.0-04 |
| D-2.1-05 (Shirley context layer via `/nuevo`) | **Superseded** — buyer assembles order |
| D-2.1-06 (pnpm monorepo) | **Superseded** → D-3.0-05 |
| D-2.1-07 (`available=false` excludes) | Concept persists (unpublished products excluded) |
| D-2.1-08 (immutable items snapshot) | **Superseded** — no orders table; cart is transient |
| D-2.1-09 (`AX-XXXX` sessionCode) | **Superseded** — no codes |
| D-2.1-10 (webhook security) | **Superseded** — no inbound webhook |
| D-2.1-11 (command idempotency) | **Superseded** → order-submission idempotency (§2.10) |
| D-2.1-12 (storefront = no cart, `wa.me`) | **Superseded** — we now HAVE a cart |
| D-2.1-13 (posts formats) | **Superseded** — Shopify blog |
| D-2.1-14 (Drizzle + payload-types) | **Superseded** — no ORM/Payload |
| D-2.1-15 (zero recurring cost) | **Modified** — Shopify subscription is a recurring cost |

v1.0 and v2.1 ADRs remain frozen as historical reference; they do not apply to v3.0.

---

## 8. Spec conventions

Each capability `spec.md` follows:

1. **Context and objective**
2. **Functional requirements** — `RF-NN.x`
3. **Acceptance criteria** — **Given/When/Then**, `CA-NN.x`
4. **Out of scope**
5. **Dependencies**
6. **Open questions** — marked `PENDING`

Every identifier must match the constitution principles, the SDD modules, and the
TSD stack/data. Language for all specs: **English** (technical artifacts).
Storefront copy and Telegram messages are Spanish.

---

## 9. Glossary (v3.0)

- **Cart-as-order** — the cart object carries items, variants, and
  personalization; it is the order payload posted to Telegram. Transient.
- **Notification channel (Telegram)** — a one-way channel the bot posts to. Not a
  chatbot; no inbound commands.
- **Personalization** — structured options as Shopify variants (material, size);
  free text as cart line attributes (engraving, notes).
- **Maturity ladder** — the documented path from deterministic MVP (L0) to full
  agentic (L4). See §5.

v1.0/v2.1 glossary (handoff, AX-XXXX, context layer, command center, daily
digest, photo-to-draft, immutable snapshot) is archived — it does not apply to v3.0.

---

## 10. Changes relative to v2.1

| Before (v2.1) | Now (v3.0) | Reason |
|---|---|---|
| Next.js + Payload storefront | Shopify + Hydrogen headless | D-3.0-01 |
| Payload CRM (products/orders/posts) | Shopify admin (products/articles); no orders table | D-3.0-03 |
| Telegram command bot | One-way notification channel | D-3.0-04 |
| pnpm monorepo | Single app | D-3.0-05 |
| Storefront = no cart, `wa.me` CTA | Cart + personalization → Telegram | D-2.1-12 supersede |
| Orders state machine | None — single one-way flow | §3 |
| Constitution held stack + data model | Delegated to TSD; constitution = guardrails + ADRs | D-3.0-11 |
| "Nenúfar" / `nenufar` | D-3.0-09 |
| Agentic = "deferred" (vague) | Documented maturity ladder L0–L4 | §5 |
