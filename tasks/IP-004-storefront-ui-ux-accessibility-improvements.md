# IP-004: Storefront UI/UX, Accessibility and Performance Improvements

> **Autonomous Agent Implementation Document**  
> **Date:** 2026-09-05  
> **Status:** Ready for execution  
> **Branch:** `feat/storefront/audit-ui-ux-improvements`  
> **Related specifications:**  
> - [`CONSTITUTION.md`](file:///home/ale/Work/nenufar/CONSTITUTION.md) (Art. I, III, IV, VI)  
> - [`AGENTS.md`](file:///home/ale/Work/nenufar/AGENTS.md)  
> - Audit Findings from UI/UX and Frontend skills  

---

## 1. Executive Summary and Objective

Address the verified findings from the UI/UX, Accessibility, Motion, and Next.js performance audit across the three primary customer-facing surfaces: **Landing Page (`/`)**, **Galería de Autor (`/galeria`)**, and **Catálogo Editorial (`/shop`)**.

### Primary Outcomes:
1. **Catalog Touch Experience (`/shop`):** Provide immediate mobile-accessible "Agregar al Carrito" action without requiring hover state, add tactile `active:scale-[0.96]` feedback, and ensure accessible `aria-label` tags for category filters and sort controls.
2. **Gallery Accessibility & Polish (`/galeria`):** Expand mobile tab touch target height to 44px (WCAG 2.5.5 compliance), trap keyboard focus inside the fullscreen Lightbox modal, and optimize client-side image priority flags.
3. **Landing Resilience & Motion (`/`):** Ensure GSAP hero animations respect `prefers-reduced-motion: reduce`, guard the external Google Calendar fetch with a strict timeout to avoid blocking page TTFB, and optimize page caching strategy.

---

## 2. Hard Constraints & Constitution Compliance

1. **Strict Push & Branch Governance:** No push to `main` under any circumstance. All work executed on `feat/storefront/audit-ui-ux-improvements`.
2. **Bilingual Boundary (Constitution Art. VI.1):** All customer-facing UI labels, toasts, and aria-labels in Spanish (`es-CO`). All code identifiers, comments, and git commits in English.
3. **Currency & Symbol Invariant (Constitution Art. VI.2):** All Colombian peso prices formatted via `$ X.XXX` without decimals and strictly **prohibiting the literal string "COP"** in UI.
4. **Zero SaaS Cost Policy ($0/mo):** No paid third-party dependencies introduced.
5. **Dev Port Invariant:** Development server operates on **port 3002**.
6. **Pre-Existing TypeScript Exceptions:** Preserve known upstream plugin exceptions (`slug`, `paymentMethod`).

---

## 3. Detailed Task Breakdown

### 🔹 Phase 1: Catalog Editorial Polish & Mobile Conversion (`/shop`)

#### Task 1.1: Mobile Quick Add-to-Cart Action in `KraftiProductTile.tsx`
- **File:** `src/components/ProductCard/KraftiProductTile.tsx`
- **Change:**
  - Add a dedicated mobile quick-add button (`sm:hidden`) visible on touch devices so users do not rely on mouse hover.
  - Add tactile feedback `active:scale-[0.96]` on click according to `better-ui`.
  - Refine transition declarations to avoid blanket `transition-all`.

#### Task 1.2: Accessible Controls in `ShopFilterBar.tsx`
- **File:** `src/app/(app)/shop/ShopFilterBar.tsx`
- **Change:**
  - Add `aria-label="Ordenar joyas por"` to the `<select>` element.
  - Add `role="region"` and `aria-label="Filtros del catálogo"` to the category pill container.

---

### 🔹 Phase 2: Gallery Accessibility & Modal Polish (`/galeria`)

#### Task 2.1: Mobile Category Tap Targets (44px min) in `GalleryClient.tsx`
- **File:** `src/blocks/Gallery/GalleryClient.tsx`
- **Change:**
  - Update mobile pill buttons to ensure `min-h-[44px]` touch target height with optical vertical centering.
  - Refine image priority so only first page initial images receive `priority`.

#### Task 2.2: Lightbox Keyboard Focus Trap & Accessibility
- **File:** `src/blocks/Gallery/GalleryClient.tsx`
- **Change:**
  - Trap `Tab` key cycling between Close button, Previous button, and Next button while Lightbox modal is open.
  - Ensure previous focus target is restored on close.

---

### 🔹 Phase 3: Landing Page Resilience & Motion Restraint (`/`)

#### Task 3.1: GSAP Motion Restraint in `SliderHero/Component.client.tsx`
- **File:** `src/heros/SliderHero/Component.client.tsx`
- **Change:**
  - Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - If reduced motion is requested, immediately set elements to their final resting state (`opacity: 1`, `transform: none`) without running the 1.8s zoom/slide sequence.

#### Task 3.2: Google Calendar Fetch Timeout & Non-blocking TTFB in `UpcomingEvents`
- **File:** `src/blocks/UpcomingEvents/Component.tsx`
- **Change:**
  - Add timeout safety (2.5s) to `fetchGoogleCalendarEvents` to prevent slow Google iCal endpoints from holding the initial Server Component response.

---

## 4. Verification and Definition of Done (DoD)

- [ ] `tsc --noEmit` verifies type correctness with zero introduced regressions.
- [ ] Catalog mobile quick-add button verified in layout.
- [ ] Sort select has accessible label.
- [ ] Gallery mobile tab targets meet 44px min height.
- [ ] Lightbox focus is contained inside modal.
- [ ] SliderHero respects `prefers-reduced-motion`.
- [ ] All changes committed to branch `feat/storefront/audit-ui-ux-improvements`.
