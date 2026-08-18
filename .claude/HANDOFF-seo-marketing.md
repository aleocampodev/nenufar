# HANDOFF — SEO técnico + Marketing para ventas (Nénufar)

**Fecha:** 2026-08-15
**Rama:** main
**Alcance de la sesión:** SEO técnico del ecommerce/blog + montaje de marketing gratis orientado a ventas.
**Estado:** ✅ Código compila (solo quedan errores TS `slug` PREEXISTENTES, ver Gotchas). Nada commiteado aún.

---

## 1. Contexto del negocio (léelo antes de tocar nada)

- Nénufar = joyería artesanal de Shirley (Cartagena). Payload CMS v3.86 + Next 16 + Postgres.
- **Sin pasarela de pago**: comprar = llenar formulario → pedido va a Telegram → Shirley cierra manual.
- **Modelo de canales (clave para marketing):**
  - **Telegram** = canal de ADMIN (Shirley crea blog + eventos, y recibe pedidos). Gratis. NO es canal de venta.
  - **Venta/tráfico** = Google/SEO (principal) + Instagram/Facebook (@nenufar.co) + WhatsApp.
  - Pinterest se DESCARTÓ (Shirley trabaja por pedidos, no le queda cercano).
- Embudo objetivo: `IG/FB/Google → página de producto → /pedidos/enviar → Telegram`.

---

## 2. Cambios de código (todos aplicados, sin commit)

| Archivo | Cambio | Estado |
|---|---|---|
| `src/app/(app)/products/[slug]/page.tsx` | JSON-LD `Product` corregido (moneda **COP** antes 'usd', + brand/sku/url, imágenes **absolutas** vía `toAbsoluteUrl`), descripción a texto plano (`convertLexicalToPlaintext`), `generateMetadata` con canonical + OG/Twitter completos | ✅ |
| `src/app/(app)/blog/[slug]/page.tsx` | Nuevo JSON-LD `BlogPosting` (autor, fechas, imagen absoluta, publisher), `generateMetadata` con canonical + OG `article` + Twitter | ✅ |
| `src/app/(app)/layout.tsx` | Activado `metadata` (estaba comentado): `metadataBase`, title template, OG/Twitter global + JSON-LD `Organization` con `sameAs` a IG/FB | ✅ |
| `src/app/(app)/sitemap.ts` | **NUEVO** — sitemap dinámico: rutas estáticas + productos y posts publicados | ✅ |
| `src/app/(app)/robots.ts` | Reescrito: usa `getServerSideURL()` (consistente), bloquea `/admin`, `/api`, `/pedidos`, `/find-order`, cuentas | ✅ |
| `src/plugins/index.ts` | `generateTitle` SEO: "Nénufar Joyería Artesanal" (antes "Payload Ecommerce Template") | ✅ |
| `src/utilities/mergeOpenGraph.ts` | Defaults de marca Nénufar (antes "Payload Website Template" + imagen de payloadcms.com) | ✅ |

**Patrón reutilizable:** helper `toAbsoluteUrl(url)` (duplicado en product y blog) — Google exige URLs absolutas en JSON-LD; prefija dominio solo si la URL es relativa. Candidato a extraer a `src/utilities/` si se toca de nuevo.

---

## 3. Assets de marketing (no son código de la app)

- `.claude/project-context.md` — contexto de marca que leen las skills. Voz **cercana/cálida**,
  público amplio, diferenciadores: hecho a mano + edición limitada + identidad Cartagena.
  **Materiales SIN confirmar** (no afirmar "plata" etc. hasta que Shirley diga).
- `.claude/plan-blog-seo.md` — plan de 5 artículos SEO (cada uno con keyword + productos a enlazar).
  Prioridad #1: **Amor y Amistad** (estacional, publicar antes de septiembre 2026).
- **Skills instaladas** (de `kostja94/marketing-skills`, MIT) en `.agents/skills/` (symlink en `.claude/skills/`):
  `copywriting`, `visual-content`, `article-content`. (`pinterest-posts` se instaló y luego se ELIMINÓ.)
  Lockfile: `skills-lock.json`.

---

## 4. Pendientes / próximos pasos (priorizados)

1. **Escribir el artículo #1 del blog (Amor y Amistad)** con la skill `article-content` + voz de marca.
   Necesita 2-3 productos reales para enlazar (o dejar placeholders). ← mayor impacto en ventas gratis.
2. **Falta la imagen `/og-default.jpg`** en `public/` — la referencia `mergeOpenGraph.ts` y layout.
   Subir una foto de joya de Shirley. Sin ella, redes usan la imagen específica de cada página (no rompe, pero conviene).
3. **`offers.priceValidUntil`** no está en el JSON-LD de producto — Google lo *recomienda* (solo warning). Opcional.
4. **Google Business Profile** (acción de Shirley, no código): ficha gratis → SEO local Cartagena.
5. **WhatsApp**: evaluar botón de WhatsApp en la tienda (cierre de ventas en Colombia).
6. Confirmar con Shirley los `[CONFIRMAR]` de `project-context.md` (materiales, catálogo real, keywords).

---

## 5. Gotchas / cuidado

- **Errores TS `Property 'slug' does not exist`** en product/blog/plugins/sitemap: son **PREEXISTENTES**
  (el campo `slug` es `type: 'slug'` custom y no está en `payload-types.ts`, pero existe en runtime).
  Ya anotado en la memoria del proyecto. Los casts `as unknown as { slug: string }` en `sitemap.ts` son por esto.
  NO son regresiones de esta sesión.
- `getServerSideURL()` lee `NEXT_PUBLIC_SERVER_URL` (o VERCEL). El OG/canonical/JSON-LD dependen de que esté bien seteada en prod.
- El JSON-LD usa `<Script type="application/ld+json">` de `next/script`.
- Verificar cambios: `npx tsc --noEmit` (filtrar los errores `slug` preexistentes).
- Nada está commiteado. `git status` muestra los 6 modificados + `sitemap.ts` + `.claude/` + `.agents/` + `skills-lock.json`.

---

## 6. Cómo validar el SEO cuando esté en prod

- Rich Results Test de Google (pegar URL de producto y de artículo) → deben pasar `Product` y `BlogPosting`.
- Revisar `/(sitemap.xml)` y `/robots.txt` en el navegador.
- Google Search Console: dar de alta el dominio + enviar sitemap (indexación rápida, gratis).
