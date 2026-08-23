# Task List (TODO) — Nénufar

General implementation backlog and agent execution checklist.

---

## 🚀 IP-001: Shirley Bot Migration to Claude Agent SDK + LiteLLM

Reference: [`tasks/IP-001-bot-claude-agent-sdk.md`](file:///home/ale/Work/nenufar/tasks/IP-001-bot-claude-agent-sdk.md)  
Worktree: `/home/ale/Work/nenufar-bot-sdk`  
Branch: `feature/bot/claude-agent-sdk-migration`  

### Phase 1: LiteLLM Infrastructure and Gateway
- [x] **1.1** Configure `litellm` in `docker-compose.yml` and create `litellm/config.yaml` (`drop_params: true`, model `nenufar-bot` -> `groq/llama-3.3-70b-versatile`).
  - Note: `env_file: .env` is NOT used — the app's `DATABASE_URL` made LiteLLM run its Prisma migrations against the wrong DB and crash on startup. Only `GROQ_API_KEY` and `LITELLM_MASTER_KEY` are passed via `environment`.
- [x] **1.2** Update `.env.example`, `.env` and dependencies in `package.json` (`pnpm remove groq-sdk`, `pnpm add @anthropic-ai/claude-agent-sdk zod`). SDK v0.3.240 + zod v4.4.3. Also `serverExternalPackages` in `next.config.ts`.
- [x] **Checkpoint 1:** `docker compose up -d litellm` starts and `curl http://localhost:4000/health/liveliness` returns 200 "I'm alive!". `/v1/messages` returns valid JSON routing to Groq (verified up to Groq: fails only due to empty `GROQ_API_KEY` — ⚠️ **pending Ale to add free key to `.env`** for real inference).

### Phase 2: Zod-Typed Tools
- [x] **2.1** Implement `src/lib/agent/tools.ts` with Shirley's 7 tools (`buscarProducto`, `destacarProducto`, `actualizarInventario`, `pedidosPendientes`, `confirmarPedido`, `publicarEvento`, `crearProductoDraft`) connected to Payload Local API.
  - Notes: `Product` uses `inventory` (not `stock`) and had no `featured` field → checkbox added to collection + `pnpm generate:types`. `Order.status` only has `processing|completed|cancelled|refunded` (no `pending`). In-process MCP server via `createSdkMcpServer`.
- [x] **Checkpoint 2:** `tsc --noEmit` clean in `src/lib/agent/tools.ts`. ⚠️ `pnpm lint` is BROKEN repo-wide (also on main): circular TypeError in eslint-config — pre-existing, not a regression. `tsc --noEmit` used as gate.

### Phase 3: Agent Runtime and Webhook
- [x] **3.1** Create `src/lib/agent/runShirleyAgent.ts` using `query` from `@anthropic-ai/claude-agent-sdk` with base URL `:4000`, maxTurns 4 and resilient fallback.
  - 45s timeout, warm Cartagena system prompt, `mcp__nenufar-tienda__*` whitelist, `AGENT_FALLBACK` on any gateway failure without stack traces to Telegram.
- [x] **3.2** Update `src/app/(app)/telegram/webhook/route.ts` keeping secret validation, single-admin guard (`chat_id === TELEGRAM_ADMIN_CHAT_ID`, silent 200 rejection), `update_id` deduplication and routing to `runShirleyAgent`.
- [x] **Checkpoint 3:** Webhook responds correctly on dev (:3002). Admin guard and dedup verified via code + unit tests `agent-runtime.int.spec`. ⚠️ End-to-end validation with real Telegram requires `GROQ_API_KEY` and public tunnel (`pnpm tsx scripts/set-telegram-webhook.ts`).

### Phase 4: Cleanup and Documentation
- [x] **4.1** Remove obsolete code (`src/lib/groq.ts`, `src/lib/agents/orchestrator.ts`, `src/lib/agents/runtime.ts`, `src/lib/agents/skills/*`). Also `catalogo.ts`/`conversacion.ts`/`types.ts` (only consumed by orchestrator). `tests/int/agents.int.spec.ts` replaced by `agent-runtime.int.spec.ts` (SDK mock).
- [x] **4.2** Update `CLAUDE.md` (v3.3, LiteLLM diagram, new env vars) and `AGENTS.md` (migration close IP-001/ADR-002).
- [x] **Checkpoint 4 (DoD):** `pnpm exec next build` compiles (Turbopack ✓, type-check fails only on pre-existing `slug` — baseline 47 errors, parity with main). `pnpm exec tsc --noEmit` no regressions in `src/lib/agent/*`. `pnpm run test:int` 16 passed (collateral fix: `@payloadcms/storage-vercel-blob` aligned to `3.86.0`, postgres restarted). LiteLLM-down fallback verified via `runShirleyAgent` (try/catch + timeout → `AGENT_FALLBACK`). ⚠️ `pnpm build` (`payload build`) and `pnpm lint` broken also on main (pre-existing). `GROQ_API_KEY` still pending in `.env`.

---

## ⏳ Upcoming IPs on Hold

- [ ] **IP-002:** Storefront & Checkout Hardening (SPEC-001)
- [ ] **IP-003:** Landing Modular Blocks and Catalog (SPEC-003)
- [ ] **IP-004:** Fair Kit & QR Capture (Business Strategy)
