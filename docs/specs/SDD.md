# SDD — Software Design Document

**Project:** Nénufar — Handcrafted Jewelry Store  
**Version:** 3.3  
**Status:** Canonical & Active  
**Related ADRs:** [ADR-001](../adr/ADR-001-no-payment-gateway-human-closing.md), [ADR-002](../adr/ADR-002-claude-agent-sdk-litellm-groq.md), [ADR-003](../adr/ADR-003-payload-embedded-monolith-local-api.md)

---

## 1. High-Level System Architecture

Nénufar is a **monolithic full-stack application** running Next.js 15 App Router and Payload CMS v3 within the same Node.js runtime process. All persistent data lives in PostgreSQL 16 managed via Drizzle ORM, with zero internal network latency.

AI capabilities are powered by the **Claude Agent SDK** connected through a local **LiteLLM Universal Gateway** (`:4000`) to **Groq Cloud (Llama 3.3 70B)** with automated fallback to **Google Gemini 2.0 Flash** at **$0 per-token cost**.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser / Mobile                       │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTP (App Router)            │ HTTP (/admin)
┌──────────────▼──────────────────────────────▼───────────────┐
│                 Next.js 15 (Node.js :3002)                   │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │  App Router (RSC)       │  │   Payload CMS v3         │  │
│  │  /shop, /products,      │  │   Admin UI + REST API    │  │
│  │  /pedidos/enviar        │  │   /admin, Local API      │  │
│  │  /telegram/webhook      │  │                          │  │
│  └──────────┬──────────────┘  └──────────┬───────────────┘  │
│             │                            │                  │
│             └──────────────┬─────────────┘                  │
│                            │ Payload Local API (getPayload) │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │                 PostgreSQL 16 (Drizzle)               │  │
│  └───────────────────────────────────────────────────────┘  │
│             │                            │                  │
│             │ sendMessage (Orders)       │ Messages API     │
│             ▼                            ▼ (ANTHROPIC_URL)  │
│     Telegram Channel              LiteLLM Gateway (:4000)   │
│     (@pedidos_nenufar)                   │ drop_params: true│
│                                          ▼                  │
│                                    Groq Cloud API           │
│                               (Llama 3.3 70B — Free Tier)   │
└─────────────────────────────────────────────────────────────┘
               ▲
               │ POST /telegram/webhook (Shirley's bot only)
        Telegram Bot API
```

---

## 2. Core Modules

### 2.1 Storefront & Checkout (`src/app/(app)/`)
* **`/shop` & `/`:** Catalog browsing with CSS Masonry columns and `ProductCard` component.
* **`/products/[slug]`:** Product details, variant selector, and add-to-cart drawer.
* **`/pedidos/enviar`:** Clean checkout form capturing customer details, customization notes, and explicit Habeas Data consent (Ley 1581).
* **`submitOrderAction.ts`:** Server Action executing SHA256 idempotency check, saving `Order` in PostgreSQL (`status: 'processing'`), and pushing an HTML summary to Shirley's Telegram channel.

### 2.2 Payload CMS v3 (`src/collections/`, `src/blocks/`)
* **`products`:** Title, slug, variants, price in COP, inventory stock, and Sharp WebP media.
* **`orders`:** Ordered items, total amount (COP), status (`processing`, `completed`, `cancelled`, `refunded`), and shipping address.
* **`media`:** Automatic 4-tier WebP image generation (`thumbnail`, `card`, `feature`, `hero`).
* **`pages`:** Layout builder supporting modular blocks (`Hero`, `Banner`, `Carousel`, `UpcomingEvents`, `Archive`).
* **`events`:** Artisan pop-ups and fairs in Cartagena shown on the landing page.

### 2.3 Management Bot Runtime (`src/lib/agent/`, `POST /telegram/webhook`)
* **Auth Guard:** Validates `X-Telegram-Bot-Api-Secret-Token` and restricts access exclusively to `TELEGRAM_ADMIN_CHAT_ID`.
* **Agent Engine:** `@anthropic-ai/claude-agent-sdk` running with in-process MCP tools.
* **Universal Gateway:** `LiteLLM Proxy` running in Docker on port `:4000` mapping `nenufar-bot` to `groq/llama-3.3-70b-versatile` with secondary fallback to `gemini/gemini-2.0-flash`.
* **Tools:** `buscarProducto`, `destacarProducto`, `actualizarInventario`, `pedidosPendientes`, `confirmarPedido`, `publicarEvento`, `crearProductoDraft`.
