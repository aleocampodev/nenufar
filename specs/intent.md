# Intent — Agento Nénufar

## Hypothesis

A solopreneur jeweler who runs her entire business from her phone (Shirley,
Nénufar — handmade jewelry in Cartagena, Colombia) will save ≥ 5 hours per week
and reduce dropped orders by ≥ 80% if she has (1) a professional editorial
storefront showing her catalog and blog, (2) a lightweight CRM tracking orders
and confirmations, and (3) a Telegram bot acting as her mobile command center
for confirming payments, marking dispatches, and reviewing her day.

The earlier agentic hypothesis (an LLM replaces Shirley in closing sales on
WhatsApp) is **frozen for a later phase.** No LLM runs in the runtime path. The
MVP validates a simpler operational backbone.

## User Problem

Shirley designs and crafts high-value pieces (emeralds, gold, silver) and sells
through WhatsApp and Instagram. She has no physical store, no staff, no system.
Her phone is her office. She misses orders, forgets to confirm payments, doesn't
know her daily numbers, and uploading a new product to a web catalog means
stopping production to open a laptop.

She does not need "a chatbot to replace her." She needs three simple tools:

1. A storefront so her brand has a public face and her products are discoverable.
2. A CRM so orders, payments, and dispatches live in one place — not her memory.
3. A phone-first command center so she can confirm payments, mark dispatches,
   query order status, capture new products from a photo, and get a daily
   digest — all from Telegram.

## Target Audience

- **Shirley (owner-operator).** Solopreneur. Designs, crafts, sells, packs,
  ships. Primary device: phone. Tools today: WhatsApp, Instagram, a notebook,
  memory. She is the only authorized user of the Telegram bot.
- **End buyer (B2C).** Tourist, gift shopper, or repeat customer looking for
  high-value Colombian artisan jewelry. Discovers Nénufar on the web or via
  Instagram, contacts Shirley on WhatsApp to buy. There is **no customer-facing
  chatbot** in this MVP — Telegram is for Shirley only.

## Scope & In-Scope

- Editorial storefront (home + `/tienda` masonry + `/blog`) hydrated from
  Payload headless via Next.js server components. ISR + on-demand revalidation.
  Spanish, COP. No cart, no checkout — CTAs route to `wa.me`. The UI was
  cloned from the Krafti reference site using the
  `ai-website-cloner-template` tool (JCodesMore,
  https://github.com/JCodesMore/ai-website-cloner-template); the resulting
  code is part of the Nénufar monorepo at `apps/web/src/` and is in the
  process of being rebranded from Krafti → Nénufar (terracota + cream + navy,
  Alegreya/Lato).
- Blog (`Posts` collection, Lexical) with `standard | quote | audio` formats,
  SEO metadata, Open Graph.
- Lightweight CRM (Payload admin): two operator-facing collections — `products`
  (Catalog) and `orders` (Dispatches). No leads, no funnel stages.
- Telegram command center: real-time pings on new orders, `/nuevo`,
  `/pagado AX-XXXX`, `/despachado AX-XXXX`, `/pedido AX-XXXX`, `/pendientes`,
  `/help`, photo-to-draft (creates `products` doc with `available=false`), and
  a 09:00 America/Bogota daily digest via external cron.
- pnpm monorepo: `apps/web` (storefront + Payload admin + Telegram webhook
  route), `packages/db` (Drizzle), `packages/types` (payload-types + Zod),
  `packages/telegram` (command handler). Single deploy. End-to-end TypeScript.

## Non-Goals

- Agentic conversational layer (RAG discovery, handoff `AX-XXXX` via WhatsApp,
  closing agent, Catalog Analyst, Conversation Compressor). Frozen for a later
  phase.
- Payment gateway (Wompi/Stripe). Settlement is external (Nequi, transfer,
  cash on delivery). Shirley confirms manually via Telegram or admin.
- Customer-facing Telegram bot or WhatsApp Cloud API integration. Telegram is
  for Shirley only — not for buyers.
- Semantic search via pgvector / embeddings. No `product_embeddings` table.
- n8n orchestration. Async work lives in Next.js route handlers + external cron.
- Customer authentication / accounts / order history.
- Token-cost metric / unit economics. No LLM in runtime — nothing to audit.