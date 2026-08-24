# IP-003: Catalog & Landing Page Modular Blocks Subsystem

> **Autonomous Agent Implementation Document**  
> **Date:** 2026-08-24  
> **Status:** In Progress  
> **Branch:** `feature/catalog/modular-blocks`  
> **Worktree:** `/home/ale/Work/nenufar-catalog`  
> **Related specifications:**  
> - [`docs/specs/SPEC-003-catalog-landing-blocks.md`](file:///home/ale/Work/nenufar/docs/specs/SPEC-003-catalog-landing-blocks.md)  
> - [`docs/specs/PRD.md`](file:///home/ale/Work/nenufar/docs/specs/PRD.md)  
> - [`CONSTITUTION.md`](file:///home/ale/Work/nenufar/CONSTITUTION.md) (Articles I, IV, VI)  
> - [`docs/adr/ADR-003-payload-embedded-monolith-local-api.md`](file:///home/ale/Work/nenufar/docs/adr/ADR-003-payload-embedded-monolith-local-api.md)  

---

## 1. Executive Summary and Objective

Deliver the complete modular landing page (`/`) and artisan catalog experience (`/shop`). Decouple `/` from `/shop` so that the root route renders Shirley's CMS-managed modular blocks (`RenderHero`, `RenderBlocks`, `Carousel`, `ThreeItemGrid`, `UpcomingEvents`, `Banner`), while `/shop` provides the search, filtering, and Masonry grid catalog.

### Hard Constraints (Constitution):
1. **Article IV § 1 & 2:** Embedded monolith architecture invoking Payload Local API.
2. **Article VI § 1:** User-Facing Layer strictly in Spanish (`es-CO`), technical code/comments in English.
3. **Article VI § 2:** Currency formatted as COP (`$ 45.000`), never render literal `"COP"` suffix in UI.
4. **Article VI § 3:** Brand styling using `--brand: oklch(38% 0.2 307deg)` (`#6A1B9A`).

---

## 2. Detailed Task Breakdown (Vertical Slices)

### 🔹 Phase 1: Landing Page Architecture Decoupling
* **Task 1.1:** Refactor `src/app/(app)/page.tsx` to render the modular Home page via `RenderHero` and `RenderBlocks` (with resilient fallback to `homeStaticData()`), allowing editors to visually customize the landing from `/admin`.
* **Task 1.2:** Verify `/shop` maintains the complete catalog search, filter, pagination, and Masonry grid.

### 🔹 Phase 2: Modular Block Components & Brand Styling
* **Task 2.1:** Verify and polish `src/blocks/Carousel/Component.client.tsx`, `src/blocks/ThreeItemGrid/Component.tsx`, and `src/blocks/UpcomingEvents/Component.tsx` with proper brand tokens and COP price formatting.
* **Task 2.2:** Update `src/endpoints/seed/home-static.ts` with artisan jewelry content and Cartagena pop-up fairs.

### 🔹 Phase 3: Verification & Integration Tests
* **Task 3.1:** Create `tests/int/landing-blocks.int.spec.ts` to verify landing page block querying, COP currency formatting rules, and fallback stability.
* **Task 3.2:** Execute full test suite `pnpm test:int` and verify quality gates.

---

## 3. Definition of Done (DoD)
- [ ] Root page `/` renders modular CMS blocks (`RenderHero` + `RenderBlocks`).
- [ ] `/shop` renders full catalog with search and Masonry layout.
- [ ] No literal `"COP"` suffixes in rendered prices.
- [ ] Integration tests passing (`pnpm test:int`).
- [ ] `tasks/plan.md` and `tasks/todo.md` updated.
