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
| **App Runtime** | `pnpm dev` (Port 3002) | Vercel Serverless Functions (`next build`) |
| **Database** | Docker PostgreSQL (`127.0.0.1:5433`) | **Supabase Free Tier (PostgreSQL)** |
| **Media Storage** | Local filesystem (`public/media/`) | Supabase Storage (`src/lib/supabaseStorage.ts`) |
| **LLM Gateway** | Docker LiteLLM (`localhost:4000`) | Render free Docker service (`Dockerfile.litellm` + `render.yaml`) |
| **Bot Webhook** | cloudflared tunnel | `https://<your-domain>/telegram/webhook` |

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

# Media Storage (Supabase Storage — same bucket as local dev)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SECRET_KEY=[service-role-key]
SUPABASE_STORAGE_BUCKET=media

# Telegram Admin Bot (Shirley's Operations)
TELEGRAM_BOT_TOKEN=[token-from-BotFather]
TELEGRAM_CHANNEL_ID=[channel-id-or-@username]
TELEGRAM_ADMIN_CHAT_ID=6327668964
TELEGRAM_WEBHOOK_SECRET=your-secure-webhook-secret

# LLM Gateway (Claude Agent SDK via LiteLLM -> Groq Free)
# LiteLLM runs on Render (see Step 5); the app never calls Groq directly.
GROQ_API_KEY=[only-consumed-by-LiteLLM-on-Render]
LITELLM_MASTER_KEY=[not-needed-on-Vercel]
ANTHROPIC_BASE_URL=https://nenufar-litellm.onrender.com
ANTHROPIC_AUTH_TOKEN=[same-value-as-Render-LITELLM_MASTER_KEY]
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

## 5. Step 4: Deploy the LiteLLM gateway on Render

Vercel serverless cannot run Docker, so the bot's model gateway
(`Dockerfile.litellm` + `render.yaml`) deploys separately on Render's free tier:

1. Push `main` (after merging the PR), then in Render: **New → Blueprint** → select the repo.
2. Set `GROQ_API_KEY` (free key from https://console.groq.com) and
   `LITELLM_MASTER_KEY` (generate with `openssl rand -hex 24`).
3. Copy the service URL into Vercel as `ANTHROPIC_BASE_URL`, and the same
   master key as `ANTHROPIC_AUTH_TOKEN`.
4. Note: free services sleep when idle; the first daily bot reply can take
   ~50s (agent timeout is 120s, plus typing indicator).

---

## 6. Step 5: Create the prod admin user

```bash
DATABASE_URL="<supabase-pooler-url>" PAYLOAD_SECRET="<prod-secret>" \
  ADMIN_EMAIL="shirley@nenufar.co" ADMIN_NAME="Shirley" \
  pnpm tsx scripts/create-prod-admin.ts
```

Without `ADMIN_PASSWORD` a random one is printed once — store it immediately.

---

## 7. Step 6: Register Telegram Webhook

Once the site is live on your production domain, point Shirley's Telegram Bot webhook to the production route:

```bash
pnpm tsx scripts/set-telegram-webhook.ts https://your-production-domain.com
```

Telegram will confirm with: `Webhook was set successfully`.

---

## 8. Verification Checklist (Definition of Done)

- [ ] `/admin` is accessible, login works, and displays the color Nénufar logo.
- [ ] `/` (Home) renders modular Krafti Artisan landing page.
- [ ] `/shop` renders dynamic Masonry catalog with `$ 45.000` prices (never `COP` text).
- [ ] Submitting an order creates an order record and notifies Shirley via Telegram.
- [ ] Sending a management prompt to Shirley's bot executes tool calls against Supabase DB.

> Build notes: production build is `next build` (`payload build` no longer
> exists in Payload v3). `next.config.ts` sets `typescript.ignoreBuildErrors`
> per Constitution Art VI.5 (pre-existing plugin-type mismatches only).
