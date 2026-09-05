---
target: src/blocks/Gallery/GalleryClient.tsx
total_score: 17
max_score: 32
na_heuristics: 9,10
p0_count: 1
p1_count: 1
timestamp: 2026-09-05T02-01-09Z
slug: src-blocks-gallery-galleryclient-tsx
---
# Design Critique: Nénufar Gallery Block
**Target:** `src/blocks/Gallery/GalleryClient.tsx` & `src/blocks/Gallery/Component.tsx`  
**Surface Mode:** Experience (Atelier Showcase & Visual Lookbook)  
**Method:** dual-agent (A: 9b11c553-c3d8-4663-8a8b-76ac686c1c08 · B: 03ebcae4-480d-440c-ad20-43ae0da3d02f)

## Design Health Score (Nielsen Heuristics)

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 2/4 | Tab activo claro (`bg-brand`), pero sin estados blur-up al cargar ni sombras de desbordamiento en scroll horizontal móvil. |
| 2 | Match System / Real World | 2/4 | Vocabulario y layout administrativo (`CATEGORÍAS`, `Pág. 1 de 5`, `font-mono`) en lugar de curaduría artesanal cartagenera. |
| 3 | User Control and Freedom | 3/4 | Modal con tecla Esc y cierre por fondo, pero sin sincronización de URL o hash para botón Atrás del navegador. |
| 4 | Consistency and Standards | 2/4 | Mezcla de radios (`rounded-full`, `rounded-2xl`, `rounded-3xl`) y uso de `font-mono` ajeno a los tokens tipográficos de Nénufar. |
| 5 | Error Prevention | 3/4 | Fallback seguro implementado (`DEFAULT_GALLERY_TABS`); imágenes con alts en español, aunque sin placeholder visual decorativo en fallo de red. |
| 6 | Recognition Rather Than Recall | 1/4 | **Crítico:** Títulos ocultos tras `:hover` de escritorio (`opacity-0 group-hover:opacity-100`). En móviles se percibe una cuadrícula muda. |
| 7 | Flexibility and Efficiency | 2/4 | Flechas de teclado soportadas en escritorio, pero el modal carece totalmente de gestos táctiles swipe en móviles. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Relación de aspecto 3:4 rígida que corta detalles de collares; barra lateral fija que desperdicia espacio horizontal útil. |
| 9 | Error Recovery | n/a | Superficie puramente visual/experiencial sin formularios transaccionales de usuario. |
| 10 | Help and Documentation | n/a | Navegación exploratoria autoexplicativa; no requiere ayuda documental formal. |
| **Total** | | **17/32** | **Requiere Atención (53%)** |

## Design Specificity Verdict

- **Veredicto:** El bloque actual utiliza una fórmula estructural de panel de administración SaaS o gestor de archivos digitales (sidebar fija izquierda con icono `<Layers />` + grilla uniforme de tarjetas 3:4 con paginación de 6 elementos), en lugar de reflejar la calidez, textura y elegancia de un atelier de alta joyería artesanal en Cartagena de Indias.
- **Evidencia Determinística:**
  - 0 errores en consola de JavaScript.
  - 25/25 recursos WebP cargando con código 200 OK.
  - Tarjetas de imagen implementadas como `<div>` con `onClick`, violando WCAG 2.1.1 (inaccesibles por teclado).
  - Pestañas de categorías sin roles ARIA (`tablist`, `tab`, `aria-selected`, `aria-controls`).
  - Modal lightbox sin foco inicial, sin trampa de foco y sin anuncio para lectores de pantalla.

## Fortalezas
1. **Fotografía real y auténtica:** Capturas directas de Shirley, clientas reales y el taller en Getsemaní.
2. **Navegación instantánea en cliente:** Cambio de pestañas fluido y sin parpadeos.
3. **Manejo básico de eventos de teclado en modal:** Soporte para `Escape`, `ArrowLeft` y `ArrowRight`.

## Prioridades (P0 - P3)
- **[P0] Inaccesibilidad por teclado en tarjetas**: Los `<div>` interactivos no son operables sin ratón.
- **[P1] Pérdida de contexto en móvil y falta de swipe**: Títulos solo visibles en hover; sin gestos táctiles en el visor.
- **[P2] Estructura de barra lateral administrativa**: El sidebar sticky satura el espacio desktop; la propiedad `isFeatured` no rompe la cuadrícula editorial.
- **[P3] Salida comercial en Lightbox**: Falta de puente directo al catálogo o consulta por WhatsApp para la pieza visualizada.
