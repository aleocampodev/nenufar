# PRD — Storefront

**Proyecto:** Nénufar — Storefront
**Versión:** v1 · 2026-08-18
**Estado:** Borrador

---

## 1. Resumen

La tienda pública donde el cliente **descubre piezas** y llega al flujo de pedido. Ya existe
(`/shop`, `/products/[slug]`); este PRD define el **rediseño** hacia una vitrina artesanal tipo
*masonry* (referencia: Krafti), manteniendo la marca Nénufar.

## 2. Objetivos

- Que las piezas **se luzcan** (la joyería entra por los ojos).
- Explorar y filtrar el catálogo con fluidez.
- Camino corto de "me gustó" → carrito → pedido (que sigue siendo por WhatsApp/Telegram).

## 3. Persona

**Valentina** — llega desde Instagram, navega en el celular, se enamora de una pieza, quiere
verla en detalle y saber precio/variantes sin fricción.

## 4. User stories

- **UF1** Como clienta, quiero ver el catálogo en una **grilla masonry** atractiva.
- **UF2** Como clienta, quiero **filtrar por categoría** y **ordenar** (precio, recientes).
- **UF3** Como clienta, quiero **buscar** una pieza por nombre.
- **UF4** Como clienta, quiero ver en cada card: **imagen, nombre, categoría, precio (COP)** y
  una acción rápida (**agregar al carrito** / ver detalle).
- **UF5** Como clienta, quiero un **detalle de pieza** con galería, variantes y el botón
  "**Personalizar esta pieza**".
- **UF6** Como clienta, quiero que todo se vea **impecable en el celular**.

## 5. Requisitos funcionales

| ID | Requisito | Ruta |
|----|-----------|------|
| RFS1 | Grilla masonry responsive del catálogo | `/shop` |
| RFS2 | Filtro por categoría (tabs/chips) | `/shop` |
| RFS3 | Ordenamiento (alfabético, precio ↑/↓, recientes) | `/shop` (reusa `constants.ts` `sorting`) |
| RFS4 | Búsqueda por texto | `/shop?q=` |
| RFS5 | Card de producto con quick-add al carrito | componente `ProductCard` |
| RFS6 | Paginación o scroll infinito | `/shop` |
| RFS7 | Detalle de pieza: galería + variantes + precio + "Personalizar" | `/products/[slug]` |

## 6. Requisitos no funcionales

| ID | Requisito |
|----|-----------|
| RNFS1 | **Performance:** imágenes optimizadas (`next/image`), lazy-load, LCP bajo |
| RNFS2 | **Responsive:** mobile-first; columnas masonry adaptativas |
| RNFS3 | **Moneda:** COP sin decimales (`Intl.NumberFormat('es-CO')`) |
| RNFS4 | **SEO:** metadata por pieza (reusa `generateMeta`), sitemap |
| RNFS5 | **Accesibilidad:** foco visible, alt en imágenes, contraste AA |
| RNFS6 | **Idioma:** español |

## 7. Criterios de aceptación

- [ ] `/shop` muestra masonry responsive con filtro, orden y búsqueda funcionando.
- [ ] La card permite agregar al carrito sin recargar (o navegar al detalle).
- [ ] `/products/[slug]` muestra galería + variantes + precio COP + "Personalizar esta pieza".
- [ ] Todo legible y usable en 360px de ancho.

## 8. Fuera de alcance

- Checkout/pago online (por diseño del negocio: coordinación manual).
- Cuentas sociales/login para comprar (el pedido es sin cuenta).
