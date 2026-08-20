# TSD — Technical Specification Document
**Project:** Nénufar — Handcrafted Jewelry Store
**Version:** 1.0
**Date:** August 2026
**Audience:** Developers, QA, DevOps

---

## 1. Tech Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Runtime | Node.js | 20 LTS | LTS stability; required by Payload v3 |
| Framework | Next.js | 15 | App Router, RSC, Server Actions |
| CMS | Payload CMS | 3.x | Self-hosted, no SaaS fees, Lexical editor |
| ORM | Drizzle (via Payload) | — | Type-safe SQL; managed by Payload |
| Database | PostgreSQL | 16 | Relational; Payload's recommended adapter |
| UI Library | shadcn/ui | — | Accessible Radix primitives + Tailwind |
| Styling | TailwindCSS | v4 | CSS-first config, OKLCH tokens |
| Package manager | pnpm | 9 | Workspace-friendly, fast installs |
| Image processing | Sharp | — | WebP conversion on upload, server-side |
| Notifications | Telegram Bot API | — | HTTP POST — order notifications (one-way) + buyer assistant webhook (two-way) |
| AI agents | Groq SDK (`groq-sdk`) | — | Llama 3.3 70B, free tier, tool-calling — orchestrator + 2 agents |
| Testing (unit/int) | Vitest | — | Fast, ESM-native |
| Testing (E2E) | Playwright | — | Cross-browser, headless |
| Linting | ESLint + Prettier | — | Enforced on commit via Husky |
| Local DB | Docker Compose | — | PostgreSQL on port 5433 |

### Typography

| Font | Variable | Usage |
|------|----------|-------|
| Playfair Display | `--font-playfair` | Headings, brand name — serif elegance |
| Inter | `--font-inter` | Body text, UI elements |
| Geist Mono | `--font-geist-mono` | Code blocks |

### Brand Colors (CSS tokens)

```css
--brand:          oklch(38% 0.2 307deg)   /* Violet Nénufar — #6A1B9A */
--brand-dark:     oklch(28% 0.18 307deg)  /* Hover state — #4A148C */
--brand-foreground: oklch(99% 0 0deg)     /* White text on brand bg */
```

Tailwind classes: `bg-brand`, `text-brand`, `hover:bg-brand-dark`, `text-brand-foreground`

---

## 2. Repository Structure

```
nenufar/
├── src/
│   ├── access/           # Payload access control functions
│   ├── app/
│   │   ├── (app)/        # Public Next.js frontend
│   │   └── (payload)/    # Payload admin + API routes
│   ├── blocks/           # CMS page builder blocks
│   ├── collections/      # Payload collection definitions
│   ├── components/       # Shared React components
│   ├── endpoints/seed/   # Dev seed data + placeholder images
│   ├── fields/           # Reusable Payload field configs
│   ├── globals/          # Header + Footer globals
│   ├── heros/            # Hero block variants
│   ├── hooks/            # Payload lifecycle hooks
│   ├── lib/              # Business logic (telegram, order-formatter, idempotency, groq, agents/)
│   ├── migrations/       # Drizzle migration files
│   ├── plugins/          # Payload plugin config
│   ├── providers/        # React context providers
│   └── utilities/        # Pure utility functions
├── tests/
│   ├── e2e/              # Playwright E2E tests
│   ├── int/              # Vitest integration tests
│   └── helpers/          # Test utilities
├── docs/                 # BRD, PRD, SDD, TSD, architecture diagrams
├── .github/              # PR template, issue templates
├── docker-compose.yml    # Local PostgreSQL
├── payload.config.ts     # Payload CMS configuration
├── next.config.ts        # Next.js configuration
└── tailwind.config.mjs   # Tailwind + brand tokens
```

---

## 3. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAYLOAD_SECRET` | ✅ | JWT signing secret — min 32 chars random string |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_SERVER_URL` | ✅ | Public base URL (used for og images, redirects) |
| `TELEGRAM_BOT_TOKEN` | ✅ | Bot token from @BotFather — used for both order notifications and the buyer assistant |
| `TELEGRAM_CHANNEL_ID` | ✅ | Target chat ID for order notifications (Shirley's channel) |
| `GROQ_API_KEY` | ✅ (v3.2) | Groq API key — free at console.groq.com. Powers the orchestrator + agents. |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ (v3.2) | Random string validating the webhook header `X-Telegram-Bot-Api-Secret-Token`. Generate: `openssl rand -hex 24` |
| `GROQ_MODEL` | ⬜ | Overrides the default Groq model (`llama-3.3-70b-versatile`). Groq model IDs rotate; check console.groq.com for current names. |
| `PREVIEW_SECRET` | ⬜ | Enables draft preview mode |
| `CRON_SECRET` | ⬜ | Secures cron job endpoints |

Local dev: copy `.env.example` → `.env`. Never commit `.env`.

---

## 4. Data Models

### Order (stored in Payload)

```typescript
{
  id: number
  createdAt: string           // ISO 8601
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    product: number           // Product ID
    variant?: string          // e.g. "Talla 7 / Plata"
    quantity: number
    price: number             // COP, integer, no decimals
    note?: string             // per-item personalization
  }>
  total: number               // COP, sum of items
  note?: string               // general order note
  consentGiven: boolean       // Ley 1581 consent
  shippingAddress: {
    firstName: string         // buyerName (temporary — see SDD note)
    phone: string             // buyerContact (WhatsApp or email)
  }
  orderedBy?: number          // User ID if logged in, null for guests
}
```

### Product Variant shape (stored as JSON in product)

```typescript
{
  label: string               // e.g. "Talla"
  options: string[]           // e.g. ["5", "6", "7", "8"]
}
```

### Telegram message format

HTML sent to Telegram via `order-formatter.ts`:

```
🌸 <b>Nuevo Pedido #1042</b>

👤 <b>Comprador:</b> María García
📱 <b>Contacto:</b> +57 300 123 4567

🛒 <b>Items:</b>
  • Anillo Esmeralda × 1 — $485.000 COP
    ↳ Talla 7 / Plata
    ↳ Nota: Con grabado "MG"
  • Aretes Coral × 2 — $290.000 COP

💰 <b>Total:</b> $775.000 COP

📝 <b>Nota:</b> Para regalo, incluir tarjeta

🔗 <a href="/admin/collections/orders/1042">Ver en admin</a>
```

---

## 5. API Specification

### Server Action: `submitOrderAction`

**File:** `src/app/(app)/pedidos/enviar/submitOrderAction.ts`

**Input (FormData):**
```typescript
{
  buyerName: string       // required, min 2 chars
  buyerContact: string    // required — WhatsApp number or email
  note?: string           // optional general note
  consentGiven: 'true'    // required — Ley 1581
  cartHash: string        // sha256 of cart contents (idempotency key)
}
```

**Success:** redirects to `/pedidos/enviar/confirmacion?orderId={id}`

**Error states:**
- `EMPTY_CART` — cart has no items
- `DUPLICATE_ORDER` — same cartHash seen within 5 min
- `TELEGRAM_FAILED` — order saved but notification failed (logged, not shown to user)
- Validation errors — returned as field-level errors to the form

### Telegram client: `src/lib/telegram.ts`

```typescript
// Send to Shirley's channel (order notifications)
sendTelegramMessage(args: SendTelegramMessageArgs): Promise<SendTelegramMessageResult>

// Reply to a buyer's chat (bot assistant — v3.2)
sendTelegramReply(args: SendTelegramReplyArgs): Promise<SendTelegramMessageResult>

// Both return { ok, messageId?, error? } — never throw
```

---

## 6. Image Sizes Configuration

Defined in `src/collections/Media.ts`:

```typescript
imageSizes: [
  { name: 'thumbnail', width: 400,  height: 500,  format: 'webp', formatOptions: { quality: 92 } },
  { name: 'card',      width: 800,  height: 1000, format: 'webp', formatOptions: { quality: 92 } },
  { name: 'hero',      width: 1920, height: 1080, format: 'webp', formatOptions: { quality: 92 } },
  { name: 'og',        width: 1200, height: 630,  format: 'webp', formatOptions: { quality: 92 } },
]
```

Usage in components: `<Media sizeName="card" resource={image} />`

---

## 7. Testing Strategy

### Integration tests (`tests/int/`)

Tool: **Vitest** + Payload test utilities  
Config: `vitest.config.mts`, env: `.env.test`

| Test | What it verifies |
|------|-----------------|
| `api.int.spec.ts` | Payload REST endpoints return correct status and shape |
| `agents.int.spec.ts` | Orchestrator routes correctly; agents call the right skills; Groq and Telegram are mocked at the boundary |

Run: `pnpm test:int`

### E2E tests (`tests/e2e/`)

Tool: **Playwright**  
Config: `playwright.config.ts`

| Test | What it verifies |
|------|-----------------|
| `frontend.e2e.spec.ts` | Homepage loads, shop renders products |
| `admin.e2e.spec.ts` | Admin panel is accessible and shows dashboard |

Run: `pnpm test:e2e`

### What is NOT tested (intentionally)

- Telegram delivery (external service, mocked at boundary)
- WebP generation (Sharp is tested by its own library)
- Payment flows (there are none)

---

## 8. Performance & Security Standards

| Standard | Requirement |
|----------|-------------|
| Core Web Vitals | LCP < 2.5s on product pages (hero image must use `sizeName="hero"`) |
| Image format | Always serve WebP variant — never raw JPEG from camera (up to 15MB) |
| Bundle size | No client-side JS for pages that don't need it — prefer RSC |
| Secrets | Never in client bundle — all env vars without `NEXT_PUBLIC_` prefix are server-only |
| SQL | All queries via Drizzle ORM — no raw SQL string interpolation |
| Auth | Payload sessions — HttpOnly cookies, `PAYLOAD_SECRET` rotatable |
| Consent | `consentGiven` field validated server-side in `submitOrderAction` — not just client-side |
| Currency | Always `number` (integer COP) in DB — never `float`, never `string` |

---

## 9. Deployment Plan

### Current (development)

```bash
docker-compose up -d   # PostgreSQL on :5433
pnpm dev               # Next.js + Payload on :3002
```

### Production (target — self-hosted VPS)

```bash
# 1. Set production env vars
# 2. Run migrations
pnpm payload migrate

# 3. Build
pnpm build

# 4. Start
pnpm start             # or PM2 / systemd

# 5. Reverse proxy: Nginx → localhost:3002
# 6. SSL: Let's Encrypt (certbot)
```

**Server requirements (minimum):**
- 1 vCPU, 2GB RAM, 20GB SSD
- Node.js 20, PostgreSQL 16, Nginx

**Known limitations before production:**
- Idempotency Map is in-memory — restarting the server clears it. Acceptable for single-instance; replace with PostgreSQL-backed dedup for multi-instance.
- No analytics yet — add Umami or Plausible (self-hosted, privacy-first).
- Telegram messages > 4000 chars are not split — not an issue for current order volume.
- Media files stored in `/public/media/` — for VPS this is fine; for serverless (Vercel) switch to S3-compatible storage.
