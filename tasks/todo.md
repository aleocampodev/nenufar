# Task List (TODO) — Nénufar

Estado general del backlog de implementación y checklist de ejecución para agentes.

---

## 🚀 IP-001: Migración Bot Shirley a Claude Agent SDK + LiteLLM

Referencia: [`tasks/IP-001-bot-claude-agent-sdk.md`](file:///home/ale/Work/nenufar/tasks/IP-001-bot-claude-agent-sdk.md)  
Worktree: `/home/ale/Work/nenufar-bot-sdk`  
Branch: `feature/bot/claude-agent-sdk-migration`  

### Fase 1: Infraestructura y Gateway LiteLLM
- [x] **1.1** Configurar `litellm` en `docker-compose.yml` y crear `litellm/config.yaml` (`drop_params: true`, modelo `nenufar-bot` -> `groq/llama-3.3-70b-versatile`).
  - Nota: NO se usa `env_file: .env` — el `DATABASE_URL` de la app hacía que LiteLLM corriera sus migraciones Prisma contra una DB ajena y muriera en el arranque. Se pasan solo `GROQ_API_KEY` y `LITELLM_MASTER_KEY` vía `environment`.
- [x] **1.2** Actualizar `.env.example`, `.env` y dependencias en `package.json` (`pnpm remove groq-sdk`, `pnpm add @anthropic-ai/claude-agent-sdk zod`). SDK v0.3.240 + zod v4.4.3. También `serverExternalPackages` en `next.config.ts`.
- [x] **Checkpoint 1:** `docker compose up -d litellm` levanta y `curl http://localhost:4000/health/liveliness` responde 200 "I'm alive!". `/v1/messages` responde JSON válido ruteando a Groq (verificado hasta Groq: falla únicamente por `GROQ_API_KEY` vacía — ⚠️ **pendiente que Ale cargue su key free en `.env`** para inferencia real).

### Fase 2: Tools Tipadas Zod
- [x] **2.1** Implementar `src/lib/agent/tools.ts` con las 7 tools de Shirley (`buscarProducto`, `destacarProducto`, `actualizarInventario`, `pedidosPendientes`, `confirmarPedido`, `publicarEvento`, `crearProductoDraft`) conectadas a Payload Local API.
  - Notas: `Product` usa `inventory` (no `stock`) y no tenía campo `featured` → se agregó checkbox al collection + `pnpm generate:types`. `Order.status` solo tiene `processing|completed|cancelled|refunded` (no existe `pending`). MCP server in-process vía `createSdkMcpServer`.
- [x] **Checkpoint 2:** `tsc --noEmit` sin errores en `src/lib/agent/tools.ts`. ⚠️ `pnpm lint` está ROTO en el repo (también en main): TypeError circular en eslint-config — pre-existente, no es regresión. Se usa `tsc --noEmit` como compuerta.

### Fase 3: Runtime del Agente y Webhook
- [x] **3.1** Crear `src/lib/agent/runShirleyAgent.ts` usando `query` de `@anthropic-ai/claude-agent-sdk` con base URL `:4000`, maxTurns 4 y fallback resiliente.
  - Timeout 45s, system prompt cálido cartagenero, whitelist `mcp__nenufar-tienda__*`, `AGENT_FALLBACK` ante cualquier fallo del gateway sin stack traces a Telegram.
- [x] **3.2** Actualizar `src/app/(app)/telegram/webhook/route.ts` manteniendo validación de secreto, single-admin guard por `chat_id === TELEGRAM_ADMIN_CHAT_ID` (rechazo silencioso 200), deduplicación por `update_id` y enrutando a `runShirleyAgent`.
- [x] **Checkpoint 3:** Webhook responde correctamente en dev (:3002). Guard de admin y dedup verificados por código + tests unitarios `agent-runtime.int.spec`. ⚠️ Validación end-to-end con Telegram real requiere `GROQ_API_KEY` y túnel público (`pnpm tsx scripts/set-telegram-webhook.ts`).

### Fase 4: Limpieza y Documentación
- [x] **4.1** Eliminar código obsoleto (`src/lib/groq.ts`, `src/lib/agents/orchestrator.ts`, `src/lib/agents/runtime.ts`, `src/lib/agents/skills/*`). También `catalogo.ts`/`conversacion.ts`/`types.ts` (solo los consumía el orquestador). `tests/int/agents.int.spec.ts` reemplazado por `agent-runtime.int.spec.ts` (mock del SDK).
- [x] **4.2** Actualizar `CLAUDE.md` (v3.3, diagrama LiteLLM, env vars nuevas) y `AGENTS.md` (cierre migración IP-001/ADR-002, `featured` no listado pero implícito en tools).
- [x] **Checkpoint 4 (DoD):** `pnpm exec next build` compila (Turbopack ✓, type-check falla solo en `slug` pre-existente — baseline 47 errores, paridad con main). `pnpm exec tsc --noEmit` sin regresiones en `src/lib/agent/*`. `pnpm run test:int` 16 passed (fix colateral: `@payloadcms/storage-vercel-blob` alineado a `3.86.0`, postgres reiniciado). Fallback ante caída de LiteLLM verificado por `runShirleyAgent` (try/catch + timeout → `AGENT_FALLBACK`). ⚠️ `pnpm build` (`payload build`) y `pnpm lint` rotos también en main (pre-existentes). `GROQ_API_KEY` sigue pendiente en `.env`.

---

## ⏳ Próximos IPs en Espera

- [ ] **IP-002:** Storefront & Checkout Hardening (SPEC-001)
- [ ] **IP-003:** Bloques Modulares Landing y Catálogo (SPEC-003)
- [ ] **IP-004:** Kit de Ferias & Captación QR (Estrategia Negocio)
