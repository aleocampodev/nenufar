# SPEC-003: Catalog & Landing Page Modular Blocks Subsystem

* **Author:** Engineering Team
* **Status:** Implemented & In Refinement
* **Related ADR:** [ADR-003](../adr/ADR-003-payload-embedded-monolith-local-api.md)
* **Primary Source Files:**
  * `src/collections/Pages/index.ts`
  * `src/collections/Media.ts`
  * `src/components/ProductCard/index.tsx`
  * `src/app/(app)/page.tsx`
  * `src/blocks/*`

---

## 1. System Overview

The landing page (`/`) is built with modular content blocks in Payload CMS (`pages` collection) and rendered using Next.js 15 Server Components. Shirley can update the landing page visually from `/admin` or programmatically via her Telegram bot (e.g. `destacarProducto`, `publicarEvento`).

---

## 2. Block Architecture & Supported Layouts

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Hero Block: Brand image + headline + CTA button          │
├─────────────────────────────────────────────────────────────┤
│ 2. Banner Block: Promotional announcements / shipping info  │
├─────────────────────────────────────────────────────────────┤
│ 3. Carousel / ThreeItemGrid: Featured pieces & categories   │
├─────────────────────────────────────────────────────────────┤
│ 4. Masonry Grid (/shop): Dynamic responsive catalog layout  │
├─────────────────────────────────────────────────────────────┤
│ 5. UpcomingEvents: Artisan fairs & pop-ups in Cartagena     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ProductCard & Masonry Layout Rules

1. **CSS Columns Masonry:** The catalog renders with natural aspect ratios using CSS columns (`columns-1 sm:columns-2 lg:columns-3 xl:columns-4`) and `break-inside-avoid` to prevent card clipping.
2. **COP Price Formatting:** All prices are displayed without decimals using Colombian locale formatting:
   ```typescript
   export const formatPrice = (amount: number): string => {
     return new Intl.NumberFormat('es-CO', {
       style: 'currency',
       currency: 'COP',
       maximumFractionDigits: 0,
     }).format(amount)
   }
   ```
3. **Sharp WebP Media Pipeline:** Uploading photos in `/admin` automatically generates 4 optimized WebP formats:
   * `thumbnail`: 300px width (Cart & admin previews)
   * `card`: 600px width (Catalog cards)
   * `feature`: 1024px width (Product detail view)
   * `hero`: 1920px width (Full-bleed hero banners)

---

## 4. Live Preview & Cache Revalidation

* **Payload Live Preview:** Editors see changes in real time in `/admin` before publishing.
* **On-Demand Revalidation:** The `revalidatePage` hook purges Next.js route caches (`revalidatePath('/')`, `revalidatePath('/shop')`) synchronously upon document publication.
