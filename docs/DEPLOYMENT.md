# Production Deployment Guide — Nénufar

> **Architecture:** Embedded Monolith (Payload CMS v3 + Next.js App Router + PostgreSQL + LiteLLM/Groq)  
> **Target Cloud Host:** Vercel (Frontend & Backend API)  
> **Database:** Supabase Free Tier (PostgreSQL 15+)  
> **Cost Policy:** Strict $0/mo fixed infrastructure per Constitution Article I.  

---

## 1. Overview & Architecture

Nénufar operates in two environments:

| Feature | Local Development | Cloud Production |
| :--- | :--- | :--- |
| **App Runtime** | `pnpm dev` (Port 3002) | Vercel Serverless Functions |
| **Database** | Docker PostgreSQL (`127.0.0.1:5433`) | **Supabase Free Tier (PostgreSQL)** |
| **Media Storage** | Local filesystem (`public/media/`) | Vercel Blob Storage |
| **LLM Gateway** | Docker LiteLLM (`localhost:4000`) | LiteLLM container / Groq API proxy |
| **Bot Webhook** | Polling or ngrok tunnel | `https://<your-domain>/telegram/webhook` |

---

## 2. Step 1: Create Supabase PostgreSQL Database

1. Log in to [Supabase](https://supabase.com) (Free Tier).
2. Create a new project named `nenufar`.
3. Choose a strong database password and select region `us-east-1` (North Virginia) or `sa-east-1` (São Paulo) for optimal latency with Colombia.
4. Navigate to **Project Settings → Database → Connection String**:
   * Select **Transaction Pooler** (Port `6543`) — recommended for Vercel Serverless.
   * Your URL format:
     ```
     postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
     ```

---

## 3. Step 2: Configure Environment Variables

Set these environment variables in your deployment platform (Vercel / Production `.env`):

```env
# Payload & Next.js Core
PAYLOAD_SECRET=your-random-32-char-secret
NEXT_PUBLIC_SERVER_URL=https://nenufar.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require

# Media Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# Telegram Admin Bot (Shirley's Operations)
TELEGRAM_BOT_TOKEN=8910920707:AAEY3AEYn5eKw1Y2vpwXYLx0nA_vcTpZfmc
TELEGRAM_CHANNEL_ID=-100xxxxxxxxxx
TELEGRAM_ADMIN_CHAT_ID=6327668964
TELEGRAM_WEBHOOK_SECRET=your-secure-webhook-secret

# LLM Gateway (Claude Agent SDK via LiteLLM -> Groq Free)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
LITELLM_MASTER_KEY=sk-nenufar-local-gateway-key-2026
ANTHROPIC_BASE_URL=http://localhost:4000
ANTHROPIC_AUTH_TOKEN=sk-nenufar-local-gateway-key-2026
ANTHROPIC_MODEL=nenufar-bot
```

---

## 4. Step 3: Run Database Migrations

Once your `DATABASE_URL` is pointing to Supabase, run migrations to generate the database schema:

```bash
pnpm payload migrate
```

Or seed the initial artisan catalog and categories:

```bash
pnpm tsx src/endpoints/seed/index.ts
```

---

## 5. Step 4: Register Telegram Webhook

Once the site is live on your production domain, point Shirley's Telegram Bot webhook to the production route:

```bash
pnpm tsx scripts/set-telegram-webhook.ts https://your-production-domain.com
```

Telegram will confirm with: `Webhook was set successfully`.

---

## 6. Verification Checklist (Definition of Done)

- [ ] `/admin` is accessible, login works, and displays custom Nénufar Lotus logo.
- [ ] `/` (Home) renders modular Krafti Artisan landing page.
- [ ] `/shop` renders dynamic Masonry catalog with `$ 45.000` COP prices.
- [ ] Submitting an order creates an order record and notifies Shirley via Telegram.
- [ ] Sending a management prompt to Shirley's bot executes tool calls against Supabase DB.
