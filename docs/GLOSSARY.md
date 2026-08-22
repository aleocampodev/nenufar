# Glossary — Nénufar

> To understand Shirley's bot, Tool Calling, and the migration to the Claude Agent SDK. Shared language for the whole team (technical and non-technical).

---

## 1. Core Concepts

### LLM (Large Language Model)
An AI model that predicts text. Examples: `GPT-4o` (OpenAI), `Claude 3.5 Sonnet` (Anthropic), `Llama 3.3 70B` (Meta). It has no access to your database on its own — it only generates words.

### Groq
A company that **rents ultra-fast servers** to run open-source models (like Meta's `Llama 3.3`). It doesn't build the model, it just makes it run very fast. Nénufar uses Groq because it has a **free tier**: you get a `GROQ_API_KEY` at `console.groq.com` and can use `llama-3.3-70b-versatile` for free (with limits ~30 req/min, ~14k req/day). Enough for Shirley's bot (tens of messages per day).

### OpenAI API vs Anthropic API
Not companies — **plug formats** (like USB-C vs Lightning).

| Format | Invented by | What a message looks like |
|---|---|---|
| **OpenAI API** | OpenAI | `POST /v1/chat/completions` with `{ messages: [{role:"user", content:"hello"}] }` |
| **Anthropic API** | Anthropic | `POST /v1/messages` with `{ messages: [{role:"user", content:[{type:"text", text:"hello"}]}] }` |

Groq copied the OpenAI format on purpose. So you can use the OpenAI SDK to talk to Groq — just change the URL.

---

## 2. Tool Calling (Function Calling)

**The ability of an LLM to ask to execute your code.**

Without Tool Calling:
```
Shirley: "what stock does the Luna necklace have?"
LLM: "It has 5 units" ← HALLUCINATED
```

With Tool Calling:
```
1. You register tools with name + description + params (JSON schema):
   - buscarProducto({ query: string })
   - actualizarInventario({ slug: string, stock: number })
   - pedidosPendientes()

2. Shirley: "set the luna necklace to 3 units"

3. LLM does not reply with text, it replies with JSON:
   { "tool_call": "actualizarInventario", "arguments": { "slug": "collar-luna", "stock": 3 } }

4. Your code (runtime.ts) executes:
   await payload.update({ collection: 'products', where: {slug: 'collar-luna'}, data: {stock: 3} })

5. You return the result to the LLM: "Stock updated to 3"

6. LLM generates the final answer: "Done Shirley, Luna necklace is now at 3 💜"
```

In Nénufar the `skills` (`src/lib/agents/skills/*.ts`) are those tools. `runtime.ts` runs the loop (max 4 rounds): LLM → tool → result → LLM → answer.

**Why it matters:** without Tool Calling the bot is a chatbot that hallucinates. With Tool Calling it is an **agent** that reads/writes your PostgreSQL via `payload.find()` / `payload.update()`.

### System Prompt
Hidden instructions you give the LLM before the conversation. E.g. in Nénufar: *"You are Shirley's assistant, owner of Nénufar. Only you can confirm orders and change stock. Reply in warm, brief Colombian Spanish."*

### Tool / Skill / Agent
- **Tool**: a single function (e.g. `buscarProducto`).
- **Skill**: a set of tools for one domain (e.g. `inventory` skill = `buscarProducto` + `actualizarInventario`).
- **Agent**: LLM + system prompt + tool list + Tool Calling loop.

---

## 3. Universal Gateway (the role of LiteLLM)

### The problem
You want to use the **Claude Agent SDK** (Anthropic's official framework, the best for agents) but **you don't want to pay for Claude**. You want to stay on **Groq for free**.

But they don't speak the same language:
- Claude Agent SDK → speaks Anthropic API
- Groq → speaks OpenAI API

They can't understand each other.

### The solution: LiteLLM
**LiteLLM is an open-source translator proxy that you host yourself.**

```
┌─────────────────┐      Anthropic API      ┌──────────┐      OpenAI API      ┌──────┐
│ Claude Agent SDK│ ───────────────────────► │ LiteLLM  │ ───────────────────► │ Groq │
│ (thinks it talks│   POST /v1/messages     │  :4000   │  POST /v1/chat/      │Llama │
│  to Anthropic)  │                         │ translator│  completions        │ 3.3  │
└─────────────────┘  ◄────────────────────── └──────────┘ ◄─────────────────── └──────┘
```

You configure it with `litellm/config.yaml`:

```yaml
model_list:
  - model_name: nenufar-bot              # name the SDK uses
    litellm_params:
      model: groq/llama-3.3-70b-versatile # where it really goes
      api_key: os.environ/GROQ_API_KEY

litellm_settings:
  drop_params: true  # Groq rejects params like output_config, LiteLLM strips them
```

And you trick the SDK with env vars:

```env
ANTHROPIC_BASE_URL=http://localhost:4000   # not Anthropic, goes to LiteLLM
ANTHROPIC_AUTH_TOKEN=sk-litellm-master-key
ANTHROPIC_MODEL=nenufar-bot
GROQ_API_KEY=gsk_...
```

**Why it's called "Universal Gateway":** with the same code you can switch providers without touching your app. Change one line in `config.yaml`:

```yaml
# Free (today)
model: groq/llama-3.3-70b-versatile

# Paid when you grow and need higher quality (tomorrow)
model: anthropic/claude-3-5-sonnet-20241022
model: openai/gpt-4o
model: gemini/gemini-2.0-flash
```

LiteLLM supports 100+ providers. It's the universal adapter for LLMs.

> See: https://docs.litellm.ai/docs/tutorials/claude_agent_sdk

---

## 4. Claude Agent SDK

Anthropic's official framework for building agents. Gives you for free: Tool Calling loop, sub-agents, hooks, memory, MCP (Model Context Protocol), error handling. In Nénufar it replaces the hand-rolled code:

| Before (hand-rolled) | After (SDK) |
|---|---|
| `src/lib/groq.ts` (hand-rolled Groq client) | removed — handled by LiteLLM |
| `src/lib/agents/runtime.ts` (hand-rolled 4-round loop) | removed — handled by SDK |
| `src/lib/agents/orchestrator.ts` (hand-rolled router) | removed — SDK picks the tool on its own |
| `src/lib/agents/skills/*.ts` | `src/lib/agent/tools.ts` with `tool()` + `zod` |

New code:

```ts
// src/lib/agent/runShirleyAgent.ts
import { query } from "@anthropic-ai/claude-agent-sdk"
import { tools } from "./tools"

export async function runShirleyAgent(text: string, context: AgentContext) {
  const result = await query({
    prompt: text,
    options: {
      model: process.env.ANTHROPIC_MODEL, // "nenufar-bot" → LiteLLM → Groq
      systemPrompt: "You are Shirley's assistant...",
      tools, // buscarProducto, pedidosPendientes, etc.
    }
  })
  return result
}
```

```ts
// src/lib/agent/tools.ts
import { tool } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"

export const buscarProducto = tool({
  name: "buscarProducto",
  description: "Search jewelry by name in the Nénufar catalog",
  inputSchema: z.object({ query: z.string() }),
  handler: async ({ query }, { payload }) => {
    return payload.find({ collection: 'products', where: { title: { contains: query } } })
  }
})
```

---

## 5. How to deploy to Production with the Claude Agent SDK?

You have **3 options**. Nénufar recommends **Option A** (cheapest, same as dev).

### Option A — Everything on one server (recommended for Nénufar)

If you deploy on a VPS / Railway / Fly.io / Render with Docker:

```
Vercel/Next.js (Nénufar)  ──┐
                            ├──► Same docker-compose.yml
LiteLLM :4000 ──────────────┘    postgres:5432
```

`docker-compose.yml` in production:

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, litellm]

  postgres:
    image: postgres:16
    volumes: [postgres_data:/var/lib/postgresql/data]

  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    ports: ["4000:4000"]
    volumes: ["./litellm/config.yaml:/app/config.yaml"]
    command: ["--config", "/app/config.yaml"]
    env_file: .env
```

`.env` in production (e.g. Railway):
```env
DATABASE_URL=postgres://...
ANTHROPIC_BASE_URL=http://litellm:4000   # inside Docker, not localhost
ANTHROPIC_AUTH_TOKEN=sk-litellm-prod-key
ANTHROPIC_MODEL=nenufar-bot
GROQ_API_KEY=gsk_...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
TELEGRAM_ADMIN_CHAT_ID=...
```

Webhook: `pnpm tsx scripts/set-telegram-webhook.ts https://your-domain.com/telegram/webhook`

**Pros:** same code as local. No extra cost (LiteLLM ~50MB).

### Option B — Vercel (Next.js) + external LiteLLM

If Nénufar is on Vercel (serverless), you cannot run LiteLLM there (Vercel doesn't run sidecars). You need to host LiteLLM separately:

- **LiteLLM Cloud** (hosted by LiteLLM, paid)
- **Fly.io / Railway cheap instance** for LiteLLM only (~$5/mo)
- Or **direct without LiteLLM**: switch the SDK to native Groq if the SDK allows it in the future (not today, hence the proxy).

```
Vercel (Next.js) ──HTTPS──► LiteLLM on Fly.io ──► Groq
```

In Vercel env:
```env
ANTHROPIC_BASE_URL=https://your-litellm.fly.dev
```

Cons: extra latency + another service to monitor.

### Option C — No LiteLLM, pay Claude directly (when you scale)

If volume grows and Llama is not enough:

```env
# Remove LiteLLM, point directly to Anthropic
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_AUTH_TOKEN=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

Zero extra infra, but ~$3 per 1M tokens. For Shirley's usage (50 messages/day) that's ~$2-5/mo.

### Production checklist (any option)

1. `docker-compose up -d` (postgres + litellm)
2. `pnpm build && pnpm start` (Next.js on :3000)
3. `pnpm tsx scripts/set-telegram-webhook.ts https://your-domain.com/telegram/webhook`
4. Test: from Shirley's chat `what pending orders do I have?` → should call `pedidosPendientes` → real reply. From another chat_id → `200 OK` ignored.
5. Check LiteLLM logs: should show `Anthropic → Groq translation OK` without `output_config` errors.
6. Monitoring: if Groq fails, LiteLLM can fallback to another model (configure `fallbacks: [groq/..., openai/...]`).

### When to use which?

| Case | Recommendation |
|---|---|
| Today, Shirley alone, ~50 msgs/day | **Option A** with free Groq |
| Vercel without Docker | Option B (LiteLLM on Fly.io) |
| >500 msgs/day or need stronger reasoning | Option C (paid Claude) |

---

## 6. One-line summary

| Term | In one sentence |
|---|---|
| **Tool Calling** | The LLM asks to execute your function and you return the result so it can answer. |
| **LiteLLM** | Proxy that translates between LLM formats (Anthropic ↔ OpenAI). |
| **Universal Gateway** | LiteLLM as adapter: switch from Groq to Claude to GPT without changing code. |
| **Claude Agent SDK** | Anthropic's official framework that saves you from hand-writing the Tool Calling loop. |
| **Groq** | Fast, free server to run Llama 3.3. |

---

*Related: `docs/SDD.md §2.3`, `docs/HANDOFF-agent-sdk-migration.md`, `docs/SKILLS.md`*
