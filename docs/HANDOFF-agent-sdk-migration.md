# Handoff — Migrate the bot to the Claude Agent SDK on Groq (via LiteLLM)

> For an OpenCode (or any) agent picking up this work. Self-contained. Target: replace the
> hand-rolled Groq orchestration with the **Claude Agent SDK**, kept **free** by running on
> **Groq** through a **LiteLLM** proxy. Related: `docs/SKILLS.md`, `docs/RAG-MEMORY-design.md`,
> `.claude/HANDOFF-agents.md`.

## Why

Slice 1 built the bot by hand: `orchestrator.ts` (router) + `runtime.ts` (tool-calling loop) +
agents + skills, all on `groq-sdk`. The decision is to let the **Claude Agent SDK** manage the
skills (loop, subagents, hooks, MCP, memory built-in) — but stay on Groq's free tier, not paid
Claude. The Agent SDK speaks the Anthropic API and Groq speaks OpenAI format, so a **LiteLLM
proxy** bridges them. The store's core (web order → Telegram) is untouched; this is the amplifier.

## Target architecture

```
Telegram → /telegram/webhook → runShirleyAgent()
   Claude Agent SDK: query() + tools + system prompt
        │  Anthropic API
        ▼
   LiteLLM proxy (ANTHROPIC_BASE_URL) ──OpenAI API──▶ Groq (Llama, free)
        │
   tools execute Payload logic → reply to Shirley
```

- Skills become **SDK tools** (in-process MCP via `createSdkMcpServer` + `tool()`, schemas with
  `zod`). CMS-over-official-MCP (`@payloadcms/plugin-mcp`) is phase 3.4; for now tools call the
  Payload Local API directly.
- **Drop the manual router** — one "Shirley admin" agent with all tools; the model picks.

## LiteLLM bridge

- `litellm/config.yaml`: map an Anthropic alias (e.g. `nenufar-bot`) → `groq/llama-3.3-70b-versatile`
  (+ a small/fast alias). Add `litellm_settings: { drop_params: true }` to strip params Groq rejects
  (the known `output_config` issue). Pin the LiteLLM version.
- Run it as a `litellm` service in `docker-compose.yml` (next to postgres), serving `:4000`.
- Env (`.env.example`): `ANTHROPIC_BASE_URL=http://localhost:4000`, `ANTHROPIC_AUTH_TOKEN=<litellm key>`,
  `ANTHROPIC_MODEL=nenufar-bot`, `ANTHROPIC_SMALL_FAST_MODEL=nenufar-bot`, `LITELLM_MASTER_KEY`,
  keep `GROQ_API_KEY` (now consumed by LiteLLM), `TELEGRAM_ADMIN_CHAT_ID`.

## Files

**Remove** (replaced by the SDK): `src/lib/groq.ts`, `src/lib/agents/orchestrator.ts`,
`src/lib/agents/runtime.ts`, `src/lib/agents/catalogo.ts`, `src/lib/agents/conversacion.ts`,
`src/lib/agents/skills/derivarAShirley.ts` (obsolete — Shirley-only model).

**Add**: `src/lib/agent/tools.ts` (SDK tools; port `buscarProducto` from
`src/lib/agents/skills/buscarProductos.ts` — reuse the `payload.find` published-products query),
`src/lib/agent/runShirleyAgent.ts` (wraps SDK `query()` with the Shirley-admin system prompt +
tools + model from env, returns the reply), `litellm/config.yaml`.

**Modify**: `src/lib/agents/types.ts` (keep `AgentContext`; drop `Skill`/`Agent`/`ToolDefinition`);
`src/app/(app)/telegram/webhook/route.ts` (replace `routeAndRun` at lines 13/73 with
`runShirleyAgent`; **add the missing** `chatId === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)`
guard → else 200 and ignore); `package.json` (remove `groq-sdk`; add `@anthropic-ai/claude-agent-sdk`
— confirm exact package name at install — and `zod`); `docker-compose.yml`; `.env.example`;
`tests/int/agents.int.spec.ts` (test tool handlers vs a fake `payload`, and the webhook wiring by
mocking `runShirleyAgent`; the loop is now the SDK's).

## Phases (each shippable)

1. **Bridge up** — LiteLLM config + docker service + env; a no-tool SDK "hello" reply. Prove
   SDK→LiteLLM→Groq works.
2. **Port `buscarProducto`** as an SDK tool; wire the webhook to `runShirleyAgent`; add the
   `chat_id` guard; delete the hand-rolled loop and Groq client.
3. **Admin skills** (`pedidosPendientes`, `confirmarPedido`, `actualizarInventario`) as tools, in
   `docs/SKILLS.md` order.
4. **Reconcile docs + the architecture artifact.**

## Caveats

Extra infra (the proxy); the `output_config`/unknown-param issue (fix with `drop_params`); Groq's
Llama is less tuned for the SDK than Claude (tune tool descriptions + system prompt); unofficial
path (an SDK upgrade can break the bridge).

## Verify (end-to-end)

`docker-compose up -d` (postgres + litellm) · `pnpm dev` (:3002) · `cloudflared tunnel` ·
`pnpm tsx scripts/set-telegram-webhook.ts <url>`. As Shirley's chat_id: "¿tienen aretes de plata?"
→ the SDK calls `buscarProducto` → real products. From another chat_id → 200, ignored.
`pnpm test:int`. Check LiteLLM logs show the Anthropic→Groq translation without param errors.

## References

- LiteLLM — Claude Agent SDK with LiteLLM: https://docs.litellm.ai/docs/tutorials/claude_agent_sdk
- LiteLLM — Claude Code with non-Anthropic models: https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models
- Anthropic — LLM gateway (`ANTHROPIC_BASE_URL`): https://docs.anthropic.com/en/docs/claude-code/llm-gateway
- `wearedevx/groq-for-claude-code`: https://github.com/wearedevx/groq-for-claude-code
- Known param issue: https://github.com/BerriAI/litellm/issues/22963
