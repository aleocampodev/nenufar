# BRD — Business Requirement Document
**Project:** Agento — Nénufar (Handmade Jewelry)
**Version:** 2.1 (MVP pivot — catalog + blog + CRM + Telegram command center)
**Date:** July 2026
**Supersedes:** v1.1 (agentic chat MVP, frozen) · v2.0 (audited, fixes applied)

---

## 1. Executive Summary

**Nénufar** is a small handmade jewelry operation in Cartagena, Colombia, run
by its owner Shirley. She designs and crafts high-value pieces (emeralds, gold,
silver) and sells them mainly through WhatsApp and Instagram DMs. She has no
physical store and no staff — her phone is her office.

Her pain is not "I need a chatbot to replace me." Her pain is: **she runs the
entire business from her phone and has no system.** She misses orders, forgets
to confirm payments, doesn't know her daily numbers, and uploading a new
product to a web catalog means stopping production to open a laptop.

**Agento MVP v2.1** is not an agentic chat. It is **three simple tools for a
solopreneur**:

1. **An editorial storefront** (home + catalog + blog) so her brand has a public
   face and her products are discoverable on the web.
2. **An intrinsic CRM** (Payload admin) so orders, payments, and dispatches live
   in one place — not in her memory.
3. **A Telegram command center** so she operates the business FROM her phone:
   pings when orders arrive, `/pagado` to confirm payments, `/despachado` to
   mark shipped, daily digest at 9am, and photo-to-draft for new products.

The agentic conversational layer (RAG discovery, handoff, closing agent, catalog
analyst) is **deferred** to a later phase. The MVP validates a simpler
hypothesis: if Shirley has a storefront + a lightweight CRM + Telegram as her
command center, she saves hours per week, stops dropping orders, and her brand
has a professional web presence.

---

## 2. Business Objectives

- Give Nénufar a **professional web presence** (storefront + blog) that convenes
  qualified traffic and showcases her jewelry, without the friction of building
  and maintaining a traditional e-commerce.
- **Centralize order management** in a single CRM so Shirley stops tracking
  orders in her memory / WhatsApp chat history / notebooks.
- **Move Shirley's daily operations to her phone** via Telegram so she can
  confirm payments, mark dispatches, check order status, and get daily
  summaries without opening a laptop.
- **Reduce the friction of catalog management** so uploading a new piece takes
  seconds (photo-to-draft from Telegram), not a 15-minute laptop session.
- Prepare the architectural foundation (monorepo, Payload, Drizzle, Telegram
  bot) so the agentic conversational layer can be added in a future phase
  without rework.

---

## 3. Scope

### 3.1 Included in the MVP (v2.1)

| # | Capability | Description |
|---|---|---|
| 01 | Storefront | Editorial storefront (home, masonry product gallery at `/tienda`, blog at `/blog`). The UI was cloned from the Krafti reference site using the `ai-website-cloner-template` tool (JCodesMore, https://github.com/JCodesMore/ai-website-cloner-template) — the resulting Next.js codebase lives in the monorepo at `apps/web/src/{components,hooks,lib,types}` and `apps/web/src/app/(app)/`. The current code still carries Krafti branding, English copy, and USD demo data from the reference; it MUST be rebranded to Nénufar (terracota + cream + navy, Alegreya/Lato), translated to Spanish, and hydrated from Payload (`products`, `posts`) via server components — no hardcoded demo arrays. Spanish, COP. NO cart, NO checkout, NO "add to cart." CTAs route to WhatsApp (`wa.me`) so the customer contacts Shirley directly. |
| 02 | Blog | `Posts` collection in Payload with Lexical editor. Formats: standard, quote, audio. Renders editorially on the storefront. SEO-friendly (metadata, slugs, Open Graph). |
| 03 | CRM (Payload Admin) | Admin panel with two operator-facing collections: **Catalog** (`products`) and **Dispatches** (`orders`). Shirley creates products, sees orders, confirms payments (`CHECKOUT_READY → PAID`), marks dispatches (`PAID → DISPATCHED`). No "leads," no "stages," no funnel management. |
| 04 | Telegram Command Center | A Telegram bot that acts as Shirley's mobile command center: (a) real-time pings when new orders arrive, (b) command-reply `/pagado AX-XXXX` and `/despachado AX-XXXX` to mutate order state, (c) daily digest at 9am, (d) `/pedido AX-XXXX` to query order status, (e) photo-to-draft: send a photo to the bot → creates a product draft in Payload with `available: false`, (f) `/nuevo` so Shirley can manually register an order from her phone (she IS the context layer in the MVP). |
| 05 | Monorepo Structure | pnpm workspaces: `apps/web` (storefront + Payload admin embedded + telegram webhook), `packages/db` (Drizzle), `packages/types` (payload-types + Zod), `packages/telegram` (bot command handler). One deploy. End-to-end type safety. |

### 3.2 Explicitly out of scope (v2.1)

- **Agentic conversational layer** — RAG discovery, handoff `AX-XXXX`, closing
  agent, Catalog Analyst, Conversation Compressor. All frozen for a later phase.
- **Payment gateway** (Wompi/Stripe). Payment settles externally (Nequi,
  transfer, cash on delivery). Shirley confirms manually via Telegram or admin.
- **Customer-facing chatbot** — no Telegram bot for customers, no WhatsApp
  Cloud API integration, no Instagram DM automation. Telegram is for Shirley
  only, not for buyers.
- **Social media aggregator** — reading WhatsApp/Instagram/Facebook inboxes
  via APIs. Shirley manually inputs orders via Telegram `/nuevo` command.
- **Automated payment reminders / re-engagement crons** — no chasing
  customers, no templates, no 24h Meta window management.
- **Customer authentication** — no login, no account, no order history for
  buyers. The storefront is public; purchase happens via WhatsApp to Shirley.
- **Meta Commerce Catalog** — no WhatsApp catalog sync.
- **n8n** — async work via Next route handlers.

---

## 4. Stakeholders

| Role | Description | Primary interest |
|---|---|---|
| Shirley (owner-operator, B2B) | Solopreneur. Designs, crafts, sells, packs, and ships jewelry. Runs everything from her phone. Her tools today: WhatsApp, Instagram, a notebook, memory. | Professional web presence, stop dropping orders, operate the business from her phone, save hours per week. |
| End buyer (B2C) | Tourist, gift shopper, or repeat customer looking for high-value Colombian artisan jewelry. Discovers Nénufar on the web or via Instagram, contacts Shirley on WhatsApp to buy. | See real product photos, prices in COP, feel trust in the brand, contact the owner directly. |
| Product team | Design and evolution of the MVP | Validate that storefront + CRM + Telegram command center is enough to move Shirley from "memory + WhatsApp" to a lightweight system. |

---

## 5. Core Hypothesis to Validate

If a solopreneur jeweler has (1) a professional editorial storefront showing
her catalog and blog, (2) a lightweight CRM to track orders and confirm
payments, and (3) a Telegram bot that lets her confirm payments, dispatch
orders, and get daily summaries from her phone, she will:

- Save ≥ 5 hours per week on administrative work.
- Reduce the order-drop rate by ≥ 80% (i.e., if she currently drops 10
  orders/month by losing track, target ≤ 2 dropped orders/month).
- Upload new products at least 2x more often (because photo-to-draft removes
  the laptop friction).
- Have a clear picture of her weekly revenue and pending tasks without
  calculating manually.

The agentic hypothesis (LLM replaces Shirley in closing sales) is NOT tested
in this MVP. It is deferred to a later phase once the operational foundation is
in place and Shirley is actually using the system.

---

## 6. Success Metrics

| Metric | Definition | Target (month 1) |
|---|---|---|
| Time saved | Hours per week Shirley spends on order admin, payment tracking, and catalog management vs her current manual flow | ≥ 5 hours/week saved |
| Order capture rate | % of customer inquiries (WhatsApp/Instagram) that become tracked orders in the CRM | ≥ 80% (baseline ≈ 30% today, estimated — to baseline in week 1) |
| Catalog freshness | Number of new products uploaded per month | ≥ 5 new products in month 1 (no prior system baseline) |
| Daily digest engagement | % of days Shirley interacts with the Telegram bot (reads or commands) | ≥ 90% of business days |
| Operational visibility | Shirley can tell her current pending payments and pending dispatches in < 10 seconds from her phone | 100% (via Telegram `/pendientes`) |
| Storefront traffic | Unique visitors to nenufar.com per month | Baseline (no prior site — first-month number establishes the baseline) |

> Note: No AI-token-cost metric in this MVP because there is no LLM in the
> runtime path. The cost metric returns in the agentic phase.

---

## 7. Assumptions and Risks

### 7.1 Assumptions

- Shirley has a smartphone with Telegram installed (or is willing to install
  it — it's free and takes 2 minutes).
- Shirley is willing to manually input orders via Telegram `/nuevo` when a
  customer writes her on WhatsApp. This is the "context layer" of the MVP —
  Shirley is the bridge between her social channels and the system.
- The volume of orders in the first month is low enough (10-50 orders) that
  manual input is faster than building social-media API integrations.
- Shirley has a number for WhatsApp Business already; the storefront `wa.me`
  CTA links to that number so customers contact her directly.

### 7.2 Risks

- **Adoption risk:** Shirley may find Telegram commands (/pagado, /nuevo)
  clunky and revert to her notebook. Mitigation: commands are 1-line; photo
  upload is native (just send a photo); daily digest is passive (just read);
  `/help` shows all available commands.
- **Manual-input fatigue:** if order volume spikes, `/nuevo` becomes a
  bottleneck. Mitigation: this signals it's time for the agentic phase (auto
  ingestion from WhatsApp).
- **No customer-facing automation:** customers still need Shirley to respond
  manually on WhatsApp. If she's slow, she loses sales. Mitigation: the
  storefront has a clear `wa.me` CTA so customers can reach Shirley directly;
  the Daily Digest reminds her of pending items she needs to chase.
- **Storefront traffic risk:** without SEO history, nenufar.com may get low
  traffic initially. Mitigation: blog content (spec 02) drives organic search;
  Instagram bio links to the storefront.

---

## ChangeLog

### v2.0 → v2.1 (audit fixes)
- **E1 fixed:** Capability 05 description corrected to remove ghost "chat route"
  reference. Replaced with "telegram webhook."
- **E2 fixed:** Risk §7.2 mitigation for "no customer-facing automation" no
  longer references a ghost "ping on storefront traffic" feature. Rewritten to
  reference actual features (wa.me CTA + Daily Digest).
- **E5 fixed:** Changelog direction arrow corrected (v2.0 → v2.1, not v2.0 → v1.1).
- **E7 fixed:** Hypothesis §5 rewritten — "reduce the order-drop rate by ≥ 80%"
  instead of ambiguous "stop dropping ≥ 80% of orders."
- **M1 fixed:** Order capture rate baseline annotated as "estimated — to
  baseline in week 1."
- **M2 fixed:** Catalog freshness target changed from "≥ 2x baseline" (no
  prior baseline existed) to "≥ 5 new products in month 1."
- **G6 fixed:** Storefront traffic marked as establishing baseline in first
  month, not a target.

### v1.1 → v2.0 (pivot)
- **Agentic chat DROPPED from MVP.** Discovery agent, closing agent, handoff,
  Catalog Analyst, Conversation Compressor — all frozen for a later phase.
- **Channel reverted to manual.** Customer contacts Shirley on WhatsApp
  directly via `wa.me` CTA from the storefront. No chatbot, no LLM in runtime.
- **Telegram repurposed.** From "customer channel candidate" to "Shirley's
  mobile command center." Bot receives pings and commands, not customer
  conversations.
- **Payment model simplified.** No pasarela, no webhook. Shirley confirms
  payments manually via Telegram `/pagado` or Payload admin.
- **Context layer = Shirley.** She manually bridges social channels → system
  via Telegram `/nuevo`. No social media API integrations in the MVP.
- **Capabilities reduced from 9 to 5.** Dropped: vector indexing, semantic
  discovery, handoff bridge, webchat closing, observability (token logs),
  catalog analyst, conversation compressor.
- **New capabilities:** 04-telegram-command-center (Tier 1 + Tier 2 features).
- **Hypothesis changed.** From "agent replaces Shirley in closing" to "storefront
  + CRM + Telegram save Shirley 5 hours/week and stop dropped orders."
- **KPIs changed.** Dropped token-cost and handoff/closing rates. Added: time
  saved, order capture rate, catalog freshness, daily digest engagement.
- **Stack simplified.** No Gemini in runtime, no Redis, no pgvector (for now),
  no Upstash QStash. Storefront + Payload + Drizzle + Telegram Bot API.