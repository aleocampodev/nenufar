# Skills Catalog — Shirley's Management Bot
**Project:** Nénufar — Handcrafted Jewelry Store
**Status:** Planning — one skill built (`buscarProductos`), the rest proposed
**Audience:** Developers building the agent skills

> The Telegram bot is **Shirley's tool only** (see `SDD.md §2.3`). Every skill below is an
> action Shirley triggers by writing to the bot in natural language; the orchestrator (Groq)
> interprets the message and calls the matching skill, which acts on Payload and replies to
> her. Buyers never reach any of these — the webhook only processes Shirley's `chat_id`.

---

## Conventions

- **A skill** is one tool the orchestrator can call — a function implementing the `Skill`
  interface in `src/lib/agents/skills/*.ts`, registered on an agent, with a JSON tool schema
  and an integration test (Groq + Telegram mocked, like `agents.int.spec.ts`).
- **Reads vs. writes.** Read skills answer a question. Write skills change Payload and must
  **echo a confirmation** of what changed.
- **Destructive / irreversible actions** (delete, unpublish, mark shipped) require an
  explicit confirm step before executing.
- **Source of truth stays in Payload.** Skills never invent facts (price, stock); they read
  and write the canonical data.
- **Status legend:** ✅ built · 🔜 next · 🕓 later.

Skills are grouped by what they act on: **update (catalog)**, **orders**, **landing / content**,
and **content / copywriting** (a shared helper reachable from both Telegram and the admin).
**§5 Interaction patterns** covers how any skill is triggered and disambiguated (images,
references, confirmation).

---

## 1. Update skills — catalog

Keep the catalog current from the phone, without opening `/admin`.

| Skill | Shirley says… | Action (Payload) | R/W | Status |
|-------|---------------|------------------|-----|--------|
| `buscarProducto` | "find the emerald ring" | `find` products (semantic once RAG lands) | R | ✅ built |
| `actualizarInventario` | "2 emerald rings left" | `update` product/variant `stock` | W | 🔜 next |
| `actualizarPrecio` | "the coral earrings are now 320,000" | `update` product `price` (COP) | W | 🔜 next |
| `publicarProducto` | "publish the pearl necklace" | `update` product `status` → `published` | W | 🕓 later |
| `despublicarProducto` | "hide the silver bracelet" | `update` product `status` → `draft` (confirm) | W | 🕓 later |
| `editarDescripcion` | "add 'hypoallergenic' to the studs" | `update` product `description` | W | 🕓 later |

**Notes.** `actualizarInventario` is the flagship first write — it exercises natural-language
parsing ("2 emerald rings" → product id + quantity) and a confirmation echo. Price is COP,
integer, no decimals. Publish/unpublish change catalog visibility, so treat unpublish as
destructive (confirm first).

---

## 2. Order skills

Shirley's live inbox, but interactive — query and advance orders from the chat.

| Skill | Shirley says… | Action (Payload) | R/W | Status |
|-------|---------------|------------------|-----|--------|
| `pedidosPendientes` | "what orders are pending?" | `find` orders where `status = pending` | R | 🔜 next |
| `buscarPedido` | "show order 42" / "María's order" | `find` order by id or buyer contact | R | 🔜 next |
| `confirmarPedido` | "confirm 42" | `update` order `status` → `confirmed` | W | 🔜 next |
| `marcarEnviado` | "I shipped 42" | `update` order `status` → `shipped` (confirm) | W | 🕓 later |
| `resumenDelDia` | "today's summary" | `find` today's orders → count + COP total | R | 🕓 later |

**Notes.** `pedidosPendientes` + `confirmarPedido` are the best first pair: they introduce the
`chat_id` auth guard plus the first order write. `resumenDelDia` is the "daily digest" the BRD
once listed as out of scope — now a pull skill (Shirley asks), not a scheduled push.

---

## 3. Landing / content skills

Improve the public site from the chat. The home page is a CMS page (`slug: 'home'`) built from
**layout blocks** (Hero, ThreeItemGrid, CallToAction, UpcomingEvents…); events and posts feed
dynamic blocks. These skills touch the `Pages`, `Events`, and `Posts` collections.

| Skill | Shirley says… | Action (Payload) | R/W | Status |
|-------|---------------|------------------|-----|--------|
| `destacarProducto` | "feature the emerald ring on the home" | `update` the home page's featured/grid block | W | 🔜 next |
| `publicarEvento` | "add the Cartagena fair, Dec 5" | `create` / `update` an Event (shows on `/eventos` + UpcomingEvents block) | W | 🔜 next |
| `actualizarHero` | "change the home headline to '…'" | `update` the home page Hero block text | W | 🕓 later |
| `publicarPost` | "publish a post titled '…' about '…'" | `create` a Post (Lexical) + `status` → `published` | W | 🕓 later |
| `editarBloque` | "edit the call-to-action on the home" | `update` a specific page-builder block | W | 🕓 later |

**Notes & caution.** Structured, low-risk actions come first: `destacarProducto` (swap which
product ids a block references) and `publicarEvento` (a flat, well-typed collection) are safe to
express in natural language. **Free-form block editing** (`actualizarHero`, `editarBloque`,
`publicarPost`) mutates nested Lexical / layout structures — higher risk of malformed content,
so gate these behind a preview/confirmation and treat them as later work. Prefer editing a
single field (headline text, a product-id list) over rewriting a whole block.

---

## 4. Content skills — copywriting help (two surfaces)

Help Shirley write copy that grabs: catchy captions, product descriptions, social-post ideas.
Unlike the skills above, this is a **shared capability with two doors** — the same generation
logic is reached from **Telegram** (a skill) and from the **Payload admin on the web** (a
"✨ Generate" helper next to the field she's editing). "Web" here means Shirley's admin panel,
not the storefront — buyers never see this.

| Skill / helper | Shirley does… | Produces | Surface | Status |
|----------------|---------------|----------|---------|--------|
| `generarCaption` | "a catchy caption for the emerald ring, for Instagram" · or clicks ✨ on the product | 2–3 caption options (hook + body + hashtags) | Telegram + Admin | 🔜 next |
| `generarDescripcion` | "write the catalog description for the coral studs" · or ✨ on the description field | one on-brand product description (COP-aware) | Telegram + Admin | 🕓 later |
| `ideasPost` | "give me 3 post ideas for December" | short content ideas / angles | Telegram | 🕓 later |

**Design notes.**
- **Shared logic.** A single `generateCopy(kind, subject, options)` in `src/lib/copy/*` is called
  by both the Telegram skill and the admin field component — one implementation, two entry points
  (mirrors the RAG "shared service" idea).
- **Brand voice.** Generation is grounded in `knowledge/brand-essence.md` (via the RAG knowledge
  in `docs/RAG-MEMORY-design.md`) so captions sound like **Nénufar**, not generic AI. This is a
  concrete reason that file exists.
- **Grounded in real data.** It pulls the product's facts from Payload (material, price in COP),
  so the copy is specific, never vague.
- **Web surface.** A custom Payload admin field/button ("✨ Generar") on `Products` (and later
  `Pages` / `Posts`) calls a server endpoint → `generateCopy` → fills the field for Shirley to
  edit. Same capability she gets in Telegram, where she's authoring.
- **Guardrail: drafts only.** It always returns a few **options**; Shirley picks and edits.
  Nothing auto-publishes. Output is Spanish (es-CO).

---

## 5. Interaction patterns

How a skill actually gets triggered and disambiguated. These rules apply to every skill above.

**Intent lives in the words, not in Telegram.** Telegram is only the transport — it knows nothing
about "landing" vs "product". The orchestrator (Groq) classifies the intent from Shirley's
**text or photo caption**. If the words don't carry the target, the bot **asks**; it never
guesses.

**Uploading an image (e.g. to the landing).** A bare photo doesn't say what it's for. Resolve in
this order:
1. **Caption-driven** — she sends the photo *with* a caption ("this goes in the home hero"); the
   orchestrator routes from the caption, uploads the file to Payload Media (WebP), applies it,
   then confirms.
2. **Ask** — bare photo → the bot asks "What's this photo for? (1) home hero (2) a product
   (3) blog" and continues from her answer.
3. **Context** — if she just said "let's change the hero photo" and then sends it, conversation
   memory ties them (needs phase 4.0).
   > Technical: the webhook today handles only `message.text`. Photos require handling
   > `message.photo` + `caption`, downloading via `getFile`, and uploading to Media — which is why
   > image skills (`actualizarHero`, `crearProductoDraft`) are marked 🕓 later.

**Referencing a thing (e.g. an order).** List → reference → confirm:
- **By id** — "confirm 42" → robust, works with no memory. ✅ preferred
- **By name** — "María's order" → if ambiguous, the bot asks which.
- **By position** — "the first one" → needs memory of the previous list (phase 4.0).

**Always confirm writes.** A write echoes what changed ("Order 42 → confirmed"). Destructive or
irreversible actions (unpublish, mark shipped, delete) confirm *before* executing.

**Multi-turn references need memory.** "the first one", "yesterday's", "the hero from before"
only resolve once conversation memory (phase 4.0) is in place; until then, reference by id/name.

---

## 6. Recommended build order

1. **Orders first** — `pedidosPendientes` + `confirmarPedido`. Establishes the `chat_id` auth
   guard and the first Payload write. Highest day-to-day value.
2. **Catalog update** — `actualizarInventario`, then `actualizarPrecio`. The core
   natural-language-write exercise.
3. **Landing (safe)** — `destacarProducto`, `publicarEvento`. Structured, low-risk content wins.
4. **Copy help** — `generarCaption` (Telegram first, then the admin ✨ button). High value, no
   write risk — it only drafts.
5. **Everything marked 🕓** — once the patterns (parse → confirm → write → echo) are proven.

Each skill ships independently with its own test.

---

## 7. How skills reach the CMS — direct now, official MCP later

Today the skills call Payload's **Local API** directly (`payload.find`, `payload.update`).
That is the simplest path and works now.

**Phase 3.4 — the official Payload MCP plugin.** Payload now ships an official MCP plugin,
`@payloadcms/plugin-mcp`, that exposes collections and globals as standardized MCP tools
(find / create / update / delete, configurable per operation), with **API-key auth** and
per-collection, per-operation permissions managed in the admin (**MCP → API Keys**). It targets
a **live** Payload instance over HTTP.

This means phase 3.4 does **not** require building an MCP layer from scratch — adopt the
official plugin and point the skills at typed MCP tools instead of raw Local API calls. The
migration is invisible to the agent: the skill's tool schema stays the same, only its
implementation swaps `payload.update(...)` for the MCP tool call. The plugin's per-key
permissions also give a clean way to scope what the bot may touch (e.g. read orders + update
stock, but never delete).

> References: official plugin docs — https://payloadcms.com/docs/plugins/mcp ·
> package `@payloadcms/plugin-mcp`. Community alternatives also exist
> (e.g. `ohnicholas93/payload-mcp-server` for runtime CRUD over REST), but the official plugin
> is the default choice.

---

## 8. Cross-cutting rules (every skill)

- **Auth:** the webhook processes only `TELEGRAM_ADMIN_CHAT_ID`; skills assume the caller is
  Shirley.
- **Confirm writes:** echo what changed ("Order 42 → confirmed"). Destructive actions confirm
  before executing.
- **Idempotency:** the webhook already dedupes by `update_id`; a retried message never runs a
  write twice.
- **Failure is legible:** a skill that can't act says why in plain language, never silently.
- **Tests:** mock Groq + Telegram at the boundary; assert the right skill ran with the right
  arguments and the right Payload call was made.

Related design: catalog RAG + conversation memory in `docs/RAG-MEMORY-design.md`; agent runtime
in `SDD.md §2.3` and `.claude/HANDOFF-agents.md`.
