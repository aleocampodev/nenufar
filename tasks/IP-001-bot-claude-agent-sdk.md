# IP-001: Shirley Bot Migration to Claude Agent SDK + LiteLLM (Groq)

> **Autonomous Agent Implementation Document**  
> **Date:** 2026-08-22  
> **Status:** Ready for execution  
> **Branches and Worktrees:**  
> - **Branch:** `feature/bot/claude-agent-sdk-migration`  
> - **Suggested worktree:** `/home/ale/Work/nenufar-bot-sdk`  
> **Related specifications:**  
> - [`docs/specs/SPEC-002-management-bot-runtime.md`](file:///home/ale/Work/nenufar/docs/specs/SPEC-002-management-bot-runtime.md)  
> - [`docs/HANDOFF-agent-sdk-migration.md`](file:///home/ale/Work/nenufar/docs/HANDOFF-agent-sdk-migration.md)  
> - [`docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md`](file:///home/ale/Work/nenufar/docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md)  

---

## 1. Executive Summary and Objective

Replace the hand-rolled runtime and orchestrator (`src/lib/groq.ts`, `src/lib/agents/orchestrator.ts`, `src/lib/agents/runtime.ts`) with the official agentic loop of **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`), communicating through a local **LiteLLM** proxy to **Groq** (`llama-3.3-70b-versatile`).

### Hard Constraints:
1. **Fixed $0 USD/month (#253):** Do not use paid Anthropic keys. All inference goes through LiteLLM → Groq (free tier).
2. **No direct push or merge to `main`:** Work exclusively on the feature branch inside a git worktree.
3. **Dev server on port 3002 (NOT 3000).**
4. **Respect pre-existing TS errors:** `slug` in Payload generated types and `paymentMethod` in seed are pre-existing ecommerce plugin issues. Do not attempt to refactor them.
5. **Bot security:** The bot is **exclusive to Shirley**. Strictly keep the `chat_id === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)` check.
6. **Do not break order notifications:** `TELEGRAM_BOT_TOKEN` sends web orders to the channel and also serves Shirley's webhook. Do not touch the store order-sending logic.

---

## 2. Work Environment Setup (Prerequisite)

The executing agent MUST run the following commands before modifying code:

```bash
# 1. Create branch and isolated worktree
git worktree add ../nenufar-bot-sdk -b feature/bot/claude-agent-sdk-migration

# 2. Move to worktree
cd ../nenufar-bot-sdk

# 3. Copy base env vars if missing in worktree
cp /home/ale/Work/nenufar/.env .env 2>/dev/null || true
```

---

## 3. Detailed Task Breakdown (Vertical Slices)

### 🔹 Phase 1: LiteLLM Infrastructure and Gateway

#### Task 1.1: LiteLLM setup in `docker-compose.yml` and `litellm/config.yaml`
- **Files to create/modify:**
  - `docker-compose.yml`
  - `litellm/config.yaml`
- **Description:**
  - Add `litellm` service to `docker-compose.yml` using image `ghcr.io/berriai/litellm:main-latest` on port `4000:4000`.
  - Create `litellm/config.yaml` with model `nenufar-bot` pointing to `groq/llama-3.3-70b-versatile`, with `drop_params: true` and `master_key: os.environ/LITELLM_MASTER_KEY`.
- **Acceptance criteria:**
  - [ ] `docker-compose.yml` defines the `litellm` service mounting `./litellm/config.yaml:/app/config.yaml:ro`.
  - [ ] `litellm/config.yaml` has `drop_params: true`.
  - [ ] `docker-compose up -d` brings up Postgres (:5433) and LiteLLM (:4000).
- **Verification:**
  ```bash
  docker-compose up -d litellm
  curl -s http://localhost:4000/health
  # Must return status OK
  ```

#### Task 1.2: Environment Variables and Dependencies
- **Files to modify:**
  - `.env.example`
  - `package.json`
- **Description:**
  - Add `ANTHROPIC_BASE_URL=http://localhost:4000`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL=nenufar-bot`, and `LITELLM_MASTER_KEY` to `.env.example` and `.env`.
  - Remove `groq-sdk` and install `@anthropic-ai/claude-agent-sdk` and `zod`.
- **Acceptance criteria:**
  - [ ] `.env.example` documents all new variables.
  - [ ] `pnpm remove groq-sdk` executed.
  - [ ] `pnpm add @anthropic-ai/claude-agent-sdk zod` executed.
- **Verification:**
  ```bash
  pnpm ls @anthropic-ai/claude-agent-sdk zod
  ```

---

### 🔹 Phase 2: Zod-Typed Tool Definitions

#### Task 2.1: Create catalog and operations tools (`src/lib/agent/tools.ts`)
- **Files to create:**
  - `src/lib/agent/tools.ts`
- **Description:**
  Implement the 7 Shirley tools described in `SPEC-002` connected to Payload Local API:
  1. `buscarProducto`: Search by title in `products` collection.
  2. `destacarProducto`: Toggle `featured` boolean by `slug`.
  3. `actualizarInventario`: Update `stock` and/or `priceInCOP` by `slug`.
  4. `pedidosPendientes`: List orders with status `processing`/`pending`.
  5. `confirmarPedido`: Change order status to `completed`.
  6. `publicarEvento`: Create record in `events` collection.
  7. `crearProductoDraft`: Create draft product (`_status: 'draft'`).
- **Tool rules:**
  - All error outputs must be caught and returned as friendly text (never stack traces to Telegram).
  - COP currency format without decimals: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.
- **Acceptance criteria:**
  - [ ] Each tool has a Zod schema with clear descriptions (user-facing messages remain in Spanish per Constitution Art. VI).
  - [ ] Each tool receives or accesses the `payload` instance (Payload Local API) with `overrideAccess: false` or admin permissions as appropriate.
- **Verification:**
  - `pnpm lint` passes without errors in `src/lib/agent/tools.ts`.

---

### 🔹 Phase 3: Agent Runtime and Webhook Adapter

#### Task 3.1: Implement Query Runtime (`src/lib/agent/runShirleyAgent.ts`)
- **Files to create:**
  - `src/lib/agent/runShirleyAgent.ts`
- **Description:**
  - Invoke `query` from Claude Agent SDK configured with:
    - Base URL: `process.env.ANTHROPIC_BASE_URL` (http://localhost:4000)
    - Auth token: `process.env.ANTHROPIC_AUTH_TOKEN` (or `LITELLM_MASTER_KEY`)
    - Model: `process.env.ANTHROPIC_MODEL || 'nenufar-bot'`
    - System prompt with Shirley's warm Cartagena tone, business rules, and tool list.
    - Turn limit: `maxTurns: 4`.
  - Catch failures (e.g., LiteLLM timeout/down) and return a safe courteous message.
- **Acceptance criteria:**
  - [ ] The SDK runs the autonomous agentic cycle (decision → tool call → result → final answer).
  - [ ] On critical error or gateway down, returns fallback: *"Shirley, tuve un inconveniente conectando con el servicio. Puedes revisar directamente en /admin mientras tanto 💜"*.

#### Task 3.2: Update Webhook Handler (`src/app/(app)/telegram/webhook/route.ts`)
- **Files to modify:**
  - `src/app/(app)/telegram/webhook/route.ts`
- **Description:**
  - Keep secret validation `x-telegram-bot-api-secret-token` intact.
  - Keep admin guard: `chatId === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)`.
  - Keep `update_id` deduplication.
  - Replace `routeAndRun(...)` call with `runShirleyAgent({ text, payload, chatId, userName })`.
  - Send reply via `sendTelegramReply`.
- **Acceptance criteria:**
  - [ ] Webhook remains at `/telegram/webhook` (not under `/api/`).
  - [ ] Unauthorized messages are silently rejected with `200 OK` (preventing Telegram retries).

---

### 🔹 Phase 4: Code Cleanup and Documentation Update

#### Task 4.1: Remove Obsolete Code
- **Files to delete:**
  - `src/lib/groq.ts`
  - `src/lib/agents/orchestrator.ts`
  - `src/lib/agents/runtime.ts`
  - `src/lib/agents/skills/*`
- **Acceptance criteria:**
  - [ ] No residual imports of `groq-sdk` or the manual orchestrator remain.

#### Task 4.2: Update `CLAUDE.md` and `AGENTS.md`
- **Files to modify:**
  - `CLAUDE.md`
  - `AGENTS.md`
- **Description:**
  - Update bot diagrams and descriptions to reflect **Claude Agent SDK + LiteLLM (:4000) → Groq Free Tier** architecture.
  - Document migration close date.
- **Acceptance criteria:**
  - [ ] Both documents accurately reflect the final architecture.

---

## 4. Verification Checkpoints and DoD (Definition of Done)

### Checkpoint A: Isolated Gateway Verification
```bash
docker-compose up -d litellm
curl -X POST http://localhost:4000/v1/messages \
  -H "x-api-key: sk-nenufar-local" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "nenufar-bot",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hola, responde OK"}]
  }'
# Must return valid JSON response from Groq
```

### Checkpoint B: Build and Integration Verification
```bash
pnpm build
# Must compile successfully (ignoring pre-existing TS errors for slug/paymentMethod)
```

### Checkpoint C: Bot Functional Verification
With dev server running on port 3002:
1. Simulate/test webhook with message: `¿Qué pedidos tengo pendientes?` -> invokes `pedidosPendientes` tool and formats reply.
2. Simulate repeated message with same `update_id` -> deduplicated without double tool execution.
3. Simulate LiteLLM down (`docker-compose stop litellm`) -> courteous safe message in Telegram, no server crash.
