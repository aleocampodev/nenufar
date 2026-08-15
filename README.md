# 🌸 Nénufar — Handcrafted Jewelry from Colombia

<div align="center">

*Every piece tells a story. Handmade in Cartagena.*

[![Status](https://img.shields.io/badge/status-in%20development-yellow?style=flat-square)](https://github.com/aleocampodev/nenufar)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload-v3-7C3AED?style=flat-square)](https://payloadcms.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)

</div>

---

## What is Nénufar?

Nénufar is the online store for Shirley, an artisan jeweler based in Cartagena, Colombia. The platform lets her showcase her catalog of handmade pieces — rings, earrings, necklaces — and receive orders directly on Telegram, without payment gateways, without commissions, without middlemen.

**The flow is intentionally simple:** buyers browse the catalog, pick their pieces, add personalization notes (engraving, size, special instructions), and fill in their contact details. Shirley receives a structured order summary on Telegram and closes the sale over WhatsApp — exactly the way she's always worked. The platform doesn't replace her workflow; it amplifies it.

## How an Order Works

```
Catalog → Product → Cart → Order Form → Shirley's Telegram → WhatsApp
```

| Step | Who | What happens |
|------|-----|--------------|
| 1 | Buyer | Browses catalog, selects variants (material, size) |
| 2 | Buyer | Adds personalization notes to the cart |
| 3 | Buyer | Fills in name + WhatsApp/email, accepts data policy (Law 1581) |
| 4 | System | Saves the order in Payload + sends a formatted message to Telegram |
| 5 | Shirley | Receives the order, confirms price, and coordinates shipping via WhatsApp |

No gateway. No complex checkout. No friction.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org) App Router + TypeScript |
| CMS & API | [Payload CMS v3](https://payloadcms.com) |
| Database | PostgreSQL 16 |
| UI | TailwindCSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Typography | Playfair Display · Inter · Geist Mono |
| Images | Sharp — automatic WebP at quality 92, original preserved |
| Notifications | Telegram Bot API (one-way order delivery to Shirley) |
| E-commerce | `@payloadcms/plugin-ecommerce` (adapted — no Stripe) |

## Local Setup

### Requirements

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/aleocampodev/nenufar.git
cd nenufar

# 2. Set up environment variables
cp .env.example .env
# Fill in your values (see table below)

# 3. Start the database
docker-compose up -d

# 4. Install dependencies
pnpm install

# 5. Start the dev server
pnpm dev
```

**Frontend** → http://localhost:3002  
**Admin** → http://localhost:3002/admin

> In the admin, go to Dashboard → **"Seed database"** to load sample products and pages.

### Environment Variables

```env
# Payload
PAYLOAD_SECRET=long-random-string-min-32-chars
DATABASE_URL=postgres://postgres:postgres@localhost:5433/nenufar

# Public URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3002

# Telegram (orders are delivered here)
TELEGRAM_BOT_TOKEN=       # Create with @BotFather on Telegram
TELEGRAM_CHANNEL_ID=      # Shirley's chat ID

# Draft preview
PREVIEW_SECRET=another-random-string
```

## Commands

```bash
pnpm dev                  # Dev server → localhost:3002
pnpm build                # Production build
pnpm start                # Production server
pnpm payload migrate      # Run DB migrations (production)
pnpm generate:types       # Regenerate Payload types
```

## Site Routes

| Route | Description |
|-------|-------------|
| `/` | Home with hero and CMS page builder blocks |
| `/shop` | Product catalog with search and filters |
| `/products/[slug]` | Product detail with variants |
| `/blog` | Shirley's blog |
| `/blog/[slug]` | Article with Lexical rich text and photos |
| `/eventos` | Upcoming fairs and events |
| `/pedidos/enviar` | Order confirmation form |
| `/pedidos/enviar/confirmacion` | Post-order success screen |
| `/sobre-nenufar` | Brand story |
| `/contacto` | Contact information |
| `/privacidad` | Privacy policy (Colombian Law 1581/2012) |
| `/terminos` | Terms and conditions |
| `/(account)/` | User account, orders, addresses |
| `/admin` | Payload CMS admin panel |

## Image Pipeline

When a photo is uploaded to the admin, Payload automatically generates WebP variants (quality 92) **without modifying the original**:

| Variant | Dimensions | Usage |
|---------|------------|-------|
| `thumbnail` | 400 × 500 | Cart, thumbnails |
| `card` | 800 × 1000 | Product grid |
| `hero` | 1920 × 1080 | Page backgrounds |
| `og` | 1200 × 630 | Social media / SEO |

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Public frontend (Next.js App Router)
│   │   ├── shop/           # Product catalog
│   │   ├── products/       # Product detail
│   │   ├── blog/           # Blog
│   │   ├── eventos/        # Events and fairs
│   │   ├── pedidos/        # Order flow → Telegram
│   │   └── (account)/      # User account
│   └── (payload)/          # Payload admin
├── collections/
│   ├── Events.ts           # Events and fairs
│   ├── Media.ts            # Media with automatic WebP
│   ├── Posts.ts            # Blog posts
│   └── Products/           # Jewelry catalog
├── blocks/
│   └── UpcomingEvents/     # Upcoming events block (home page)
└── lib/
    ├── telegram.ts         # Telegram order delivery
    ├── order-formatter.ts  # HTML message formatter
    └── idempotency.ts      # Order deduplication
```

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/BRD.md`](docs/BRD.md) | Business requirements — goals, KPIs, scope |
| [`docs/PRD.md`](docs/PRD.md) | Product requirements — user stories, acceptance criteria |
| [`docs/SDD.md`](docs/SDD.md) | Software design — architecture, modules, data flow |
| [`docs/TSD.md`](docs/TSD.md) | Technical spec — stack, data models, API, deployment |
| [`CLAUDE.md`](CLAUDE.md) | Technical context for AI-assisted development |

## Design Decisions

**No payment gateway** — intentional. Payments are handled manually by WhatsApp, as Shirley has always done. Adding Stripe would introduce friction and fees that don't make sense for her current volume.

**Telegram as notification only** — not an interactive bot. The system sends a structured order summary; Shirley replies on WhatsApp where her customers already are.

**COP without decimals** — `Intl.NumberFormat('es-CO', { currency: 'COP' })`. Colombian pesos don't use cents.

**WebP on upload** — Sharp converts images on the server when uploaded. The original is never touched; the right variant is served depending on context.

**Single-instance idempotency** — order deduplication uses an in-memory Map. For multi-instance deployments (e.g., Vercel), replace with Vercel KV.

---

<div align="center">

Private — © 2026 Nénufar · Built with care for Shirley 🌸

</div>
