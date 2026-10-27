# Production Deployment Guide — Nenúfar

> **Architecture:** Embedded Monolith (Payload CMS v3 + Next.js App Router + PostgreSQL + LiteLLM/Groq)  
> **Storefront & API Host:** Vercel (Next.js Serverless & Edge Cache)  
> **Database & Backend Services:** Oracle Cloud Always Free VPS (PostgreSQL 16 + LiteLLM :4000) or Supabase Free  
> **Cost Policy:** Strict $0/mo fixed infrastructure per Constitution Article I.  

---

## 1. Overview & Cloud Topology

Nenúfar operates with zero monthly cloud expenses:

| Component | Technology | Hosting Platform | Cost |
| :--- | :--- | :--- | :--- |
| **Storefront & Admin** | Next.js 15 (App Router) + Payload v3 | **Vercel** (Automatic SSL, Global CDN) | **$0/mo** |
| **Database** | PostgreSQL 16 | **Oracle Cloud VPS** (or Supabase Free) | **$0/mo** |
| **AI Operations Bot** | Claude Agent SDK → LiteLLM (:4000) | **Oracle Cloud VPS** → Groq (Llama-3.3 70B) | **$0/mo** |
| **Media Storage** | Payload Media Collection / Local Disk | **Oracle Cloud Block Storage** (47 GB) | **$0/mo** |
| **Google Calendar** | RFC 5545 iCal Feed (`/api/calendar/feed`) | **Vercel Edge Cache** (Revalidate: 300s) | **$0/mo** |

---

## 2. Step 1: Deploy Storefront to Vercel

Since the code is already hosted in GitHub (`aleocampodev/nenufar`), deploying to Vercel takes 3 minutes:

1. Log in to [vercel.com](https://vercel.com) using your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Locate the repository **`aleocampodev/nenufar`** and click **"Import"**.
4. In the project configuration screen:
   * **Framework Preset:** `Next.js` (detected automatically).
   * **Root Directory:** `./`
   * **Build Command:** `pnpm build` (or leave default).
   * **Install Command:** `pnpm install` (or leave default).
5. Open the **"Environment Variables"** section and configure the production variables below.

---

## 3. Step 2: Configure Environment Variables in Vercel

Add these key-value pairs in the Vercel dashboard:

```env
# ─── Payload & Next.js Core ───
PAYLOAD_SECRET=your-random-32-character-secret-key
NEXT_PUBLIC_SERVER_URL=https://your-project.vercel.app

# ─── Database Connection ───
# Pointing to PostgreSQL running on your Oracle Cloud VPS (port 5432):
DATABASE_URL=postgresql://nenufar:your-db-password@<ORACLE_VPS_PUBLIC_IP>:5432/nenufar?sslmode=disable
# (Or if using Supabase Transaction Pooler):
# DATABASE_URL=postgresql://postgres.[project]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require

# ─── Telegram Bot (Shirley Operations & Order Alerts) ───
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHANNEL_ID=-100xxxxxxxxxx
TELEGRAM_ADMIN_CHAT_ID=6327668964
TELEGRAM_WEBHOOK_SECRET=your-secure-random-webhook-secret

# ─── AI Gateway (LiteLLM running on Oracle VPS) ───
ANTHROPIC_BASE_URL=http://<ORACLE_VPS_PUBLIC_IP>:4000
ANTHROPIC_AUTH_TOKEN=sk-nenufar-local-gateway-key-2026
ANTHROPIC_MODEL=nenufar-bot
```

6. Click **"Deploy"**. Vercel will build the Next.js bundle and publish your production domain (`https://tu-tienda.vercel.app`).

---

## 4. Step 3: Database Migration & Initial Seed

Once Vercel is connected to your database on Oracle:

Run the migrations to generate the database schema and seed the initial Krafti Artisan catalog:

```bash
# From local terminal pointed to production database URL:
DATABASE_URL="<PRODUCTION_DATABASE_URL>" pnpm payload migrate

# Seed artisan catalog, categories, and Cartagena events:
DATABASE_URL="<PRODUCTION_DATABASE_URL>" pnpm tsx src/endpoints/seed/index.ts
```

---

## 5. Step 4: Register Telegram Webhook

Point Shirley's Telegram Bot webhook to the public Vercel production route:

```bash
pnpm tsx scripts/set-telegram-webhook.ts https://your-project.vercel.app
```

Telegram will confirm with:
`{"ok":true,"result":true,"description":"Webhook was set"}`.

---

## 6. Step 5: Connect Google Calendar for Shirley

Follow the full operator guide in [`docs/GUIA-GOOGLE-CALENDAR-SHIRLEY.md`](GUIA-GOOGLE-CALENDAR-SHIRLEY.md):
1. In Shirley's browser, go to `calendar.google.com`.
2. Navigate to **Other calendars** > **+** > **From URL**.
3. Paste: `https://your-project.vercel.app/api/calendar/feed`.
4. Click **Add calendar**. Shirley's smartphone will now reflect all published workshops and fairs.

---

## 7. Verification Checklist (Definition of Done)

- [ ] `/` (Home) renders the modular Krafti Artisan landing page.
- [ ] `/shop` renders catalog with prices formatted as `$ 45.000` (zero occurrences of `COP`).
- [ ] `/admin` is accessible; Shirley can log in and manage products.
- [ ] Submitting an order creates an `Order` record and dispatches an HTML alert to Telegram.
- [ ] Shirley can text or send voice messages to her Telegram bot to query stock and orders.
- [ ] Google Calendar feed loads successfully at `/api/calendar/feed`.
