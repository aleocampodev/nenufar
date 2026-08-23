# Nénufar — Claude Code Context

> 🏛️ **CANONICAL GOVERNANCE & CONSTITUTION:** See [`CONSTITUTION.md`](./CONSTITUTION.md) for the supreme 7 Articles governing architecture, Git guardrails, $0/mo cost policy, and quality standards.

## Working Rules

- **Never make changes directly on `main`.** Always create a feature branch (`feature/...`) and work from a separate worktree.
- Development worktree: `/home/ale/Work/nenufar-dev`
- For each feature: `git worktree add ../nenufar-dev feature/<name>` before editing.

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

## Shirley's management bot (v3.2 — Shirley only)

The same `TELEGRAM_BOT_TOKEN` also receives messages via webhook, but **only from Shirley** (authenticated by `TELEGRAM_ADMIN_CHAT_ID`). It's her tool to manage the store from Telegram — view orders, confirm, update stock — without opening the admin. **Buyers never write to the bot**; their journey is 100% web (catalog + cart + form → notification). There is no buyer chat and no web chat widget (no Chat SDK / Vercel AI SDK — intentional).

```
Shirley → POST /telegram/webhook → chat_id==ADMIN? → routeAndRun() (Groq) → skill over Payload → reply to Shirley
```

- `src/lib/groq.ts` — Groq client (singleton)
- `src/lib/agents/*` — orchestrator + skills (tool-calling loop, max 4 rounds)
- `src/app/(app)/telegram/webhook/route.ts` — webhook (validates secret, checks chat_id, dedups by `update_id`)
- Route lives at `/telegram/webhook`, NOT `/api/...` (Payload's catch-all owns `/api`).
- Full detail: `docs/SDD.md §2.3`, `.claude/HANDOFF-agents.md`.

## Required configuration

Minimum environment variables (see `.env.example`):

```
PAYLOAD_SECRET=          # Payload secret
DATABASE_URL=            # PostgreSQL (docker-compose runs postgres on :5433)
NEXT_PUBLIC_SERVER_URL=  # Public URL (e.g. http://localhost:3002)
TELEGRAM_BOT_TOKEN=      # Telegram bot token (from BotFather) — orders + Shirley's bot
TELEGRAM_CHANNEL_ID=     # Telegram channel ID (@name or -100xxxxxxxx)
GROQ_API_KEY=            # Groq API key (free — console.groq.com) — v3.2 bot
TELEGRAM_WEBHOOK_SECRET= # Random string authenticating the webhook — v3.2 bot
TELEGRAM_ADMIN_CHAT_ID=  # Shirley's chat_id (@userinfobot) — only sender the bot processes
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
/telegram/webhook    → Shirley's management bot webhook (POST — Shirley's chat_id only)
```

## Brand color

Nénufar violet (`#6A1B9A`) is formalized as a CSS token:
- `bg-brand` / `text-brand` / `hover:bg-brand-dark`
- Defined in `globals.css` as `--brand: oklch(38% 0.2 307deg)`

## Architecture notes

- **No Stripe**: intentionally commented out. `payments.paymentMethods: []` in the plugin.
- **Idempotency**: in-memory Map (single-instance). For multi-instance deployments → Vercel KV.
- **Currency & Formatting**: Colombian Pesos using symbol (`$`) with 0 decimals (`Intl.NumberFormat('es-CO')`, e.g. `$ 45.000`). Never display the raw `"COP"` string to end users.
- **Language Separation**: User-Facing UI and Telegram messages strictly in Spanish (`es-CO`). Codebase, comments, commits, PRs, and documentation strictly in English.
- **Buyer fields**: `buyerName` and `buyerContact` (WhatsApp) are stored in `order.shippingAddress.firstName` and `.phone` (temporary hack; Phase 6 adds proper fields via ordersCollectionOverride).
- **Telegram splitting**: messages > 4000 chars are not split (documented gap).
- **Personalization flow**: custom orders include a mandatory free-text field. The Telegram message header changes to "✦ Pedido PERSONALIZADO" and includes a highlighted PERSONALIZATION block.
