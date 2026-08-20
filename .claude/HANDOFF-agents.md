# Handoff — Shirley's Management Bot (Telegram + AI Agents, v3.2)

> For AI agents continuing this work. State as of 20 August 2026.

---

## Business context

**Nénufar** is a one-person artisan jewelry store: Shirley (Cartagena, Colombia). She designs,
makes, sells, packs, and ships. Her phone is her office.

**Golden rule:** the bot is **Shirley's own management tool** — it does not serve buyers.
Buyers build their order on the web; the bot only helps Shirley run her store (view orders,
confirm, update stock) from Telegram. The sale and its close always stay with Shirley over
WhatsApp.

---

## Current state (slice 1 — implemented)

### ✅ What's done

| Component | File(s) | Status |
|-----------|---------|--------|
| Groq client | `src/lib/groq.ts` | ✅ Ready |
| Shared types | `src/lib/agents/types.ts` | ✅ Ready |
| Runtime (tool-calling loop) | `src/lib/agents/runtime.ts` | ✅ Ready |
| Orchestrator | `src/lib/agents/orchestrator.ts` | ✅ Ready |
| Catalog agent | `src/lib/agents/catalogo.ts` | ✅ Ready |
| Conversation agent | `src/lib/agents/conversacion.ts` | ✅ Ready (obsolete under the Shirley-only model) |
| Skill `buscarProductos` | `src/lib/agents/skills/buscarProductos.ts` | ✅ Ready |
| Skill `derivarAShirley` | `src/lib/agents/skills/derivarAShirley.ts` | ✅ Ready (obsolete — no buyer to hand off) |
| Webhook handler | `src/app/(app)/telegram/webhook/route.ts` | ✅ Ready |
| `sendTelegramReply` | `src/lib/telegram.ts` (bottom) | ✅ Ready |
| Set-webhook script | `scripts/set-telegram-webhook.ts` | ✅ Ready |
| Integration tests | `tests/int/agents.int.spec.ts` (4 tests) | ✅ Passing |
| Env-var docs | `.env.example` | ✅ Updated |
| Architecture diagram | `docs/arquitectura.html` | ✅ Updated |

### ⚠️ What still needs manual configuration (the user does this)

1. **Groq API key** — get one at https://console.groq.com (free)
   Variable: `GROQ_API_KEY`

2. **Webhook secret** — a random string
   `openssl rand -hex 24`
   Variable: `TELEGRAM_WEBHOOK_SECRET`

3. **Shirley's chat_id** — message `@userinfobot` on Telegram
   Variable: `TELEGRAM_ADMIN_CHAT_ID` (the only sender the bot processes)

4. **HTTPS tunnel** — to expose the webhook locally
   `cloudflared tunnel --url http://localhost:3002`

5. **Register the webhook** (same bot already used for orders)
   `pnpm tsx scripts/set-telegram-webhook.ts <tunnel-url>`

> **No extra bot needed.** The same `TELEGRAM_BOT_TOKEN` does both jobs: it sends order
> notifications to Shirley's channel, and it receives Shirley's own management messages via the
> webhook (auth by `TELEGRAM_ADMIN_CHAT_ID`).

---

## Agent-system architecture

```
SHIRLEY writes → Bot (@NenufarPedidosBot — same TELEGRAM_BOT_TOKEN)
                              │
                     POST /telegram/webhook
                              │
                    ┌─────────▼──────────┐
                    │ chat_id == ADMIN?  │  ← auth: only Shirley's chat_id
                    │  no → 200, ignore  │
                    └─────────┬──────────┘
                              │ yes
                    ┌─────────▼──────────┐
                    │   routeAndRun()    │
                    │   orchestrator.ts  │
                    └─────────┬──────────┘
                              │
              ┌───────────────▼───────────────┐
              │         Groq / Llama 3.3       │  ← 1 call, temp=0
              │       interprets intent        │
              └──┬──────────┬──────────┬───────┘
                 │          │          │
             'orders'  'catalog'  'inventory'
                 │          │          │
           ┌─────▼───┐ ┌────▼────┐ ┌───▼──────────┐
           │pedidos- │ │buscar-  │ │actualizar-   │
           │Pendient.│ │Producto │ │Inventario    │
           │confirmar│ │         │ │              │
           └─────┬───┘ └────┬────┘ └───┬──────────┘
                 │          │          │
          payload.find/  payload.find  payload.update
          update(orders) (products)    (products.stock)
                 │          │          │
                 └──────────┼──────────┘
                            │
                   sendTelegramReply()
                   (replies to Shirley)
```

> Slice 1 built the `catalogo`/`conversacion` routes for the (dropped) assumption that buyers
> wrote to the bot. Under the current model the bot is **Shirley-only**: add the `chat_id` guard
> and the management skills (`pedidosPendientes`, `confirmarPedido`, `actualizarInventario`).
> `derivarAShirley` is obsolete (there is no buyer to hand off).

### Key implementation decisions

- **Webhook lives at `/telegram/webhook`**, NOT under `/api/...` — Payload's catch-all at
  `src/app/(payload)/api/[...slug]/route.ts` would capture any route under `/api`.
- **One bot, Shirley only:** `TELEGRAM_BOT_TOKEN` does both — order notifications to Shirley's
  channel (original, unchanged) and Shirley's management messages via the webhook (new,
  authenticated by `TELEGRAM_ADMIN_CHAT_ID`). Buyers never write to the bot. No extra bot needed.
- **Runtime: max 4 tool-calling rounds** per request to avoid infinite loops.
- **Deduplication by `update_id`** in an in-memory `Set` (max 1000 entries), same pattern as
  `src/lib/idempotency.ts`.
- **Pre-existing `slug` bug in Payload's generated types** — worked around in `buscarProductos.ts`
  with an explicit cast `as { title?: string; slug?: string; priceInCOP?: number | null }`. Don't
  touch without understanding the plugin's type system.

---

## Improvements roadmap

> The single index of everything agreed for the bot going forward. Detail lives in the linked
> docs. Status: ✅ done · 🔜 next · 🕓 later.

| Area | Improvement | Status | Detail |
|------|-------------|--------|--------|
| Bot skills | Orders — `pedidosPendientes`, `confirmarPedido`, `buscarPedido`, `resumenDelDia` | 🔜 | [`docs/SKILLS.md`](../docs/SKILLS.md) §2 |
| Bot skills | Catalog update — `actualizarInventario`, `actualizarPrecio`, publish/unpublish | 🔜 | `SKILLS.md` §1 |
| Bot skills | Landing / content — `destacarProducto`, `publicarEvento`, hero/blog edits | 🔜 / 🕓 | `SKILLS.md` §3 |
| Bot skills | Copywriting — `generarCaption` (brand voice, **Telegram + admin**) | 🔜 | `SKILLS.md` §4 |
| UX | Interaction patterns — images, references, confirmation | ref | `SKILLS.md` §5 |
| Knowledge (RAG) | `knowledge/*.md` + catalog → `rag.chunks` (semantic search) | 🕓 3.3 | [`docs/RAG-MEMORY-design.md`](../docs/RAG-MEMORY-design.md) |
| CMS access | Payload as MCP tools (official plugin) | 🕓 3.4 | `SKILLS.md` §7 |
| Memory | Windowed conversation memory + rolling summary | 🕓 4.0 | `RAG-MEMORY-design.md` §6 |

### Next slice — bot skills

The immediate work. Full catalog, per-skill detail, and cross-cutting rules in
[`docs/SKILLS.md`](../docs/SKILLS.md). Build order:

1. **Orders first** — `pedidosPendientes` + `confirmarPedido`. Establishes the `chat_id` auth
   guard and the first Payload write.
2. **Catalog update** — `actualizarInventario`, then `actualizarPrecio`.
3. **Landing (safe)** — `destacarProducto`, `publicarEvento`.
4. **Copywriting** — `generarCaption`. High value, no write risk (it only drafts). A shared
   `generateCopy()` reached from **both** Telegram and a "✨ Generate" button in the Payload
   admin; grounded in brand voice (`knowledge/brand-essence.md`).

**Interaction patterns** (`SKILLS.md` §5) apply to every skill: intent lives in the words
(Telegram is only transport); a bare photo → the bot asks what it's for; reference orders by id
(name/position needs memory); always confirm writes.

> **Design detail (English):** phases 3.3 and 4.0 are specified in
> [`docs/RAG-MEMORY-design.md`](../docs/RAG-MEMORY-design.md). Agreed topology:
> **Option A (unified)** — Payload + a `rag` schema in a single Supabase.
> **Key principle:** Supabase is a **derived index, never the source** — knowledge lives in
> `knowledge/*.md` (git) + Payload; Supabase can be rebuilt.

### Phase 3.3 — Knowledge RAG (Supabase)

**Goal:** one semantic search over **two sources**: the catalog (Payload) and the curated brand
knowledge in `knowledge/*.md` (essence, policies, care, FAQ). Consumer = **Shirley** (the bot is
hers alone).

**Stack (all free):**
- Embeddings: `Transformers.js` with `multilingual-e5-small` (384d, local, no API key; `passage:`/`query:` prefixes)
- Vector store: **Supabase** (pgvector) in a `rag` schema, same DB as Payload; dev with Supabase local (offline)
- Single `rag.chunks` table (`source_type` = `product` | `knowledge`) → one query spans products and knowledge
- Ingestion (idempotent, delete-then-insert by `source_id`):
  - Products: `afterChange`/`afterDelete` hook on Products → chunk → embed → upsert
  - Knowledge: `scripts/ingest-knowledge.ts` reads `knowledge/*.md`, splits on `##`, embeds, upserts

**Code impact:**
- `knowledge/*.md` — curated knowledge (source of truth, in git)
- `src/lib/agents/skills/buscarProductos.ts` → replace `like` with vector search over `rag.chunks`
- New: `src/lib/embeddings.ts` — local embedder (singleton)
- New: `src/lib/vectorStore.ts` — upsert / delete / search over `rag.chunks`
- New: `src/hooks/products/indexProduct.ts` — Payload afterChange/afterDelete hooks
- New: `scripts/ingest-knowledge.ts` + `scripts/reindex-all.ts`
- New: `supabase/migrations/*.sql` — `rag` schema, `vector` extension, tables, indexes

### Phase 3.4 — MCP for the CMS

**Goal:** expose Payload as MCP tools so the skills read/update the catalog in a structured way,
instead of calling the Local API directly.

> **Official plugin already exists:** `@payloadcms/plugin-mcp` (docs:
> https://payloadcms.com/docs/plugins/mcp). It exposes collections and globals as MCP tools
> (find/create/update/delete, configurable per operation), with API-key auth and per-collection,
> per-operation permissions (admin → MCP → API Keys), targeting the live instance over HTTP.
> **No need to build MCP from scratch** — adopt the plugin and point the skills at its tools. The
> migration is invisible to the agent: the tool schema stays the same, only the implementation
> changes (`payload.update(...)` → MCP tool call).

### Phase 4.0 — Conversation memory (Supabase)

**Goal:** the bot remembers the last turns per `chat_id` → enables multi-turn for Shirley
("confirm it").

**Approach (with hygiene, no raw dump):** windowed memory (last ~N turns) in
`rag.conversation_messages`, loaded in `routeAndRun` and passed to Groq. When it grows, the old
turns are **summarized** into a `kind='summary'` row (via Groq) and the raw ones deleted → bounded
row count. Memory is NOT the knowledge base: durable facts live in `knowledge/*.md`, not in
memory. Long-term semantic memory = optional/future. Detail in `docs/RAG-MEMORY-design.md §6`.

---

## How to contribute / continue

### Project rule

**Never change `main` directly.** Create a worktree + feature branch:

```bash
git worktree add ../nenufar-<name> feature/<name>
cd ../nenufar-<name>
# work here
```

### To add a new skill

1. Create `src/lib/agents/skills/mySkill.ts` implementing the `Skill` interface from `types.ts`
2. Register the skill on the right agent in `catalogo.ts` (or a new admin agent)
3. Add a test in `tests/int/agents.int.spec.ts` (mock Groq and Telegram)

### To create a new agent

1. Create `src/lib/agents/myAgent.ts` with a `systemPrompt` + `skills[]`
2. Add the case in `orchestrator.ts` → `route()` and `routeAndRun()`
3. Update the orchestrator tests

### Running the tests (offline)

```bash
# from the working worktree
NODE_OPTIONS=--no-deprecation npx vitest run tests/int/agents.int.spec.ts
```

---

## Key files to read first

If you're an agent coming in cold, read these in order:

1. `CLAUDE.md` — project rules, stack, brand color, dev port
2. `docs/SKILLS.md` — the skills roadmap (what to build next)
3. `src/lib/agents/types.ts` — the base interfaces
4. `src/lib/agents/orchestrator.ts` — the system's entry point
5. `src/lib/agents/runtime.ts` — how the tool-calling loop works
6. `tests/int/agents.int.spec.ts` — how tests are structured and how to mock

---

## Operational notes

| Variable | Where to get it | For |
|----------|-----------------|-----|
| `GROQ_API_KEY` | console.groq.com | The agents' LLM |
| `TELEGRAM_WEBHOOK_SECRET` | `openssl rand -hex 24` | Authenticate the webhook |
| `TELEGRAM_ADMIN_CHAT_ID` | `@userinfobot` | Shirley's chat_id — the only sender the bot processes |
| `TELEGRAM_BOT_TOKEN` | already configured | Bot (orders + Shirley's management — don't create a new one) |
| `TELEGRAM_CHANNEL_ID` | already configured | Shirley's channel (don't touch) |

The management bot's webhook uses the same bot as the order flow. The existing order flow is
untouched — the webhook is only added as a new inbound channel (for Shirley only).
