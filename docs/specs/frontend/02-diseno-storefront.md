# Diseño — Storefront

**Proyecto:** Nénufar — Storefront
**Versión:** v1 · 2026-08-18
**Deriva de:** [PRD Storefront](./01-PRD-storefront.md)
**Referencia:** [Krafti — Masonry List](https://krafti.qodeinteractive.com/product-list/masonry-list/)

---

## 1. Dirección visual

Vitrina **artesanal y cálida**, donde la **pieza es la protagonista**. Del Krafti tomamos la
**grilla masonry**, el aire generoso y las cards limpias; **no** su paleta genérica — usamos la
identidad Nénufar (violeta de marca + neutros cálidos).

## 2. Paleta

- **Marca:** violeta Nénufar `#6A1B9A` (token `--brand`, `oklch(38% 0.2 307deg)`), con
  `--brand-dark` para hover.
- **Neutros cálidos:** fondos casi-blancos con leve sesgo violáceo (no gris puro), tinta
  cercana al negro-berenjena.
- **Acento artesanal (opcional):** un dorado/latón sobrio para detalles finos.
- Estados semánticos (agotado, éxito) separados del acento de marca.

## 3. Layout — catálogo (`/shop`)

- **Grilla masonry** responsive: 1 col (móvil) → 2 → 3 → 4 (desktop). Alturas variables según
  la imagen (efecto galería).
- **Barra superior de controles:** búsqueda + filtro de categoría (chips/tabs, reusa
  `CategoryTabs`) + orden (dropdown, reusa `sorting` de `constants.ts`).
- **Aire generoso** entre cards; la imagen manda.
- Paginación o scroll infinito al pie.

## 4. Anatomía de la card (`ProductCard`)

```
┌───────────────────────┐
│                       │
│      imagen 1:1        │  ← hover: zoom suave + overlay con "Agregar" / "Ver"
│   (next/image, lazy)   │
│                       │
├───────────────────────┤
│ Categoría (tag chico)  │
│ Nombre de la pieza     │  ← link al detalle
│ $120.000  (COP)        │
└───────────────────────┘
```

- **Imagen** cuadrada, `object-cover`, `next/image` con `sizes` correctos.
- **Hover:** zoom leve (scale ~1.03) + overlay con acción rápida (**Agregar al carrito** o
  **Ver pieza**). En móvil, la acción es siempre visible (no hay hover).
- **Categoría** como tag sutil; **nombre** legible; **precio** en COP con `es-CO`.
- Estado **agotado**: badge + acción deshabilitada.

## 5. Detalle de pieza (`/products/[slug]`)

- **Galería** (carrusel, reusa `embla-carousel`) a la izquierda; info a la derecha.
- Nombre · precio COP · **selector de variantes** · descripción (Lexical rich text).
- **Botón primario "Agregar al carrito"** + **"Personalizar esta pieza"** (lleva a
  `/pedidos/enviar?modo=personalizado`).
- Piezas relacionadas al pie (masonry chico).

## 6. Tipografía

- **Display/serif** con carácter para nombres de piezas y títulos (aire editorial, artesanal).
- **Sans** legible para UI, precios y cuerpo.
- Escala tipográfica consistente; `text-wrap: balance` en títulos.

## 7. Motion

- Transiciones **sutiles**: fade-in de imágenes al cargar, zoom de hover, transición de página
  suave. Nada estridente (respetar `prefers-reduced-motion`).

## 8. Estados

| Estado | Diseño |
|--------|--------|
| Cargando | Skeletons de cards (no spinners bruscos) |
| Sin resultados | Mensaje cálido + CTA "ver todo el catálogo" |
| Agotado | Badge "Agotada" + acción deshabilitada |
| Error | Mensaje amable + reintentar |

## 9. Accesibilidad

- Foco visible en cards y controles; navegación por teclado.
- `alt` descriptivo en imágenes de piezas.
- Contraste AA (cuidar el violeta sobre fondos claros).
- Objetivos táctiles ≥ 44px en móvil.

## 10. Reuso de lo existente

| Actual | Uso |
|--------|-----|
| `components/ProductGridItem`, `ProductItem` | Base de la nueva `ProductCard` |
| `CategoryTabs` | Filtro de categoría |
| `constants.ts` (`sorting`) | Opciones de orden |
| `Price` component | Formato COP |
| `next/image`, `embla-carousel` | Imágenes y galería |
| Token `--brand` (globals.css) | Color de marca |
