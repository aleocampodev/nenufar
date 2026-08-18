# Especificaciones — Storefront (Frontend)

Specs del **storefront** de Nénufar (la tienda pública), track **separado** del bot.
Cubre el catálogo, el detalle de pieza y el rediseño visual hacia una estética artesanal
tipo *masonry*.

| # | Documento | Tema |
|---|-----------|------|
| [01](./01-PRD-storefront.md) | **PRD — Storefront** | Qué construimos: catálogo, filtros, detalle, quick-add |
| [02](./02-diseno-storefront.md) | **Diseño — Storefront** | Cómo se ve: masonry, cards, paleta, tipografía, motion |

**Referencia visual:** [Krafti — Masonry List](https://krafti.qodeinteractive.com/product-list/masonry-list/)
(grilla masonry, cards con imagen/título/categoría/precio/"add to cart", estética artesanal).

**Vive en:** `apps/web` (ver [09-estructura-proyecto](../09-estructura-proyecto.md)).
Rutas actuales: `/shop`, `/products/[slug]`.
