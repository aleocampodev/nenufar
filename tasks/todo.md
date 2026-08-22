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
- [ ] **2.1** Implementar `src/lib/agent/tools.ts` con las 7 tools de Shirley (`buscarProducto`, `destacarProducto`, `actualizarInventario`, `pedidosPendientes`, `confirmarPedido`, `publicarEvento`, `crearProductoDraft`) conectadas a Payload Local API.
- [ ] **Checkpoint 2:** `pnpm lint` pasa sin errores en `src/lib/agent/tools.ts`.

### Fase 3: Runtime del Agente y Webhook
- [ ] **3.1** Crear `src/lib/agent/runShirleyAgent.ts` usando `query` de `@anthropic-ai/claude-agent-sdk` con base URL `:4000`, maxTurns 4 y fallback resiliente.
- [ ] **3.2** Actualizar `src/app/(app)/telegram/webhook/route.ts` manteniendo validación de secreto, single-admin guard por chat_id, deduplicación por update_id y enrutando a `runShirleyAgent`.
- [ ] **Checkpoint 3:** Probar mensajes de prueba al webhook en dev (:3002) y validar que el bot responde correctamente.

### Fase 4: Limpieza y Documentación
- [ ] **4.1** Eliminar código obsoleto (`src/lib/groq.ts`, `src/lib/agents/orchestrator.ts`, `src/lib/agents/runtime.ts`, `src/lib/agents/skills/*`).
- [ ] **4.2** Actualizar `CLAUDE.md` y `AGENTS.md` registrando la arquitectura final y cerrando la migración.
- [ ] **Checkpoint 4 (DoD):** `pnpm build` pasa sin regresiones y test de caída de LiteLLM responde mensaje de cortesía en Telegram sin crash.

---

## ⏳ Próximos IPs en Espera

- [ ] **IP-002:** Storefront & Checkout Hardening (SPEC-001)
- [ ] **IP-003:** Bloques Modulares Landing y Catálogo (SPEC-003)
- [ ] **IP-004:** Kit de Ferias & Captación QR (Estrategia Negocio)
