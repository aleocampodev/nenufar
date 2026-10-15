# Nénufar: Systems Design
### Zero-cost artisan commerce, human-closed sales, and resilient agent operations
**Architecture** · `nenufar.co` · **Alejandro Ocampo & Shirley** · *For the operator, engineers, and maintainers*

> Nénufar replaces expensive payment gateways and brittle SaaS subscriptions with an embedded monolith and a Telegram-driven human sales closing flow. Customers browse and build carts on the web; Shirley closes payments, sizing, and shipping directly on WhatsApp. The store operates under a strict $0/mo fixed cost invariant, protected by in-process seams, SHA-256 idempotency, and an autonomous operations agent constrained by a 190k daily token circuit breaker.

---

## 1. Problem and Goals

Artisan jewelry businesses in Cartagena, Colombia face prohibitive payment gateway fees (3–5% + fixed fees on Stripe/Wompi), customer drop-off on automated checkout, and high SaaS recurring costs. Customers require personalized consultation on WhatsApp for custom sizing, hypoallergenic materials, and local delivery. Shirley (the artisan and owner) needs complete operational control directly from Telegram without navigating complex administrative web dashboards on her mobile device.

### Goals
1. **Strict $0/mo Infrastructure Cost (Constitution Art. I):** Zero paid third-party SaaS, zero paid LLM APIs, and zero transaction fee deductions. All compute and storage run on Always-Free tiers (Oracle Cloud VPS / Vercel + PostgreSQL).
2. **Human-Closed Sales Pipeline (ADR-001):** The web storefront captures intent, validates contact info, decrements inventory, and dispatches structured HTML order notifications to Telegram. Shirley closes payments and coordinates logistics via WhatsApp.
3. **100% Colombian Localization & Compliance (Constitution Art. V & VI):**
   - Currency strictly formatted via `Intl.NumberFormat('es-CO')` with `$` and no decimals (e.g., `$ 45.000`). Prohibited: the literal string `COP`.
   - Strict adherence to Colombian Data Privacy Law (Ley 1581 de 2012 habeas data consent).
   - Validated Colombian WhatsApp mobile numbers (`+57 3XX XXX XXXX`).
4. **Resilient Agent Operations on Telegram (ADR-002):** A single-admin agent for Shirley built on `@anthropic-ai/claude-agent-sdk`, routed via LiteLLM to free-tier Groq (Llama-3.3-70b-versatile), protected by burst fusion, circuit breakers, and a 190k daily token park limit.

### Non-Goals
- Automated payment gateway processing (credit card/PSE checkouts are intentionally excluded).
- Customer-facing conversational chat widget on the website (storefront is 100% web UI).
- Microservice decomposition (the system is an embedded monolith running in a single Node process).
- Paid proprietary model APIs (OpenAI / Anthropic paid endpoints are strictly banned).

### Core Invariants & Assumptions
| Assumption | How We Enforce & Test It |
| :--- | :--- |
| **No duplicate orders on double-submit** | SHA-256 idempotency key over cart + contact in a 5-min sliding window ([`idempotency.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/idempotency.int.spec.ts)). |
| **Zero unauthorized access to AI agent** | Webhook rejects any non-admin `chat_id` silently with HTTP 200 ([`agent-runtime.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/agent-runtime.int.spec.ts)). |
| **No selling out-of-stock items** | Atomic inventory checks against Payload Local API before order creation ([`checkout.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/checkout.int.spec.ts)). |
| **Agent never exceeds Groq free tier** | `getDailyTokenUsage` enforces park barrier at 190k tokens; circuit breaker opens after 3 failures. |
| **Calendar sync never leaks private data** | Outbound RFC 5545 feed (`/api/calendar/feed`); inbound personal sync is disabled by default. |

**Hard Cases Handled:**
Concurrent checkout on last inventory unit · Rapid double-tap audio/text from Shirley (fused into 1 turn) · Telegram network retry storms (`update_id` LRU dedupe) · Cartagena UTC-5 timezone offsets in iCal · Temporary Groq API rate limits (`AGENT_FALLBACK` with zero stack traces).

---

## 2. Interface: What the System Must Do

### Web Storefront (Customer Journey)
* `GET /shop`, `/products/[slug]`, `/galeria`, `/eventos`: Modular SSR/ISR pages rendered via Next.js App Router and Payload Local API.
* `POST /pedidos/enviar` (Server Action):
  - Validates Ley 1581 consent, Colombian phone regex, and real-time inventory.
  - Computes SHA-256 idempotency hash.
  - Creates `Order` in Payload with status `processing`.
  - Dispatches formatted HTML notification with direct WhatsApp link to Shirley's Telegram channel.
  - Redirects to `/pedidos/enviar/confirmacion`.

### Shirley Operations Bot (Telegram Webhook)
* `POST /telegram/webhook`:
  - **Auth Guard:** Validates `x-telegram-bot-api-secret-token`. Rejects any sender where `chat_id !== TELEGRAM_ADMIN_CHAT_ID` with silent HTTP 200.
  - **Burst Fusion:** Debounces text messages within 1000ms (up to 3 drains) to fuse multi-message thoughts into a single agent turn.
  - **Human-in-the-Loop Gate:** Destructive actions (`confirmarPedido`, `eliminarFoto`, `eliminarEvento`) require explicit confirmation ("¿Deseas confirmar el pedido de María?").
  - **Graceful Degradation:** Gateway errors trigger a warm Cartagena Spanish message (`AGENT_FALLBACK`) pointing Shirley to `/admin`.

### Outbound Calendar Feed
* `GET /api/calendar/feed`:
  - Emits RFC 5545 `text/calendar` (VCALENDAR) with published events and workshops.
  - Subscribable via Google Calendar (`calendar.google.com → Other calendars → From URL`).

---

## 3. Architecture: Embedded Monolith & Dual-Process Loops

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NÉNUFAR EMBEDDED MONOLITH                          │
│                                                                             │
│   CUSTOMER LOOP (Deterministic · Zero AI)       SHIRLEY LOOP (Agentic)      │
│   ┌─────────────────────────────────────┐       ┌────────────────────────┐  │
│   │ Storefront (Next.js 15 App Router)  │       │ Telegram Webhook       │  │
│   │  - /shop, /products, /galeria       │       │  - Secret token check  │  │
│   │  - /pedidos/enviar (Server Action)  │       │  - Admin chat_id guard │  │
│   │  - SHA-256 Idempotency Engine       │       │  - Burst Fusion Queue  │  │
│   └──────────────────┬──────────────────┘       └───────────┬────────────┘  │
│                      │                                      │               │
│                      ▼                                      ▼               │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                 PAYLOAD CMS v3 CORE (In-Process API)                 │  │
│   │   Products · Orders · Events · Gallery · Agent Traces & Messages     │  │
│   └──────────────────┬──────────────────────────────────────┬────────────┘  │
│                      │                                      │               │
└──────────────────────┼──────────────────────────────────────┼───────────────┘
                       ▼                                      ▼
               PostgreSQL 16 (DB)            LiteLLM Gateway (:4000)
             [Docker / Oracle Cloud]                          │
                                                              ▼
                                                    Groq Free API (Llama 3.3)
```

### Architectural Decisions (ADR Summary)
| Decision | Chosen Solution | Rejected Alternative & Rationale |
| :--- | :--- | :--- |
| **Payment Flow** | Human WhatsApp closing ([ADR-001](file:///home/ale/Work/nenufar/docs/adr/ADR-001-no-payment-gateway-human-closing.md)) | **Stripe / Wompi / MercadoPago:** Fixed fees erode artisan margins; automated checkout causes cart drop-off in Colombia. |
| **App Topology** | Embedded Monolith ([ADR-003](file:///home/ale/Work/nenufar/docs/adr/ADR-003-payload-embedded-monolith-local-api.md)) | **Microservices:** Adds deployment complexity, network serialization, and latency without scaling need. |
| **Agent Engine** | Claude Agent SDK via LiteLLM ([ADR-002](file:///home/ale/Work/nenufar/docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md)) | **Hand-rolled Groq orchestrator:** Brittle parsing and tool calling. **Paid Anthropic API:** Violates $0/mo invariant. |
| **Calendar Sync** | Outbound iCal Feed (`/api/calendar/feed`) | **Inbound Google Calendar sync:** Leaked Shirley's personal calendar events onto the public storefront. |
| **Database** | PostgreSQL 16 on VPS / Supabase | **SQLite / DynamoDB:** Lacks rich JSON querying, full ACID compliance, and relational schema integrity for Payload. |
| **Deployment** | Oracle Cloud VPS (Always Free) / Vercel | **AWS / GCP Paid Compute:** Unnecessary monthly operational expense. |

---

## 4. How We Measure: Evals, Budgets and Guardrails

### Automated Quality Gates & Integration Test Suites
1. **Checkout & Idempotency ([`checkout.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/checkout.int.spec.ts)):**
   - Verifies duplicate submission rejection within 5 minutes.
   - Asserts out-of-stock items block order generation.
   - Validates Colombian WhatsApp phone regex and Ley 1581 consent requirement.
2. **Agent Tool Registry Parity ([`agent-tools.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/agent-tools.int.spec.ts)):**
   - Asserts 100% schema alignment between `SHIRLEY_TOOL_DEFINITIONS` and in-process MCP tools.
   - Tests Human-in-the-Loop gating on destructive mutations.
3. **Agent Runtime & Admin Security ([`agent-runtime.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/agent-runtime.int.spec.ts)):**
   - Verifies non-admin Telegram messages are ignored without API invocation.
   - Simulates gateway downtime to assert `AGENT_FALLBACK` returns within 45s without unhandled rejections.
4. **Landing & Currency Compliance ([`landing-blocks.int.spec.ts`](file:///home/ale/Work/nenufar/tests/int/landing-blocks.int.spec.ts)):**
   - Verifies all rendered prices follow `$ 45.000` format. Zero instances of `COP`.

### Token Metering & Circuit Breaker Budget
* **Daily Quota Ceiling:** `DAILY_WARN_TOKENS = 150_000`, `DAILY_PARK_TOKENS = 190_000` (Groq free tier cap: 200,000 TPD).
* **Automated Park Mechanism:** When token sum reaches 190k, the agent records an audit trace, sends one notification to the operations Telegram channel, and rejects further agent turns with a warm Spanish notice.
* **Circuit Breaker:** Opens for 5 minutes (`CIRCUIT_BREAKER_MS = 300_000`) if 3 consecutive gateway errors occur.
* **Input Truncation:** Input capped at 1,000 characters; conversational memory capped at 4 messages (2,000 characters maximum).

### Failure Modes & Mitigations
* **Telegram Service Outage:** Order is persisted in PostgreSQL; customer receives successful confirmation screen; order marked with `warn=1` in logs.
* **Groq API Downtime:** Shirley receives fallback message with direct link to `/admin` dashboard.
* **Database Re-seed:** Idempotent seed script (`src/endpoints/seed/index.ts`) populates artisan catalog and categories cleanly without schema drift.
