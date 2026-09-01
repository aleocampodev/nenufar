---
target: src/app/(app)/page.tsx
total_score: 32
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 1
timestamp: 2026-09-01T00-53-08Z
slug: src-app-app-page-tsx
---
# Perspectiva de Dirección de Arte: Nénufar Landing Page (/)

## Design Health Score

| # | Heurística | Puntaje (0-4) | Observación Clave |
|---|---|:---:|---|
| 1 | Visibilidad del estado del sistema | 3 | Controles con indicador activo; falta indicador de carga/buffer en reproductor de video. |
| 2 | Coincidencia con el mundo real | 4 | Vocabulario artesanal caribeño y cosmología Emberá respetuosa y auténtica. |
| 3 | Control y libertad del usuario | 3 | Carrusel pausa con hover en escritorio; en móvil falta pausa por toque sostenido. |
| 4 | Consistencia y estándares | 3 | Tipografía serif/sans consistente; botones flotantes y badges varían ligeramente en padding. |
| 5 | Prevención de errores | 4 | Excelente resiliencia en fallbacks y estados vacíos. |
| 6 | Reconocimiento antes que recuerdo | 4 | Modales y testimonios conectan la pieza con su técnica y creadora. |
| 7 | Flexibilidad y eficiencia de uso | 3 | Navegación por anclas `#` fluida y bypass directo al catálogo `/shop`. |
| 8 | Diseño estético y minimalista | 4 | Composición editorial, paleta caribeña sobria y gran presencia fotográfica. |
| 9 | Reconocimiento y recuperación de errores | n/a | Superficie informativa y de catálogo (no aplica). |
| 10 | Ayuda y documentación | 4 | Información clara sobre pedidos personalizados y talleres en Getsemaní. |
| **Total** | | **32/36** | **Bueno (89% - Craft Sólido)** |

---

## Veredicto de Especificidad de Diseño

- **Autenticidad de Marca (LLM):** La página no se siente como una plantilla genérica de Shopify ni un e-commerce genérico de bisutería. La narrativa del **tejido sagrado Emberá (Okamas y Otapas)**, la autoría de Shirley en Cartagena y la micro-mostacilla checa calibrada le otorgan un carácter de **taller de alta costura artesanal**.
- **Escaneo Mecánico (Detector):** 16 observaciones reales (principalmente tamaños de área táctil < 44px en móviles y contraste en los encabezados del calendario de eventos) y 3 falsos positivos resueltos.
- **Identidad de Color:** El morado de marca (`#6A1B9A`) y los neutros cálidos caribeños (`#FAF8F5`, `#8B5A2B`) están bien balanceados, aunque se recomienda consolidar las clases de Tailwind (`bg-brand`, `bg-brand-dark`).

---

## Impresión General
La landing tiene un flujo narrativo envolvente y refinado: el nuevo **Hero estilo editorial** atrapa la mirada de inmediato, **NenufarStory** conecta con la humanidad de Shirley, **ImageStrip** educa sobre el valor patrimonial de los collares ceremoniales, **Features** sustenta la calidad técnica, y el **Video/Calendario** demuestra que es un taller vivo en Cartagena.

---

## Puntos Fuertes Destacados
1. **Inmersión Cultural Auténtica:** Describir los Okamas como *"camino que recorre el cuello"* y las Otapas como *"escudo protector"* transforma una compra común en la adquisición de una pieza de arte con significado.
2. **Hero Editorial con Control Inmediato:** El slider con botones circulares, tabs por colección y CTA morado integrado ofrece una primera impresión de marca de lujo accesible.
3. **Sección de Talleres Viva:** El video vertical 9:16 de Shirley tejiendo junto con el calendario de fechas en Getsemaní genera máxima credibilidad y cercanía.

---

## Problemas Prioritarios (P1 - P3)

- **[P1] Áreas táctiles en móviles < 44px (Touch Target Size):**  
  *Problema:* Las flechas del carrusel del hero (`40x40px`), botones de testimonios (`36x36px`), botón de cerrar en modales (`36px`) y celdas de días del calendario (`36px`) son difíciles de pulsar en pantallas pequeñas.  
  *Impacto:* Fricción y toques erróneos para usuarias en móvil (persona *Casey*).  
  *Solución:* Normalizar contenedores interactivos a un mínimo de `min-h-[44px] min-w-[44px]`.  
  *Comando sugerido:* `/impeccable adapt touch targets for mobile viewports`

- **[P2] Contradicción de técnica en texto fallback (`home-static.ts`):**  
  *Problema:* El texto inicial menciona "filigrana y plata", cuando el diferencial único de Shirley es la *mostacilla checa calibrada* y el *tejido sagrado Emberá*.  
  *Impacto:* Confusión sobre la técnica para coleccionistas de arte (persona *Valentina*).  
  *Solución:* Ajustar la descripción para enfocar el 100% en mostacilla de autor y diseño ancestral.  
  *Comando sugerido:* `/impeccable clarify narrative and craft copy`

- **[P2] Contraste en encabezados del calendario de talleres:**  
  *Problema:* Los nombres de los días (`Lun, Mar, Mié...`) usan `text-stone-400` sobre blanco (contraste 2.4:1, menor al 4.5:1 requerido por WCAG).  
  *Impacto:* Dificultad de lectura bajo el sol en móviles.  
  *Solución:* Cambiar a `text-stone-600` o `text-stone-700`.  
  *Comando sugerido:* `/impeccable audit accessibility and contrast fixes`

- **[P3] Titular SaaS en la sección de características:**  
  *Problema:* El título *"Por qué elegir Nénufar Joyería"* suena a software B2B corporativo.  
  *Impacto:* Rompe ligeramente la atmósfera poética y artesanal.  
  *Solución:* Reemplazar por *"El Arte de la Paciencia y la Tradición"* o *"El Rigor de Nuestro Oficio"*.  
  *Comando sugerido:* `/impeccable polish features headline tone`

---

## Banderas Rojas por Persona

- **Jordan (Comprador de regalos por primera vez):** Desea saber tiempos de entrega para fechas especiales (Bogotá/Medellín). Falta una pequeña micro-insignia en el CTA de pedido personalizado: *"Envíos seguros a toda Colombia en 2-4 días hábiles"*.
- **Casey (Compradora móvil en Getsemaní/Cartagena):** Al abrir la historia 4 en ImageStrip, el contenido se despliega abajo de la lista de tarjetas y requiere scroll largo.
- **Valentina (Coleccionista de joyería de autor):** Valora la mención explícita de las 3.200 micro-mostacillas por pieza; necesita que la ficha técnica destaque que no se destiñen ni se oxidan.
