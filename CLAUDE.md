# Nénufar — Claude Code Context

## Working Rules

- **Never make changes directly on `main`.** Always create a feature branch (`feature/...`) and work from a separate worktree.
- For each feature: `git worktree add ../<name> feature/<name>` before editing.
- Active worktrees: `../nenufar-dev` (feature/sharp-image-optimization), `../nenufar-telegram` (feature/telegram-agentes), `../nenufar-docs` (feature/docs-update).

## What is this project

Colombian artisan jewelry store by Shirley (Cartagena). Stack: **Payload CMS v3 + Next.js App Router + PostgreSQL + TailwindCSS + shadcn/ui**.

Based on the `@payloadcms/plugin-ecommerce` template. The purchase flow has **no online payment gateway**: the buyer fills out a form → a message is sent to Telegram with the order details → Shirley coordinates payment and shipping manually via WhatsApp.

## Order flow (core business logic)

```
/shop → /products/[slug] → cart → /pedidos/enviar → Telegram + Payload Order → /pedidos/enviar/confirmacion
```

- `src/app/(app)/pedidos/enviar/OrderForm.tsx` — form (name, WhatsApp, personalization, consent). Two modes: standard and custom.
- `src/app/(app)/pedidos/enviar/submitOrderAction.ts` — server action: validates, creates Order in Payload, sends to Telegram
- `src/lib/telegram.ts` — Telegram client (real, not a stub)
- `src/lib/order-formatter.ts` — formats the HTML message for Telegram. Includes a prominent PERSONALIZATION block when custom mode is used.

## Required configuration

Minimum environment variables (see `.env.example`):

```
PAYLOAD_SECRET=                   # Payload secret
DATABASE_URL=                     # PostgreSQL (docker-compose runs postgres on :5433)
NEXT_PUBLIC_SERVER_URL=           # Public URL (e.g. http://localhost:3002)
TELEGRAM_BOT_TOKEN=               # Orders bot token — sends order summaries to Shirley's channel
TELEGRAM_CHANNEL_ID=              # Shirley's channel ID (@name or -100xxxxxxxx)

# v3.2 — AI assistant bot (feature/telegram-agentes)
TELEGRAM_ASSISTANT_BOT_TOKEN=     # Conversational bot token (separate from orders bot)
TELEGRAM_WEBHOOK_SECRET=          # Random secret for webhook authentication
GROQ_API_KEY=                     # Free at console.groq.com — powers the AI agents
# GROQ_MODEL=llama-3.3-70b-versatile  # Optional override
```

## Key commands

```bash
docker-compose up -d    # start PostgreSQL on port 5433
pnpm dev                # dev server on port 3002 (not 3000)
pnpm build              # production build (includes payload build)
pnpm payload migrate    # run migrations in production
```

To seed test data: go to `/admin` → "Seed database" on the dashboard.

## Frontend route structure

```
/                    → home (CMS page builder, slug: 'home')
/shop                → catalog with search and filters
/products/[slug]     → product detail with variants + "Personalize this piece" button
/blog                → blog post listing
/blog/[slug]         → individual post (Lexical rich text)
/pedidos/enviar      → order confirmation form (standard or custom mode)
/pedidos/enviar/confirmacion → post-order success screen
/sobre-nenufar       → brand story (static)
/contacto            → contact info (static)
/privacidad          → privacy policy (Ley 1581/2012)
/terminos            → terms and conditions
/eventos             → upcoming events
/find-order          → look up order by ID + email (guests)
/(account)/          → user account, orders, addresses
```

## Brand color

Nénufar violet (`#6A1B9A`) is formalized as a CSS token:
- `bg-brand` / `text-brand` / `hover:bg-brand-dark`
- Defined in `globals.css` as `--brand: oklch(38% 0.2 307deg)`

## Architecture notes

- **No Stripe**: intentionally commented out. `payments.paymentMethods: []` in the plugin.
- **Idempotency**: in-memory Map (single-instance). For multi-instance deployments → Vercel KV.
- **Currency**: COP, no decimals. `Intl.NumberFormat('es-CO', { currency: 'COP' })`.
- **Buyer fields**: `buyerName` and `buyerContact` (WhatsApp) are stored in `order.shippingAddress.firstName` and `.phone` (temporary hack; Phase 6 adds proper fields via ordersCollectionOverride).
- **Telegram splitting**: messages > 4000 chars are not split (documented gap).
- **Personalization flow**: custom orders include a mandatory free-text field. The Telegram message header changes to "✦ Pedido PERSONALIZADO" and includes a highlighted PERSONALIZATION block.

## AI Assistant Bot (feature/telegram-agentes)

Conversational Telegram bot for buyers. Separate bot token from the orders notification bot.

```
src/lib/groq.ts                          — Groq client (GROQ_API_KEY)
src/lib/agents/types.ts                  — AgentContext, Skill, Agent interfaces
src/lib/agents/runtime.ts               — tool-calling loop (max 4 rounds)
src/lib/agents/orchestrator.ts          — routeAndRun(): classifies → delegates
src/lib/agents/catalogo.ts              — Catalog agent + buscarProductos skill
src/lib/agents/conversacion.ts          — Conversation agent + derivarAShirley skill
src/lib/agents/skills/buscarProductos.ts — payload.find({ collection: 'products' })
src/lib/agents/skills/derivarAShirley.ts — notifies Shirley; tells buyer to expect her call
src/app/(app)/telegram/webhook/route.ts  — POST /telegram/webhook (not under /api)
scripts/set-telegram-webhook.ts          — pnpm tsx scripts/set-telegram-webhook.ts <url>
tests/int/agents.int.spec.ts            — 4 tests; Groq + Telegram mocked; all pass
```

**Business guardrail**: agents assist and hand off — never close sales, confirm orders, or process payment. Shirley always closes.
