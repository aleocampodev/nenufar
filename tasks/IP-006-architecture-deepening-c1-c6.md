# IP-006: Architecture Deepening (C1–C6)

> **Autonomous Agent Implementation Document**
> **Date:** 2026-09-24
> **Status:** In Progress
> **Branch:** `feature/architecture-deepening-c1-c6`
> **Source:** Architecture review 2026-09-23 (`/tmp/architecture-review-20260923-222440.html`,
> Archify diagram `/tmp/nenufar-auditoria-arquitectura.html`)
> **Related:** [`docs/adr/ADR-001`](../docs/adr/ADR-001-no-payment-gateway-human-closing.md),
> [`docs/adr/ADR-002`](../docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md),
> [`docs/adr/ADR-003`](../docs/adr/ADR-003-payload-embedded-monolith-local-api.md),
> [`CONSTITUTION.md`](../CONSTITUTION.md) (Articles I–VI)

---

## 1. Objective

Turn six shallow modules into deep ones. Each slice puts behavior behind one
small interface, at an in-process seam, testable through that interface. No ADR
is relitigated: every seam stays in-process with locally substitutable adapters
(ADR-003), the order flow keeps Telegram notification + WhatsApp closing
(ADR-001), and the agent keeps SDK + LiteLLM + Groq (ADR-002).

### Hard constraints (Constitution)

1. **Art VI:** user-facing strings in Spanish (`es-CO`); code, comments, commits, IPs in English.
2. **Art VI:** currency as `$ 45.000`, never the literal `COP` in UI/Telegram strings.
3. **Art V:** Ley 1581 consent stays; single-admin webhook guard stays; 5-min SHA256 idempotency stays.
4. **Art III:** no direct push/merge to `main`; integrate via PR only on explicit request.
5. **Never** call paid Anthropic/OpenAI APIs; tests mock `query()` (existing pattern).

---

## 2. Execution order

S1 (mechanical) → S2 (top value) → S3 → S4 → S5 → S6 → S7 (docs).
Slices touch disjoint files except S3/S6 (both touch `runShirleyAgent.ts`
internals vs. its caller — sequential, safe).

---

## 3. Slices

### S1 — Collapse duplicate tool registry + small cuts (C3)

**Files:** `src/lib/agent/tools.ts`, `tests/int/agent-tools.int.spec.ts`,
`scripts/test-shirley-agent.ts`, `src/lib/agent/nenufarMcp.ts`,
`src/lib/agent/runShirleyAgent.ts`, `src/lib/order-formatter.ts`,
`scripts/sync-home-gallery.ts` (delete), `package.json` (check script refs).

**Changes:**
- Delete `ANTHROPIC_SHIRLEY_TOOLS` from `tools.ts`. Keep the `ToolDefinition`
  type export only if something else imports it; otherwise remove.
- Test derives expected tool names from `SHIRLEY_TOOL_DEFINITIONS`
  (registry), so the parity assertion guards the real inventory.
- Debug script lists tools from the registry (derive any JSON-schema view
  from `inputSchema` if it needs shapes).
- TTL single-source: `confirmation.ts` owns `PENDING_TTL_MS`; `nenufarMcp.ts`
  re-exports it (no duplicate const); delete the unused const in
  `runShirleyAgent.ts` (it shadows nothing — verify no use).
- Currency single-source: export the formatter from `order-formatter.ts` and
  use it in `tools.ts`; delete the local `formatCOP`.
- Delete `scripts/sync-home-gallery.ts` after confirming no npm script
  references it.

**Tests:** existing `agent-tools` + `agent-runtime` parity suites stay green;
expected-names assertion now reads the registry (add `eliminarTestimonio` and
`consultarAlmacenamientoFotos` coverage implicitly).

### S2 — Deepen the order submission pipeline (C2, top recommendation)

**Files:** new `src/lib/order-pipeline.ts`, `src/app/(app)/pedidos/enviar/submitOrderAction.ts`
(thin adapter), new `tests/int/order-pipeline.int.spec.ts`.

**Interface (seam):**
`submitOrder(input: OrderInput, ports: OrderPorts) -> Promise<OrderOutcome>`
where `OrderInput` is plain data (buyerName, buyerContact, cartId, note, modo,
personalizacion, consent) and `OrderPorts` = `{ carts, orders, inventory,
notifier }` (cart reader, order writer, inventory writer, order notifier).
`OrderOutcome` = `{ type: 'ok', orderId } | { type: 'okWarn', orderId }`
(Telegram failed, order safe) `| { type: 'duplicate', orderId } | { type: 'error', message }`.

**Rules:** the server action keeps FormData parsing, cookies, and `redirect`;
all ordering/failure policy (L1+L2 idempotency via ports, stock verify +
decrement, Telegram-down `warn=1` path, cart note + purchased flag) lives in
the pipeline. Pure leaves (`consent`, `contact-validation`, `idempotency`,
`order-formatter`) are called inside the pipeline, unchanged.

**Tests (fake ports, no Next/Payload runtime):** Telegram down → `okWarn` +
order exists; duplicate → `duplicate` + redirect target id; stock exhausted →
`error`, no order written; happy path → `ok`.

### S3 — Deepen the Telegram ingress module (C1)

**Files:** new `src/lib/telegram-ingress.ts`, `src/app/(app)/telegram/webhook/route.ts`
(thin adapter), new `tests/int/telegram-ingress.int.spec.ts`.

**Interface (seam):** `handleTelegramUpdate(update, deps) -> IngressDecision`
with `deps = { isAuthorized, transcribe, media, agent }` (admin check, voice
transcription, media download+Media persist, agent turn + reply). The module
owns: `update_id` dedupe, burst-fusion queue, single shared media-download
path (photo/video/document collapse), typing+reply loop with the warm fallback.

**Rules:** route keeps secret check, JSON parse, and `Response` mapping only.
No behavior change for Shirley: fusion window, MAX_DRAINS, and fallback copy
stay identical. Module-level state moves into a factory
(`createIngressState()`) so tests get a fresh instance per case.

**Tests (fake deps):** burst fusion → one agent call; duplicate `update_id` →
no second turn; unauthorized → ignored; media failure → text turn still runs.

### S4 — Deepen the gallery taxonomy module (C4)

**Files:** new `src/lib/gallery.ts`, `src/lib/agent/tools.ts` (gallery cases),
`src/blocks/Gallery/Component.tsx` (defaults), `src/blocks/Gallery/config.ts`
(help text), new `tests/int/gallery.int.spec.ts`.

**Interface (seam):** taxonomy = stable ids `clientas | ferias | premios |
shirley` with titles (`Mis Premios`, not `Talleres de Tejido`); module exposes
`routeCategoryToTabId(category)`, `listTabs/getTab`, and layout ops
`addPhoto/removePhoto/listPhotos(payload, …)` over the home-page gallery block.
The `Todas las Fotos` aggregate stays a view concern of the block.

**Rules:** agent tools, block defaults, and config help text all consume the
module; the ~80-line duplicated layout mutation in add/delete collapses into
the module. No photo misfiles on rename.

**Tests (pure + fake payload docs):** `premios` routes to `Mis Premios`;
unknown category behavior pinned; add/remove round-trip on a fixture layout.

### S5 — Unify the events feed precedence (C6)

**Files:** new `src/lib/events.ts`, `src/blocks/UpcomingEvents/Component.tsx`,
`src/lib/agent/tools.ts` (`listarEventos` case), `src/app/(app)/eventos/page.tsx`,
new `tests/int/events.int.spec.ts`.

**Interface (seam):** `listUpcoming(sources?) -> Promise<EventItem[]>` with
substitutable sources `{ calendar?, store?, fallback? }` (Google Calendar
adapter, Payload adapter, static fallback). Precedence (calendar → store →
block/static) and `es-CO` formatting + tipo labels live in the module.

**Rules:** block, bot tool, and `/eventos` consume it; the sync route keeps its
thin shape. All three surfaces agree on the same week.

**Tests (fake sources):** precedence order pinned; empty-all → static fallback;
formatting labels pinned.

### S6 — Deepen the agent run-policy module (C5)

**Files:** new `src/lib/agent/run-policy.ts`, `src/lib/agent/runShirleyAgent.ts`
(calls policy, keeps SDK loop), new `tests/int/run-policy.int.spec.ts`.

**Interface (seam):** `createRunPolicy({ now, getUsage, failures })` →
`decide() -> 'admit' | 'lite' | 'park' | 'circuit-busy'` plus park-alert
dedupe. Mirrors `createConfirmationService(store, now, ttl)`.

**Rules:** thresholds (`150K/190K`, 3 failures, 5-min breaker) and warm
messages move beside the policy; runner keeps query loop, history, HITL
pre-query, persistence. Module-level singletons leave the runner.

**Tests (fake clock + fake usage):** park at 190K, lite at 150K, circuit after
3 failures, one park alert per day.

### S7 — Publish diagrams to docs + README link

**Files:** `docs/diagrams/nenufar-audit.architecture.json` (spec),
`docs/auditoria-arquitectura.html` (delivered artifact), `README.md`
(link beside the existing `docs/arquitectura.html` line).

**Rules:** regenerate the Archify HTML from the final spec after S1–S6 only if
the diagram's facts changed (node labels like `0 pruebas` / line counts);
otherwise publish as-is.

---

## 4. Definition of Done

- [ ] S1–S6 implemented behind the specified seams; adapters thin.
- [ ] New suites: `order-pipeline`, `telegram-ingress`, `gallery`, `events`,
  `run-policy` — all green; full `pnpm test:int` green (no regressions).
- [ ] `pnpm lint` clean; `pnpm build` passes.
- [ ] No behavior change for the buyer flow or Shirley's bot (same messages,
  same windows, same fallbacks) — refactors only, except S1 deletions.
- [ ] Fresh `sol-review` verdict `ship` before reporting done.
- [ ] No commit/push without explicit user request (Art III).
