# Design — Knowledge (RAG) + Conversation Memory on Supabase
**Project:** Nénufar — Handcrafted Jewelry Store
**Phases:** 3.3 (knowledge RAG) + 4.0 (conversation memory)
**Status:** Design — not yet implemented
**Audience:** Developers continuing the agent work

> This document extends the v3.2 agent system (see `SDD.md §2.3` and
> `.claude/HANDOFF-agents.md`). It describes how semantic knowledge search (RAG) and
> multi-turn conversation memory are added on top of **Supabase**, keeping the project
> free, mostly local, and — crucially — keeping Supabase from becoming a dumping ground.

---

## 1. Guiding principle — Supabase is a derived index, never the source

The single most important rule of this design:

> **Supabase holds only what can be regenerated.** The canonical knowledge lives in
> **Markdown files (git)** and **Payload** (products). Supabase stores a *derived* vector
> index of that knowledge plus a *bounded* conversation memory. Wipe Supabase, re-run the
> ingest, and everything comes back. Nothing precious or unique ever lives only in
> Supabase.

This is what prevents "filling Supabase dumbly": we never dump raw, un-curated, or
un-regenerable data into it.

```
SOURCE OF TRUTH (curated, in git / Payload)
├── knowledge/*.md        ← Nénufar's essence, policies, care, FAQ   (Markdown, human-written)
└── Payload                ← products (price, stock, variants)

        │  ingest = chunk + embed        (regenerable, idempotent)
        ▼
DERIVED INDEX (Supabase · pgvector)       ← disposable; rebuilt from the sources
└── rag.chunks              ← embedded pieces of BOTH the .md files AND the products

CONVERSATION MEMORY (Supabase · lean)
└── rag.conversation_messages  ← short window + rolling summary, not raw-forever
```

---

## 2. Context, goals & audience

The v3.2 bot is **Shirley's management tool only** — buyers never talk to it (see
`SDD.md §2.3`). Everything below serves **Shirley**.

- **Knowledge RAG (3.3):** one semantic search over two kinds of knowledge:
  - **Catalog** — *"the emerald ring from last week"* → finds the product even without an
    exact title match.
  - **Brand knowledge** — *"do we ship to Medellín?"*, *"how do I care for silver?"* →
    answers from the curated Markdown, not from products.
- **Conversation memory (4.0):** multi-turn exchanges — *"show my pending orders"* →
  *"confirm the first one"* — where the bot remembers what "the first one" is.

**Non-goals:** a buyer-facing assistant, a web chat widget, or any Chat SDK / Vercel AI
SDK (explicitly out of scope — see `README.md`).

### Cost — everything is free

| Piece | Cost | Notes |
|-------|------|-------|
| Supabase | $0 | Free tier: 500 MB DB, `pgvector` included. Usage here is < 10 MB. |
| Embeddings | $0 | Transformers.js runs **locally** in the Node process. No API, no key. |
| Generation | $0 | Groq free tier (rate-limited but free). |

Supabase Cloud free tier pauses a project after 7 days of inactivity (one click to
restore). For local dev, **Supabase local** (`supabase start`, Docker) is fully offline.

---

## 3. Knowledge sources (the source of truth)

### 3.1 Brand knowledge — `knowledge/*.md`

Curated, human-written Markdown lives in the repo (git-versioned, reviewable in PRs).
This is the "essence and important topics" of Nénufar — the durable knowledge that is
**not** product data.

```
knowledge/
├── brand-essence.md    # who Nénufar is: story, tone of voice, values
├── policies.md         # shipping, payments (Nequi / transfer / cash), exchanges
├── care.md             # how to care for silver / emerald / coral pieces
└── faq.md              # frequently asked questions
```

Each file uses `##` headings so the ingester can split on sections (see §5.2). A short
YAML front-matter (`title`, `topic`, `updated`) helps tag chunks with metadata.

> **Why Markdown and not a Supabase table?** Because this content is *authored and
> curated*, not generated. Keeping it in git makes it reviewable, diffable, and the source
> of truth. Supabase only ever holds a rebuildable embedding of it.

### 3.2 Catalog — Payload `products`

Product facts (title, description, price, stock, variants) stay in Payload as today.
Payload remains the source of truth for the catalog; Supabase indexes a text projection of
each published product.

---

## 4. Database topology & schema

**One Supabase Postgres holds everything** (unified — "Option A"). Payload's database
moves to Supabase; the AI tables live in a dedicated `rag` schema in the **same** database.
One `DATABASE_URL`.

```
Supabase Postgres (free tier / local)
├── public/                     ← Payload-managed (Drizzle)
│   ├── products · orders · users …
└── rag/                        ← managed by hand (SQL migrations, Payload-agnostic)
    ├── chunks                  (embedding vector(384); source = product | knowledge)
    └── conversation_messages   (chat_id, role, content, kind, created_at)
```

Payload owns `public`; it never sees `rag`. The `rag` tables are created with plain SQL
(Supabase migrations), kept in a **separate schema** so Payload's `push: true` in dev never
touches them.

```sql
create schema if not exists rag;
create extension if not exists vector;   -- pgvector

-- 4.1 Unified knowledge index — products AND markdown, one retrieval surface
create table rag.chunks (
  id           bigint generated always as identity primary key,
  source_type  text  not null check (source_type in ('product','knowledge')),
  source_id    text  not null,           -- product id (as text) OR "policies.md#shipping"
  content      text  not null,           -- the exact text that was embedded
  embedding    vector(384) not null,     -- multilingual-e5-small
  metadata     jsonb not null default '{}',  -- {title, topic, price, slug, …}
  updated_at   timestamptz not null default now(),
  unique (source_type, source_id)
);

create index on rag.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on rag.chunks (source_type, source_id);

-- 4.2 Conversation memory
create table rag.conversation_messages (
  id         bigint generated always as identity primary key,
  chat_id    bigint not null,            -- Telegram chat id (Shirley's, in practice)
  role       text   not null check (role in ('user','assistant')),
  kind       text   not null default 'turn' check (kind in ('turn','summary')),
  content    text   not null,
  created_at timestamptz not null default now()
);

create index on rag.conversation_messages (chat_id, created_at desc);
```

**One table for both knowledge kinds** means a single vector query can return the best
matches across products *and* brand knowledge. The `source_type` + `metadata` tell the
agent whether it found a product (attach price/stock from Payload) or a knowledge paragraph
(quote it).

> **Deletion:** with a unified table we don't use a DB foreign key; instead the ingesters
> are **idempotent** — re-indexing a product or a Markdown section deletes its old chunk(s)
> by `(source_type, source_id)` and inserts fresh ones. A product `afterDelete` hook
> removes its chunks the same way.

Connection notes (Supabase): app runtime uses the **transaction pooler** (`:6543`);
`pnpm payload migrate` needs a **direct** connection (`:5432`) — keep both as
`DATABASE_URL` and `DIRECT_DATABASE_URL`.

---

## 5. Knowledge RAG

### 5.1 Embeddings — local, free

- **Library:** `@huggingface/transformers` (Transformers.js).
- **Model:** `Xenova/multilingual-e5-small` — 384-d, multilingual (handles Spanish),
  ~120 MB downloaded once, then cached; loaded as a singleton.
- **E5 prefix convention (important):** documents use `"passage: <text>"`, queries use
  `"query: <text>"`. Mixing them quietly degrades retrieval.

```ts
// src/lib/embeddings.ts
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'

let extractor: FeatureExtractionPipeline | null = null
const get = async () =>
  (extractor ??= await pipeline('feature-extraction', 'Xenova/multilingual-e5-small'))

/** 384-d unit vector. `kind` selects the required e5 prefix. */
export async function embed(text: string, kind: 'passage' | 'query'): Promise<number[]> {
  const model = await get()
  const out = await model(`${kind}: ${text}`, { pooling: 'mean', normalize: true })
  return Array.from(out.data as Float32Array)
}
```

### 5.2 Ingestion (write path) — two idempotent ingesters

Both write into the same `rag.chunks`; both are idempotent (delete-then-insert by
`source_id`), so re-running is always safe and never duplicates.

**Products** — Payload `afterChange` / `afterDelete` hook on `Products`:
```
product published/updated
  → buildProductText(product)          # title + description + category + variants + price
  → embed(text, 'passage')
  → upsert rag.chunks (source_type='product', source_id=<id>, metadata={price,slug,stock})
product deleted → delete rag.chunks where source_type='product' and source_id=<id>
```

**Brand knowledge** — a script that reads `knowledge/*.md`, run on demand (and optionally
as a build step or a file-watch in dev):
```
for each knowledge/*.md
  → split on '##' headings into sections
  → for each section: embed(section, 'passage')
  → upsert rag.chunks (source_type='knowledge', source_id='<file>#<slug>', metadata={title,topic})
  → delete any chunks for that file whose section no longer exists (idempotent sync)
```

Only **published** products are indexed; drafts are skipped.

### 5.3 Retrieval (read path)

Used by the catalog/knowledge skill(s). One embedding, one query, both kinds:

```
Shirley's message
  → embed(message, 'query')
  → SELECT source_type, source_id, content, metadata,
           1 - (embedding <=> $1) AS score
      FROM rag.chunks
     ORDER BY embedding <=> $1
     LIMIT $2                    -- k, e.g. 5
  → keep rows above a score threshold
  → for source_type='product': load canonical price/stock from Payload by id
    for source_type='knowledge': use the section text directly
  → Groq composes the reply for Shirley from the retrieved context
```

Product facts (price, stock) always come from **Payload**, never from the chunk text — the
chunk is only the retrieval surface; Payload is the source of truth.

---

## 6. Conversation memory (lean, with hygiene)

Store memory in Supabase, but **never as a raw ever-growing log**. Three hygiene rules keep
it small and meaningful:

1. **Short window.** Only the last N turns (e.g. 10) — or last ~30 min — are read and sent
   to Groq. That is what resolves *"confirm the first one"* against the previous turns.

2. **Rolling summary.** When the raw turns for a `chat_id` exceed a threshold (e.g. 40),
   summarize the oldest ones into a single `kind='summary'` row (via Groq) and delete the
   raw turns they covered. Context survives; row count stays bounded.

3. **Selective persistence (optional).** Skip trivial/duplicate turns; always keep turns
   that changed state (confirmed an order, updated stock) since those carry the useful
   thread.

```
POST /telegram/webhook (Shirley)
  → history = getContext(chatId)         # rolling summary (if any) + last N turns
  → routeAndRun(message, { history })    # history injected into the Groq messages array
  → appendTurn(chatId, 'user', message)
  → appendTurn(chatId, 'assistant', reply)
  → maybeSummarize(chatId)               # if over threshold: summarize old → delete raw
```

**What memory is NOT:** it is not the brand knowledge base. Durable facts about Nénufar
belong in `knowledge/*.md` (§3.1), not in conversation memory. Memory only holds the
*recent thread of a conversation*.

> **Long-term semantic memory** (embedding past messages for similarity recall) is possible
> with the same `pgvector` but is out of scope — overkill for a single-user admin bot.

---

## 7. Integration with existing code

| Existing file | Change |
|---------------|--------|
| `src/app/(app)/telegram/webhook/route.ts` | Load memory before `routeAndRun`; append turns + `maybeSummarize` after. |
| `src/lib/agents/orchestrator.ts` | Accept `history` in the context; pass it to Groq. |
| `src/lib/agents/skills/buscarProductos.ts` | Replace `like` query with `vectorStore.search` over `rag.chunks`. |

| New file / path | Responsibility |
|-----------------|----------------|
| `knowledge/*.md` | Curated brand knowledge (essence, policies, care, FAQ) — source of truth. |
| `src/lib/embeddings.ts` | Local Transformers.js embedder (singleton). |
| `src/lib/vectorStore.ts` | Upsert / delete / search over `rag.chunks`. |
| `src/lib/memory.ts` | `getContext`, `appendTurn`, `maybeSummarize`, prune. |
| `src/hooks/products/indexProduct.ts` | Payload `afterChange` / `afterDelete` indexing. |
| `scripts/ingest-knowledge.ts` | Chunk + embed `knowledge/*.md` into `rag.chunks`. |
| `scripts/reindex-all.ts` | One-off full rebuild (products + knowledge) from the sources. |
| `supabase/migrations/*.sql` | `rag` schema, `vector` extension, tables, indexes. |

Use a small dedicated `pg` pool for the `rag` schema, independent of Payload's Drizzle
instance.

---

## 8. Environment variables (additions)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Supabase Postgres — **transaction pooler** (`:6543`) for the app runtime. |
| `DIRECT_DATABASE_URL` | ✅ | Supabase **direct/session** connection (`:5432`) for `pnpm payload migrate`. |
| `EMBEDDINGS_MODEL` | ⬜ | Override the default `Xenova/multilingual-e5-small`. |

No `SUPABASE_URL` / service-role keys are needed: the app talks to Postgres directly over
`DATABASE_URL`.

---

## 9. Setup (dev → prod)

```bash
# Local dev (offline, free)
supabase start                         # Postgres + studio via Supabase CLI
supabase migration up                  # apply the rag schema
pnpm payload migrate                   # point Payload at Supabase, migrate public schema
pnpm tsx scripts/ingest-knowledge.ts   # embed knowledge/*.md into rag.chunks
pnpm tsx scripts/reindex-all.ts        # backfill product chunks (one-off)
```

**Production:** create a Supabase Cloud project (free), set `DATABASE_URL` /
`DIRECT_DATABASE_URL`, run the same migrations + ingest.

---

## 10. Dependencies

| Package | Purpose |
|---------|---------|
| `@huggingface/transformers` | Local embeddings (Transformers.js). |
| `pg` | Direct SQL to the `rag` schema (pool). |
| `pgvector` (Postgres extension) | Vector column + ANN index — enabled via SQL. |
| Supabase CLI (tool) | Local Supabase + migrations. |

---

## 11. Phasing

1. **3.3a — Foundation.** `rag` schema, `embeddings.ts`, `vectorStore.ts`,
   `ingest-knowledge.ts`, `reindex-all.ts`. Author the first `knowledge/*.md`. Verify
   search quality from a test harness (products + knowledge).
2. **3.3b — Live indexing.** Product `afterChange` / `afterDelete` hooks; swap
   `buscarProducto` to unified vector search.
3. **4.0 — Lean memory.** `memory.ts` (window + rolling summary) wired into the webhook
   and orchestrator.

Each phase is independently shippable and testable (mock Groq + Telegram at the boundary,
like the existing `agents.int.spec.ts`).

---

## 12. Risks & open questions

- **Keep Supabase derivable.** Never let unique data accumulate only in `rag.*`. If a fact
  matters, it belongs in `knowledge/*.md` or Payload, and Supabase re-derives it.
- **Payload DB migration.** Moving Payload to Supabase is a real migration; do it in dev
  (low data volume) to keep it cheap.
- **`source_id` for products.** Store the Payload id as text; confirm the id type.
- **Pooler vs. migrations.** Payload DDL needs the direct connection, not the pooler.
- **Summary quality.** The rolling summary is generated by Groq; keep it short and factual,
  and always keep the last N raw turns alongside it.
- **ivfflat tuning.** For a small corpus an exact scan is fine; tune `lists`/`probes` once
  there are enough rows.
