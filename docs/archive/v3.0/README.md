# Nénufar (Handmade Jewelry)

[![Status](https://img.shields.io/badge/Status-MVP_v3.0-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Hydrogen_|_Shopify_Storefront_API_|_Telegram-blue.svg)](#)
[![No LLM](https://img.shields.io/badge/Runtime-No_LLM-green.svg)](#)
[![No DB](https://img.shields.io/badge/Persistence-Telegram_only_(MVP)-orange.svg)](#)

The storefront for **Shirley**, a solopreneur jeweler in Cartagena, Colombia.
She designs, crafts, and sells handmade jewelry (emeralds, gold, silver). This
repo gives her **one simple thing**: a professional website where buyers browse
her catalog and blog and **assemble a personalized order themselves** — and on
"Send order", the order lands as one structured message in a **Telegram channel**
she reads from her phone.

**No checkout. No payment gateway. No database of our own. No chatbot.** Shirley
closes and fulfills manually on WhatsApp, the way she always has — but the buyer
does the intake work, structured.

> **Nenúfar** (the brand
> name) because the MVP is deterministic and the old name implied an agentic
> system that is deferred (see the maturity ladder in the constitution).

---

## How it works

```
Buyer browses catalog → picks variant + personalization → cart
   → "Send order" → server action reads the cart
        → formats a structured message → posts to a Telegram channel
        → buyer sees "order sent ✓"
Shirley reads the channel → closes on WhatsApp → fulfills (off-system)
```

- Catalog and blog are managed in the **Shopify admin** and rendered headless
  via the **Storefront API**.
- The cart carries personalization: structured options (material, size) as
  Shopify variants, free text (engraving, notes) as line attributes.
- **Telegram is one-way notification only** — no command bot, no daily digest.
- Orders are **not persisted** (the channel is the only record — a known MVP
  debt, resolved at agentic level L3+).

---

## Tech stack

| Layer | Technology |
|---|---|
| Storefront | **Hydrogen** (React Router v7 / Remix) — single app |
| Catalog & blog backend | **Shopify admin** |
| Storefront data | **Shopify Storefront API** (GraphQL, public token) |
| Order submission | Remix server action |
| Notification | **Telegram Bot API** `sendMessage` (server-side, one-way) |
| Hosting | **Oxygen** (native to Hydrogen) |
| Payments | None in runtime — external manual reconciliation |
| Runtime LLM | None — deferred |

No monorepo, no Payload, no database, no ORM, no packages.

---

## Project structure

```
nenufar/
├── app/
│   ├── routes/
│   │   ├── (_index).tsx              # /
│   │   ├── colecciones.tsx           # /colecciones
│   │   ├── productos.$handle.tsx     # /productos/:handle  (+ personalization)
│   │   ├── blog._index.tsx           # /blog
│   │   ├── blog.$articleHandle.tsx   # /blog/:slug
│   │   ├── carrito.tsx               # /carrito
│   │   ├── pedidos.enviar.tsx        # /pedidos/enviar  (order form + action)
│   │   └── privacidad.tsx            # /privacidad      (Ley 1581)
│   ├── lib/
│   │   ├── telegram.ts               # sendMessage (server-only)
│   │   ├── order-formatter.ts        # cart → message (pure)
│   │   ├── consent.ts
│   │   └── idempotency.ts
│   └── components/
├── docs/                             # BRD · PRD · SDD · TRD(TSD)
├── specs/                            # constitution · intent · diagrams
└── package.json
```

---

## Documentation

The project follows the standard **BRD → PRD → SDD → TSD** convention, plus a
Spec-Kit layer (`specs/`) for guardrails and the seed vision.

| Document | Path | Role |
|---|---|---|
| Intent | `specs/intent.md` | Vision & scope (the seed, tech-agnostic) |
| Constitution | `specs/constitution.md` | Guardrails + ADRs + agentic ladder |
| BRD | `docs/BRD.md` | Business requirements (the why, non-technical) |
| PRD | `docs/PRD.md` | Product behavior, RFs, NFRs, ACs |
| SDD | `docs/SDD` | Tool-agnostic conceptual design |
| TSD | `docs/TRD.md` | Concrete build playbook (stack, routes, schemas, tests) |

> Convention: the **constitution** holds principles and decisions only; the
> **stack and data live in the TSD**; the **SDD is tool-agnostic**; the **BRD is
> non-technical**. No dual sources of truth.

---

## Getting started

> The Hydrogen scaffold has not been created yet — the v3.0 docs describe the
> target. To start implementation:

```bash
# scaffold (one-time, replaces the legacy Next.js app)
npm create @shopify/hydrogen@latest
pnpm install
pnpm dev
```

Environment variables (see `.env.example`):

- `SHOPIFY_STORE_DOMAIN` — e.g. `nenufar.myshopify.com`
- `SHOPIFY_STOREFRONT_API_PUBLIC_TOKEN` — public, client-safe
- `SHOPIFY_STOREFRONT_API_VERSION` — pin the latest stable
- `TELEGRAM_BOT_TOKEN` — server-only, never shipped to the browser
- `TELEGRAM_CHANNEL_ID` — e.g. `@nenufarpedidos` (bot must be channel admin)

---

## Agentic future (deferred)

The MVP is deterministic (Level 0). The agentic future is documented as a
maturity ladder in `specs/constitution.md` §5:

```
L0 (today)  Deterministic. Cart → Telegram. Shirley does everything.
L1          LLM enriches the order intake (normalize personalization).
L2          Catalog Q&A chat; proposes a cart the buyer confirms.
L3          Agent for Shirley in Telegram. ← re-adds persistence (Draft Orders / DB)
L4          Autonomous close + nurture + photo-to-product.
```

Adding an LLM before this backbone exists is building a roof without walls.

---

## Capabilities

| # | Capability | Status |
|---|---|---|
| 01 | Storefront (Hydrogen, ES/COP) | Specified — not yet scaffolded |
| 02 | Catalog (Shopify headless) | Specified |
| 03 | Blog (Shopify headless) | Specified |
| 04 | Cart + personalization | Specified |
| 05 | Order submission → Telegram | Specified |
| 06 | Agentic layer | Deferred (ladder L1–L4) |

---

## ChangeLog (high level)

- **v3.0** — Shopify headless pivot. Storefront on Hydrogen + Storefront API;
  buyer assembles the order; Telegram is a one-way channel. No Payload, no DB,
  no command bot. Renamed to "Nenúfar". Docs restructured to the
  BRD/PRD/SDD/TSD standard.
- **v2.1** (frozen) — Payload + Next.js + Telegram command center + WhatsApp CTA.
