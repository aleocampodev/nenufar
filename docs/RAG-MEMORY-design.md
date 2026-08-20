# Design — Catalog RAG + Conversation Memory on Supabase
**Project:** Nénufar — Handcrafted Jewelry Store
**Phases:** 3.3 (catalog RAG) + 4.0 (conversation memory)
**Status:** Design — not yet implemented
**Audience:** Developers continuing the agent work

> This document extends the v3.2 agent system (see `SDD.md §2.3` and
> `.claude/HANDOFF-agents.md`). It describes how semantic catalog search (RAG) and
> multi-turn conversation memory are added on top of **Supabase**, keeping the
> project free and mostly local.

---

## 1. Context & Goals

The v3.2 bot is **Shirley's management tool only** — buyers never talk to it (see
`SDD.md §2.3`). So both features below serve **Shirley**, not buyers:

- **Catalog RAG (3.3):** today `buscarProductos` matches product titles with a `like`
  query. RAG upgrades it to **semantic search** so Shirley can say *"the emerald ring
  from last week"* or *"the silver piece with the engraving"* and the bot finds it even
  without an exact title match.
- **Conversation memory (4.0):** today every webhook message is stateless. Memory lets
  Shirley have **multi-turn** exchanges — *"show my pending orders"* → *"confirm the
  first one"* — where the bot remembers what "the first one" refers to.

**Non-goals:** a buyer-facing assistant, a web chat widget, or any Chat SDK / Vercel AI
SDK (explicitly out of scope — see the product decisions in `README.md`).

### Cost — everything is free

| Piece | Cost | Notes |
|-------|------|-------|
| Supabase | $0 | Free tier: 500 MB DB, `pgvector` included. Usage here is < 10 MB. |
| Embeddings | $0 | Transformers.js runs **locally** in the Node process. No API, no key. |
| Generation | $0 | Groq free tier (rate-limited but free). |

Supabase Cloud free tier pauses a project after 7 days of inactivity (one click to
restore). For local dev, **Supabase local** (`supabase start`, Docker) is fully offline.

---

## 2. Database Topology — Option A (unified)

**One Supabase Postgres holds everything.** Payload's database moves to Supabase, and the
AI tables live in a dedicated `rag` schema in the **same** database. One `DATABASE_URL`.

```
Supabase Postgres (free tier / local)
├── public/                     ← Payload-managed (Drizzle)
│   ├── products
│   ├── orders
│   ├── users …
└── rag/                        ← managed by hand (SQL migrations, Payload-agnostic)
    ├── product_chunks          (embedding vector(384), FK → public.products.id)
    └── conversation_messages   (chat_id, role, content, created_at)
```

**Why unified over a separate vector DB:**
- One connection string, one database to back up.
- `rag.product_chunks` can hold a **real foreign key** to `public.products` with
  `ON DELETE CASCADE` — deleting a product removes its chunks automatically.
- No `product_id` synchronization between two databases.
- Still $0.

**Schema ownership boundary:** Payload owns `public`; it never sees or manages `rag`.
Payload's Postgres adapter leaves unknown schemas untouched, but we keep `rag` in a
**separate schema** (not `public`) so `push: true` in dev never interferes with it. The
`rag` tables are created and migrated with **plain SQL** (Supabase migrations), not
through Payload.

### Connection notes (Supabase specifics)

- **Runtime** app connection → Supabase **transaction pooler** (pgBouncer, port `6543`).
- **Payload migrations** need a **direct/session** connection (port `5432`) — pooled
  transaction mode does not support the DDL Payload runs. Keep a `DIRECT_DATABASE_URL`
  for `pnpm payload migrate`.

---

## 3. Schema (`rag` schema, raw SQL)

```sql
-- once per database
create schema if not exists rag;
create extension if not exists vector;   -- pgvector

-- 3.1 Catalog chunks (RAG)
create table rag.product_chunks (
  id          bigint generated always as identity primary key,
  product_id  integer not null
              references public.products(id) on delete cascade,
  chunk_index smallint not null default 0,
  content     text not null,             -- the text that was embedded
  embedding   vector(384) not null,      -- multilingual-e5-small
  metadata    jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  unique (product_id, chunk_index)
);

-- Approximate-NN index (cosine). Build after some rows exist.
create index on rag.product_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 3.2 Conversation memory
create table rag.conversation_messages (
  id         bigint generated always as identity primary key,
  chat_id    bigint not null,            -- Telegram chat id (Shirley's, in practice)
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

create index on rag.conversation_messages (chat_id, created_at desc);
```

> `product_id` is `integer` to match Payload's default numeric IDs. Confirm the actual
> column type in the generated Payload schema before applying.

---

## 4. Embeddings — local, free

- **Library:** `@huggingface/transformers` (Transformers.js).
- **Model:** `Xenova/multilingual-e5-small` — 384 dimensions, multilingual (handles
  Spanish product data), small footprint (~120 MB, downloaded once, then cached).
- **E5 prefix convention (important):** e5 models expect a task prefix.
  - Documents (chunks): `"passage: <text>"`
  - Queries: `"query: <text>"`
  Mixing these up quietly degrades retrieval quality.
- Runs in-process; the model loads once (singleton) and is reused.

```ts
// src/lib/embeddings.ts
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'

let extractor: FeatureExtractionPipeline | null = null

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small')
  }
  return extractor
}

/** Returns a 384-d unit vector. `kind` selects the required e5 prefix. */
export async function embed(text: string, kind: 'passage' | 'query'): Promise<number[]> {
  const model = await getExtractor()
  const output = await model(`${kind}: ${text}`, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}
```

> **Alternative (documented, not chosen):** Supabase Edge Functions expose a built-in
> `gte-small` (384-d) embedder via `Supabase.ai`. It keeps embeddings off the Node
> process but adds an Edge Function dependency. We prefer local Transformers.js to stay
> fully offline in dev. Both are free and 384-d, so the schema is compatible.

---

## 5. Catalog RAG

### 5.1 Ingestion (write path)

A Payload `afterChange` hook on the `Products` collection re-indexes a product whenever
it is created or updated; `afterDelete` cascades via the FK.

```
Product created / updated (published)
  → buildProductText(product)         // title + description + category + variants + price
  → chunk(text)                       // small products = 1 chunk; long descriptions split
  → embed(chunk, 'passage')           // local, 384-d
  → upsert into rag.product_chunks     // delete old chunks for product_id, insert new
```

- Only index **published** products; skip drafts.
- Re-index replaces all chunks for that `product_id` (delete-then-insert) so stale text
  never lingers.
- Embedding happens off the request's critical path where possible; a failed index is
  logged, not fatal (same philosophy as the Telegram send).

Files:
- `src/lib/vectorStore.ts` — `upsertProductChunks(productId, chunks)`, `deleteProductChunks(productId)`, `searchProducts(queryEmbedding, k)`.
- `src/hooks/products/indexProduct.ts` — the `afterChange` / `afterDelete` hooks.

### 5.2 Retrieval (read path) — inside `buscarProducto`

```
Shirley: "the emerald ring from last week"
  → embed(query, 'query')
  → SELECT product_id, content,
           1 - (embedding <=> $1) AS score
      FROM rag.product_chunks
     ORDER BY embedding <=> $1
     LIMIT $2            -- k, e.g. 5
  → keep rows above a score threshold
  → load canonical product data from Payload (price, stock, slug) by product_id
  → return to the agent → Groq composes the reply for Shirley
```

- `<=>` is pgvector's cosine distance; `1 - distance` is a readable similarity score.
- Always resolve final product facts (price, stock) from **Payload**, not from the chunk
  text — the chunk is only the retrieval surface, Payload is the source of truth.
- The skill's tool schema is unchanged from the agent's perspective; only the
  implementation swaps `like` for vector search.

---

## 6. Conversation Memory

Two layers; only the first is in scope for phase 4.0.

### 6.1 Short-term (windowed) — in scope

Keep the last N turns per `chat_id`, load them at the start of `routeAndRun`, and pass
them to Groq as prior messages.

```
POST /telegram/webhook (Shirley)
  → getRecentTurns(chatId, n = 10)      // rag.conversation_messages, newest N, chronological
  → routeAndRun(message, { history })   // history injected into the Groq messages array
  → appendTurn(chatId, 'user', message)
  → appendTurn(chatId, 'assistant', reply)
  → pruneOldTurns(chatId, keep = 40)    // optional cap to bound growth
```

- Window by **count** (last ~10 turns) and/or **age** (e.g. last 30 min) — count is
  simpler and enough for a single-user admin bot.
- This is what enables *"confirm the first one"* to resolve against the previous turn.

File: `src/lib/memory.ts` — `getRecentTurns`, `appendTurn`, `pruneOldTurns`.

### 6.2 Long-term (semantic) — future, optional

Embed past messages and retrieve relevant ones by similarity (reusing `pgvector`).
Overkill for a single-user admin bot today; documented as a later option only.

---

## 7. Integration with existing code

| Existing file | Change |
|---------------|--------|
| `src/app/(app)/telegram/webhook/route.ts` | Load memory before `routeAndRun`; append turns after. |
| `src/lib/agents/orchestrator.ts` | Accept `history` in the context; pass it to Groq. |
| `src/lib/agents/skills/buscarProductos.ts` | Replace `like` query with `vectorStore.searchProducts`. |

| New file | Responsibility |
|----------|----------------|
| `src/lib/embeddings.ts` | Local Transformers.js embedder (singleton). |
| `src/lib/vectorStore.ts` | Upsert / delete / search over `rag.product_chunks`. |
| `src/lib/memory.ts` | Read / append / prune `rag.conversation_messages`. |
| `src/hooks/products/indexProduct.ts` | Payload `afterChange` / `afterDelete` indexing hooks. |
| `supabase/migrations/*.sql` | `rag` schema, `vector` extension, tables, indexes. |

**DB access for the `rag` schema:** use a small dedicated `pg` pool (node-postgres) rather
than routing raw vector SQL through Payload's Drizzle instance — it keeps the vector code
independent of Payload's schema generation.

---

## 8. Environment Variables (additions)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Supabase Postgres — **transaction pooler** (`:6543`) for the app runtime. |
| `DIRECT_DATABASE_URL` | ✅ | Supabase **direct/session** connection (`:5432`) for `pnpm payload migrate`. |
| `EMBEDDINGS_MODEL` | ⬜ | Override the default `Xenova/multilingual-e5-small`. |

No `SUPABASE_URL` / service-role keys are needed: the app talks to Postgres directly over
`DATABASE_URL`. Those keys only become relevant if Supabase Edge Functions or
`supabase-js` are adopted later (see §4 alternative).

---

## 9. Setup (dev → prod)

**Local dev (offline, free):**

```bash
# 1. Start Supabase locally (Postgres + studio) via the Supabase CLI
supabase start
# → prints a local DATABASE_URL (port 54322 by default)

# 2. Apply the rag schema
supabase migration up          # or psql < supabase/migrations/xxxx_rag.sql

# 3. Point Payload at the local Supabase Postgres, then migrate
pnpm payload migrate

# 4. Backfill embeddings for existing products (one-off script)
pnpm tsx scripts/reindex-products.ts
```

**Production:** create a Supabase Cloud project (free), set `DATABASE_URL` /
`DIRECT_DATABASE_URL` from its connection settings, run the same migrations and reindex.

---

## 10. Dependencies

| Package | Purpose |
|---------|---------|
| `@huggingface/transformers` | Local embeddings (Transformers.js). |
| `pg` | Direct SQL to the `rag` schema (pool). |
| `pgvector` (Postgres extension) | Vector column + ANN index — enabled via SQL, not npm. |
| Supabase CLI (dev dependency / tool) | Local Supabase + migrations. |

---

## 11. Phasing

1. **3.3a — Schema + embeddings.** `rag` schema, `embeddings.ts`, `vectorStore.ts`, a
   one-off reindex script. Verify search quality from a test harness.
2. **3.3b — Live indexing.** Payload `afterChange` / `afterDelete` hooks; swap
   `buscarProducto` to vector search.
3. **4.0 — Windowed memory.** `memory.ts` + webhook/orchestrator wiring for multi-turn.

Each phase is independently shippable and testable (mock Groq + Telegram at the boundary,
as the existing `agents.int.spec.ts` does).

---

## 12. Risks & open questions

- **Payload DB migration.** Moving Payload from local Postgres to Supabase is a real
  migration; do it while still in dev (low data volume) to keep it cheap.
- **`product_id` type.** Confirm Payload's ID column type before writing the FK (assumed
  `integer` here).
- **Pooler vs. migrations.** Payload DDL needs the direct connection; do not run
  migrations through the transaction pooler.
- **ivfflat index tuning.** `lists` and query-time `probes` trade recall for speed; tune
  once the catalog has enough rows. For a small catalog, an exact scan is fine and the
  index can wait.
- **Free-tier pause.** Supabase Cloud free pauses after 7 days idle — fine for a learning
  project; note it for any demo.
