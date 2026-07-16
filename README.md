# Agento — Nénufar (Handmade Jewelry)

[![Status](https://img.shields.io/badge/Status-MVP_v2.1-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js_16_|_Payload_3.0_|_Supabase_|_Telegram-blue.svg)](#)
[![No LLM](https://img.shields.io/badge/Runtime-No_LLM-green.svg)](#)

The operational backbone for **Shirley**, a solopreneur jeweler in Cartagena,
Colombia. She designs, crafts, and sells handmade jewelry (emeralds, gold,
silver) — her phone is her office. This monorepo gives her three simple tools
that replace her memory + WhatsApp + notebook:

1. **Storefront** — an editorial website (catalog + blog) where buyers discover
   her work and contact her on WhatsApp.
2. **CRM** — a lightweight Payload admin to track products and orders.
3. **Telegram command center** — a bot she operates from her phone to confirm
   payments, mark dispatches, query status, capture product drafts from photos,
   and get a daily digest at 9am.

**No LLM in runtime. No payment gateway. No n8n.** Shirley is the context
layer — she manually bridges WhatsApp/Instagram → system. The agentic phase
(LLM closes sales autonomously) is frozen for a later iteration.

---

## Monorepo structure

```
nenufar-monorepo/
├── apps/
│   └── web/                  # Next.js 16 + Payload 3.0 (storefront + admin + webhooks)
│       └── src/
│           ├── app/
│           │   ├── (app)/    # Storefront routes: /, /tienda, /blog
│           │   ├── (payload)/# Admin: /admin, /api/*
│           │   └── api/
│           │       ├── webhooks/telegram/   # Telegram bot webhook
│           │       └── cron/daily-digest/   # 9am digest route handler
│           ├── collections/  # Products, Orders, Posts
│           ├── components/   # Storefront UI (cloned from Krafti reference)
│           └── payload.config.ts
├── packages/
│   ├── db/                   # Drizzle ORM (mirrors Payload schema)
│   ├── types/                # payload-types.ts + Zod schemas
│   └── telegram/             # Command parser + handlers
├── docs/                     # BRD, PRD, TRD, SDD
├── specs/                    # SDD constitution, intent, diagrams
└── pnpm-workspace.yaml
```

Single deploy. End-to-end TypeScript. `tsc --noEmit` blocks merge.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, RSC, ISR) |
| CMS / CRM | Payload CMS 3.0 (embedded, headless + admin) |
| ORM | Drizzle (`packages/db`) |
| Database | PostgreSQL 15+ (Supabase, free tier — no pgvector) |
| Media | Supabase Storage (product-drafts bucket, blog covers) |
| Bot | Telegram Bot API (webhook, single route handler) |
| Customer channel | WhatsApp via `wa.me` deep link (no Meta API) |
| Cron | Upstash QStash (or equivalent) → `/api/cron/daily-digest` |
| Payments | None in runtime — external manual reconciliation (Nequi, transfer, cash) |
| Monorepo | pnpm workspaces |

---

## Order lifecycle

```
/nuevo (Telegram) or Admin "Create order"
    │
    ▼
[ CHECKOUT_READY ] ── Admin "Cancel" ──► [ CANCELLED ]
    │
    │  /pagado AX-XXXX
    ▼
[ PAID ] ── Admin "Cancel" ──► [ CANCELLED ]
    │
    │  /despachado AX-XXXX
    ▼
[ DISPATCHED ]  (end of cycle)
```

All transitions are deterministic (fired by explicit human action) and
idempotent (Telegram retries cause no duplicate effects).

---

## Documentation

| Document | Path | Description |
|---|---|---|
| BRD | `docs/BRD.md` | Business requirements (source of truth) |
| PRD | `docs/PRD.md` | Product requirements + acceptance criteria |
| TRD | `docs/TRD.md` | Technical specification |
| SDD | `docs/SDD` | Software design document |
| Constitution | `specs/constitution.md` | SDD guardrails (non-negotiable principles) |
| Intent | `specs/intent.md` | Vision & scope |
| Diagrams | `specs/*.excalidraw` | Product overview + architecture |

---

## Getting started

```bash
pnpm install
pnpm --filter web dev
```

Environment variables needed (see `.env.example`):

- `DATABASE_URI` — Supabase PostgreSQL connection string
- `PAYLOAD_SECRET` — Payload session secret
- `TELEGRAM_BOT_TOKEN` — Bot token from @BotFather
- `TELEGRAM_WEBHOOK_SECRET` — Webhook validation secret
- `SHIRLEY_TELEGRAM_CHAT_ID` — Authorized chat ID
- `WHATSAPP_BUSINESS_NUMBER` — Shirley's WhatsApp number for `wa.me` CTAs

---

## Capabilities

| # | Capability | Status |
|---|---|---|
| 01 | Storefront (catalog + masonry `/tienda` + `wa.me` CTA) | Foundation laid — rebranding pending |
| 02 | Blog (`/blog`, format-aware rendering, SEO/OG) | Collection defined |
| 03 | CRM (Payload admin: products + orders) | Collections defined |
| 04 | Telegram Command Center | Webhook stub + command stubs |
| 05 | Monorepo Structure | pnpm workspaces operational |
