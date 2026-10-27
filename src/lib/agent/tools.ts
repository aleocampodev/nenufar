/**
 * Tools del bot de gestión de Shirley (IP-001 / SPEC-002).
 *
 * Cada tool es una función que el agente IA (Claude Agent SDK / LiteLLM) puede
 * invocar durante su loop agéntico. Todas operan sobre la Payload Local API.
 *
 * Reglas:
 * - Los errores se capturan y devuelven como texto amigable: Shirley lee la
 *   respuesta en Telegram; jamás un stack trace.
 * - Moneda COP sin decimales.
 */
import type { Payload } from 'payload'
import { getMediaStorageStats, formatStorageReport } from '@/lib/storageAlerts'
import { formatCOP } from '@/lib/order-formatter'

/** Producto con slug casteado — `slug` se perdió del tipo generado (bug pre-existente). */
type ProductWithSlug = {
  id: number
  title?: string
  slug?: string
  priceInCOP?: number | null
  inventory?: number | null
  featured?: boolean | null
}


async function findProductBySlug(
  payload: Payload,
  slug: string,
): Promise<ProductWithSlug | null> {
  const result = await payload.find({
    collection: 'products',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return (result.docs[0] as ProductWithSlug | undefined) ?? null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function findOrCreateCategory(
  payload: Payload,
  title: string,
): Promise<{ doc: { id: number; title: string; slug?: string }; created: boolean }> {
  const cleanTitle = title.trim()
  const slug = slugify(cleanTitle)

  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    where: {
      or: [
        { slug: { equals: slug } },
        { title: { like: cleanTitle } },
      ],
    },
  })

  if (existing.docs.length > 0) {
    return { doc: existing.docs[0] as any, created: false }
  }

  const newDoc = await payload.create({
    collection: 'categories',
    data: {
      title: cleanTitle,
      slug: slug || undefined,
    } as any,
    overrideAccess: true,
  })

  return { doc: newDoc as any, created: true }
}

function textToLexical(text: string) {
  const paragraphs = text.split('\n\n').map((p) => p.trim()).filter(Boolean)
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: p,
            version: 1,
          },
        ],
      })),
    },
  }
}

/**
 * Ejecutor central de herramientas para el bot de Shirley.
 */
export async function executeShirleyTool(
  toolName: string,
  args: Record<string, any>,
  payload: Payload,
): Promise<string> {
  try {
    switch (toolName) {
      // ─── 1. CATÁLOGO & JOYAS ─────────────────────────────────────────────
      case 'buscarProducto': {
        const consulta = String(args.consulta || '').trim()
        const result = await payload.find({
          collection: 'products',
          draft: false,
          depth: 0,
          limit: 8,
          overrideAccess: true,
          where: consulta ? { title: { like: consulta } } : {},
        })
        if (result.docs.length === 0) {
          return `No encontré piezas para "${consulta}" en el catálogo.`
        }
        const lines = result.docs.map((p: any) => {
          const stock = typeof p.inventory === 'number' && p.inventory <= 0 ? ' (Sin stock)' : ` (${p.inventory ?? 0} disp.)`
          return `💎 ${p.title} — ${formatCOP(p.priceInCOP)}${stock}`
        })
        return `Encontré ${result.docs.length} pieza(s) en el catálogo:\n\n${lines.join('\n')}`
      }

      case 'crearProductoDraft': {
        const { titulo, precioCOP, inventario, publicar, mediaId, categoria, quitarFondo = true } = args
        const shouldPublish = Boolean(publicar)
        let categoryIds: number[] = []

        if (categoria) {
          const { doc: catDoc } = await findOrCreateCategory(payload, String(categoria))
          categoryIds = [catDoc.id]
        }

        let finalMediaId = mediaId ? Number(mediaId) : undefined
        let bgRemoved = false

        if (finalMediaId && quitarFondo !== false) {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: finalMediaId,
              depth: 0,
              overrideAccess: true,
            })
            if (mediaDoc?.url) {
              const { removeImageBackground } = await import('@/lib/background-removal')
              const cleanBuffer = await removeImageBackground(mediaDoc.url)
              if (cleanBuffer) {
                const cleanDoc = await payload.create({
                  collection: 'media',
                  data: {
                    alt: `${titulo} - Fondo blanco de estudio`,
                  },
                  file: {
                    data: cleanBuffer,
                    mimetype: 'image/png',
                    name: `${slugify(titulo)}-clean-${Date.now()}.png`,
                    size: cleanBuffer.length,
                  },
                  overrideAccess: true,
                })
                finalMediaId = cleanDoc.id
                bgRemoved = true
              }
            }
          } catch (bgErr) {
            payload.logger.warn({
              msg: '[shirley-agent] No se pudo remover fondo con IA, usando foto original',
              err: bgErr,
            })
          }
        }

        const doc = await payload.create({
          collection: 'products',
          data: {
            title: titulo,
            ...(precioCOP !== undefined ? { priceInCOPEnabled: true, priceInCOP: Number(precioCOP) } : {}),
            ...(inventario !== undefined ? { inventory: Number(inventario) } : {}),
            ...(finalMediaId ? { images: [{ image: finalMediaId }] } : {}),
            ...(categoryIds.length > 0 ? { categories: categoryIds } : {}),
            _status: shouldPublish ? 'published' : 'draft',
          } as any,
          draft: !shouldPublish,
          overrideAccess: true,
        })
        const catMsg = categoryIds.length > 0 ? ` en la categoría "${categoria}"` : ''
        const bgMsg = bgRemoved
          ? ' ✨ Le retiré el fondo automáticamente para que luzca con fondo de estudio blanco impecable.'
          : ''
        return shouldPublish
          ? `¡Listo Shirley! Joya "${titulo}" creada y publicada exitosamente en el catálogo (/shop)${catMsg} con precio ${formatCOP(precioCOP)}.${bgMsg}`
          : `¡Listo Shirley! Joya "${titulo}" guardada como borrador${catMsg} con precio ${formatCOP(precioCOP)}.${bgMsg} Puedes publicarla cuando quieras diciendo "publicar ${titulo}".`
      }

      case 'publicarProducto': {
        const { slug, publicar = true } = args
        const state = Boolean(publicar)
        const product = await findProductBySlug(payload, slug)
        if (!product) return `No encontré ningún producto con el slug o nombre "${slug}".`
        await payload.update({
          collection: 'products',
          id: product.id,
          data: { _status: state ? 'published' : 'draft' },
          draft: !state,
          overrideAccess: true,
        })
        return state
          ? `¡Listo Shirley! "${product.title}" fue publicado y ya está visible en la tienda web (/shop) ✨`
          : `"${product.title}" ha sido cambiado a borrador y ya no aparece en la tienda web.`
      }

      case 'actualizarInventario': {
        const { slug, inventario, precioCOP } = args
        if (inventario === undefined && precioCOP === undefined) {
          return 'Shirley, indícame al menos el nuevo inventario o precio.'
        }
        const product = await findProductBySlug(payload, slug)
        if (!product) return `No encontré ningún producto con el slug "${slug}".`
        const data: Record<string, any> = {}
        if (inventario !== undefined) data.inventory = Number(inventario)
        if (precioCOP !== undefined) {
          data.priceInCOPEnabled = true
          data.priceInCOP = Number(precioCOP)
        }
        await payload.update({
          collection: 'products',
          id: product.id,
          data,
          overrideAccess: true,
        })
        const cambios = [
          inventario !== undefined ? `inventario → ${inventario} unidades` : null,
          precioCOP !== undefined ? `precio → ${formatCOP(precioCOP)}` : null,
        ].filter(Boolean).join(', ')
        return `Actualicé "${product.title}": ${cambios} ✅`
      }

      case 'destacarProducto': {
        const { slug, destacado = true } = args
        const product = await findProductBySlug(payload, slug)
        if (!product) return `No encontré ningún producto con el slug "${slug}".`
        await payload.update({
          collection: 'products',
          id: product.id,
          data: { featured: Boolean(destacado) },
          overrideAccess: true,
        })
        return destacado
          ? `¡Listo! "${product.title}" ahora está marcado como producto destacado en la tienda ✨`
          : `"${product.title}" ya no aparece como producto destacado.`
      }

      case 'crearCategoria': {
        const { titulo } = args
        const cleanTitle = String(titulo || '').trim()
        if (!cleanTitle) {
          return 'Shirley, indícame el nombre de la categoría que deseas crear.'
        }

        const { doc, created } = await findOrCreateCategory(payload, cleanTitle)
        if (!created) {
          return `La categoría "${doc.title}" ya existía en el catálogo de Nenúfar.`
        }

        return `¡Listo Shirley! Categoría "${cleanTitle}" creada exitosamente ✨ Ya está disponible para organizar tus joyas y en los filtros de la tienda web (/shop).`
      }

      case 'listarCategorias': {
        const categoriesRes = await payload.find({
          collection: 'categories',
          limit: 50,
          depth: 0,
          overrideAccess: true,
          sort: 'title',
        })

        if (categoriesRes.docs.length === 0) {
          return 'No hay categorías registradas en el catálogo todavía. Puedes crear una diciendo "crea la categoría Aretes".'
        }

        const counts = await Promise.all(
          categoriesRes.docs.map((cat) =>
            payload.find({
              collection: 'products',
              limit: 0,
              depth: 0,
              overrideAccess: true,
              where: {
                categories: {
                  contains: cat.id,
                },
              },
            }),
          ),
        )

        const lines = categoriesRes.docs.map((cat, i) => {
          const count = counts[i]?.totalDocs ?? 0
          return `• ${cat.title} (${count} ${count === 1 ? 'joya' : 'joyas'})`
        })

        return `Categorías en el catálogo (${categoriesRes.docs.length}):\n${lines.join('\n')}`
      }

      case 'analizarCatalogoYGaleria': {
        // 1. Análisis del catálogo (/shop)
        const categoriesRes = await payload.find({
          collection: 'categories',
          limit: 100,
          depth: 0,
          overrideAccess: true,
          sort: 'title',
        })

        const allProducts = await payload.find({
          collection: 'products',
          limit: 200,
          depth: 0,
          overrideAccess: true,
        })

        const published = allProducts.docs.filter((p: any) => p._status === 'published')
        const drafts = allProducts.docs.filter((p: any) => p._status === 'draft')
        const withoutPhotos = allProducts.docs.filter((p: any) => !p.images || p.images.length === 0)

        // Desglose por categoría
        const categoryBreakdown: Array<{ title: string; count: number; empty: boolean }> = []
        for (const cat of categoriesRes.docs) {
          const prodsInCat = allProducts.docs.filter((p: any) => {
            const cats = Array.isArray(p.categories) ? p.categories : []
            return cats.some((c: any) => (typeof c === 'object' ? c.id === cat.id : c === cat.id))
          })
          categoryBreakdown.push({
            title: cat.title,
            count: prodsInCat.length,
            empty: prodsInCat.length === 0,
          })
        }

        // 2. Análisis de la galería (/galeria y landing)
        const homeRes = await payload.find({
          collection: 'pages',
          where: { or: [{ slug: { equals: 'home' } }, { slug: { equals: 'inicio' } }] },
          depth: 1,
          overrideAccess: true,
          limit: 1,
        })
        const page = homeRes.docs[0]
        const galleryBlock = (page?.layout as any[])?.find((b) => b.blockType === 'gallery')
        const galleryTabs = galleryBlock?.tabs || []

        const galleryBreakdown: Array<{ title: string; count: number; empty: boolean }> = galleryTabs.map((t: any) => ({
          title: t.tabTitle || 'Sección',
          count: Array.isArray(t.images) ? t.images.length : 0,
          empty: !Array.isArray(t.images) || t.images.length === 0,
        }))

        // 3. Recomendaciones accionables
        const recomendaciones: string[] = []
        const emptyCats = categoryBreakdown.filter((c) => c.empty)
        if (emptyCats.length > 0) {
          recomendaciones.push(`• Catálogo: No tienes piezas en las categorías ${emptyCats.map((c) => `"${c.title}"`).join(', ')}. ¿Subimos fotos de estas categorías?`)
        }
        if (withoutPhotos.length > 0) {
          recomendaciones.push(`• Joyas sin foto: Tienes ${withoutPhotos.length} joya(s) sin foto (${withoutPhotos.slice(0, 3).map((p: any) => `"${p.title}"`).join(', ')}). Envíame las fotos para asociarlas.`)
        }
        const emptyGallery = galleryBreakdown.filter((g) => g.empty || g.count < 2)
        if (emptyGallery.length > 0) {
          recomendaciones.push(`• Galería: La sección "${emptyGallery[0].title}" tiene ${emptyGallery[0].count} foto(s). Si tienes fotos de clientas o momentos recientes, envíamelas para publicarlas.`)
        }
        if (recomendaciones.length === 0) {
          recomendaciones.push(`• ¡Todo está balanceado y al día! Tienes ${published.length} joyas publicadas y fotos en todas las secciones.`)
        }

        const catLines = categoryBreakdown.map((c) => `  - ${c.title}: ${c.count} joya(s)${c.empty ? ' ⚠️ (Vacía)' : ''}`)
        const galLines = galleryBreakdown.map((g) => `  - ${g.title}: ${g.count} foto(s)${g.empty ? ' ⚠️ (Sin fotos)' : ''}`)

        return [
          `📊 Análisis de Estado: Catálogo y Galería Nenúfar:`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `💎 Catálogo (/shop):`,
          `• Total joyas: ${allProducts.totalDocs} (${published.length} publicadas, ${drafts.length} borradores)`,
          ...(catLines.length > 0 ? catLines : ['  (Sin categorías creadas)']),
          ``,
          `📸 Galería (/galeria):`,
          ...(galLines.length > 0 ? galLines : ['  (Sin pestañas de galería)']),
          ``,
          `💡 Recomendaciones para hoy:`,
          ...recomendaciones,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `Para subir una foto, envíamela por aquí y dime si va al catálogo o a la galería. ✨`,
        ].join('\n')
      }

      case 'asignarCategoriaProducto': {
        const { slug, categoria } = args
        const cleanSlug = String(slug || '').trim()
        const cleanCat = String(categoria || '').trim()

        if (!cleanSlug || !cleanCat) {
          return 'Shirley, por favor indícame la joya (slug o nombre) y la categoría a asignar.'
        }

        const product = await findProductBySlug(payload, cleanSlug)
        if (!product) {
          return `No encontré ningún producto con el slug "${cleanSlug}".`
        }

        const { doc: catDoc } = await findOrCreateCategory(payload, cleanCat)

        const fullProduct = await payload.findByID({
          collection: 'products',
          id: product.id,
          depth: 0,
          overrideAccess: true,
        })

        const currentCatIds: number[] = Array.isArray((fullProduct as any)?.categories)
          ? (fullProduct as any).categories.map((c: any) => (typeof c === 'object' ? c.id : c))
          : []

        if (!currentCatIds.includes(catDoc.id)) {
          currentCatIds.push(catDoc.id)
          await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              categories: currentCatIds,
            },
            overrideAccess: true,
          })
        }

        return `¡Listo Shirley! Asocié la categoría "${catDoc.title}" a la joya "${product.title}" ✨`
      }

      // ─── 2. PEDIDOS ───────────────────────────────────────────────────────
      case 'pedidosPendientes': {
        const result = await payload.find({
          collection: 'orders',
          depth: 1,
          limit: 15,
          overrideAccess: true,
          sort: '-createdAt',
          where: { status: { equals: 'processing' } },
        })
        if (result.docs.length === 0) {
          return 'No tienes pedidos pendientes por confirmar. ¡Todo al día! 💜'
        }
        const lines = result.docs.map((o: any) => {
          const items = (o.items ?? [])
            .map((it: any) => {
              const titulo = typeof it.product === 'object' ? it.product?.title : 'Joya'
              return `${it.quantity ?? 1}x ${titulo}`
            })
            .join(', ')
          const buyer = o.buyerName || o.shippingAddress?.firstName || 'Sin nombre'
          const contact = o.buyerContact || o.shippingAddress?.phone || o.customerEmail || 'Sin contacto'
          return `📦 Pedido #${o.id} — ${formatCOP(o.amount)} — ${buyer} (${contact})\n   Detalle: ${items || 'Sin items'}`
        })
        return `Tienes ${result.docs.length} pedido(s) pendiente(s):\n\n${lines.join('\n\n')}`
      }

      case 'confirmarPedido': {
        const { pedidoId } = args
        const order = await payload.findByID({
          collection: 'orders',
          id: Number(pedidoId),
          depth: 0,
          overrideAccess: true,
        })
        if (!order) return `No encontré el pedido #${pedidoId}.`
        if (order.status === 'completed') return `El pedido #${pedidoId} ya estaba confirmado anteriormente.`
        await payload.update({
          collection: 'orders',
          id: Number(pedidoId),
          data: { status: 'completed' },
          overrideAccess: true,
        })
        return `Pedido #${pedidoId} confirmado exitosamente ✅ (${formatCOP(order.amount)}).`
      }

      // ─── 3. GALERÍA DE MOMENTOS, CLIENTAS & FERIAS ─────────────────────────
      case 'agregarFotoGaleria': {
        const { categoria, titulo, descripcion, esDestacada, mediaId, urlFoto } = args
        const cleanTitle = String(titulo || '').trim()
        if (!cleanTitle) {
          return 'Shirley, por favor indícame un título o nombre para la foto de la galería.'
        }

        const homeRes = await payload.find({
          collection: 'pages',
          where: {
            or: [{ slug: { equals: 'home' } }, { slug: { equals: 'inicio' } }],
          },
          depth: 1,
          overrideAccess: true,
          limit: 1,
        })

        if (!homeRes.docs.length) {
          return 'No encontré la página principal en la base de datos para guardar la foto.'
        }

        const page = homeRes.docs[0]
        const currentLayout = [...((page.layout as any[]) || [])]
        let galleryBlockIdx = currentLayout.findIndex((b) => b.blockType === 'gallery')

        const defaultTabs = [
          { tabTitle: 'Nuestras Clientas', tabSubtitle: 'Mujeres reales vistiendo cada diseño', images: [] },
          { tabTitle: 'Ferias en Cartagena', tabSubtitle: 'Encuentros presenciales y pop-ups', images: [] },
          { tabTitle: 'Talleres de Tejido', tabSubtitle: 'El arte ancestral de la mostacilla', images: [] },
          { tabTitle: 'El Taller & Shirley', tabSubtitle: 'El espacio íntimo de creación en Getsemaní', images: [] },
        ]

        if (galleryBlockIdx === -1) {
          currentLayout.push({
            blockType: 'gallery',
            tabs: defaultTabs,
          })
          galleryBlockIdx = currentLayout.length - 1
        }

        const galleryBlock = { ...currentLayout[galleryBlockIdx] }
        const tabs: any[] = galleryBlock.tabs && galleryBlock.tabs.length > 0 ? [...galleryBlock.tabs] : defaultTabs

        const catLower = String(categoria || '').toLowerCase()
        let targetTabIdx = 0
        if (catLower.includes('feri') || catLower.includes('evento') || catLower.includes('pop')) {
          targetTabIdx = tabs.findIndex((t) => t.tabTitle?.toLowerCase().includes('feri'))
        } else if (catLower.includes('taller') && !catLower.includes('shirley')) {
          targetTabIdx = tabs.findIndex((t) => t.tabTitle?.toLowerCase().includes('talleres'))
        } else if (catLower.includes('shirley') || catLower.includes('cread') || catLower.includes('espacio')) {
          targetTabIdx = tabs.findIndex((t) => t.tabTitle?.toLowerCase().includes('shirley'))
        } else {
          targetTabIdx = tabs.findIndex((t) => t.tabTitle?.toLowerCase().includes('client'))
        }

        if (targetTabIdx === -1) targetTabIdx = 0
        const targetTab = { ...tabs[targetTabIdx] }
        targetTab.images = [...(targetTab.images || [])]

        const newImageItem: Record<string, any> = {
          title: cleanTitle,
          category: targetTab.tabTitle,
          isFeatured: Boolean(esDestacada),
          ...(descripcion ? { description: String(descripcion).trim() } : {}),
          ...(mediaId ? { image: mediaId } : {}),
          ...(urlFoto ? { imageUrl: urlFoto } : {}),
        }

        targetTab.images.push(newImageItem)
        tabs[targetTabIdx] = targetTab
        galleryBlock.tabs = tabs
        currentLayout[galleryBlockIdx] = galleryBlock

        await payload.update({
          collection: 'pages',
          id: page.id,
          data: { layout: currentLayout },
          overrideAccess: true,
        })

        return `¡Listo Shirley! La foto "${cleanTitle}" fue agregada exitosamente a la galería en la sección "${targetTab.tabTitle}" y ya se puede ver en la web (/galeria) ✨📸`
      }

      case 'listarFotosGaleria': {
        const homeRes = await payload.find({
          collection: 'pages',
          where: {
            or: [{ slug: { equals: 'home' } }, { slug: { equals: 'inicio' } }],
          },
          depth: 1,
          overrideAccess: true,
          limit: 1,
        })

        const page = homeRes.docs[0]
        const galleryBlock = (page?.layout as any[])?.find((b) => b.blockType === 'gallery')
        const tabs = galleryBlock?.tabs || []

        if (!tabs.length) {
          return 'No hay fotografías registradas aún en la galería del CMS. Puedes agregar una enviándome una foto y diciendo "agrega esta foto a clientas con título..." 📸'
        }

        const catFilter = String(args.categoria || '').toLowerCase()
        const sections: string[] = []

        for (const tab of tabs) {
          const tabTitle = tab.tabTitle || 'Sin título'
          if (catFilter && !tabTitle.toLowerCase().includes(catFilter)) continue

          const images = tab.images || []
          const imgList = images.length > 0
            ? images.map((img: any, i: number) => `   ${i + 1}. 📷 ${img.title || 'Momento'}${img.isFeatured ? ' (Destacada)' : ''}`).join('\n')
            : '   (Sin fotos cargadas)'

          sections.push(`📌 ${tabTitle} (${images.length} fotos):\n${imgList}`)
        }

        return `Galería Nenúfar (/galeria):\n\n${sections.join('\n\n')}`
      }

      case 'eliminarFotoGaleria': {
        const { titulo, categoria } = args
        const cleanTitle = String(titulo || '').toLowerCase().trim()
        if (!cleanTitle) {
          return 'Shirley, por favor indícame el título de la foto que deseas eliminar de la galería.'
        }

        const homeRes = await payload.find({
          collection: 'pages',
          where: {
            or: [{ slug: { equals: 'home' } }, { slug: { equals: 'inicio' } }],
          },
          depth: 0,
          overrideAccess: true,
          limit: 1,
        })

        const page = homeRes.docs[0]
        if (!page) return 'No encontré la página principal en la base de datos.'

        const currentLayout = [...((page.layout as any[]) || [])]
        const galleryBlockIdx = currentLayout.findIndex((b) => b.blockType === 'gallery')
        if (galleryBlockIdx === -1) return 'No hay galería configurada en la página principal.'

        const galleryBlock = { ...currentLayout[galleryBlockIdx] }
        const tabs = [...(galleryBlock.tabs || [])]
        let removedTitle = ''
        let tabFound = ''

        for (let tIdx = 0; tIdx < tabs.length; tIdx++) {
          const tab = { ...tabs[tIdx] }
          const images = [...(tab.images || [])]
          const imgIdx = images.findIndex((img: any) =>
            (img.title || '').toLowerCase().includes(cleanTitle),
          )

          if (imgIdx !== -1) {
            removedTitle = images[imgIdx].title || 'la foto'
            tabFound = tab.tabTitle
            images.splice(imgIdx, 1)
            tab.images = images
            tabs[tIdx] = tab
            break
          }
        }

        if (!removedTitle) {
          return `No encontré ninguna foto en la galería con el título "${titulo}".`
        }

        galleryBlock.tabs = tabs
        currentLayout[galleryBlockIdx] = galleryBlock

        await payload.update({
          collection: 'pages',
          id: page.id,
          data: { layout: currentLayout },
          overrideAccess: true,
        })

        return `¡Listo Shirley! Eliminé "${removedTitle}" de la sección "${tabFound}" de tu galería 🗑️✨`
      }

      // ─── 4. TALLERES & TESTIMONIOS ────────────────────────────────────────
      case 'publicarEvento': {
        const { titulo, fecha, lugar, descripcion, tipo } = args
        const parsed = new Date(fecha)
        await payload.create({
          collection: 'events',
          data: {
            title: titulo,
            date: Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
            type: tipo || 'taller',
            location: lugar || 'Cartagena de Indias',
            description: descripcion || '',
            _status: 'published',
          } as any,
          draft: false,
          overrideAccess: true,
        })
        const tipoLabel = tipo === 'feria' ? 'Feria Artesanal' : 'Taller Artesanal'
        return `¡Listo Shirley! "${titulo}" (${tipoLabel}) ya está publicado y visible en la sección de talleres de tu tienda ✨`
      }

      case 'listarEventos': {
        const { fetchGoogleCalendarEvents } = await import('@/lib/google-calendar')
        const gcalRes = await fetchGoogleCalendarEvents()
        if (gcalRes.events && gcalRes.events.length > 0) {
          const lines = gcalRes.events.map((e) => {
            const d = e.date
              ? new Date(e.date).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Sin fecha'
            const tipo =
              e.type === 'taller'
                ? 'Taller Artesanal'
                : e.type === 'pop-up'
                ? 'Pop-Up'
                : 'Feria Artesanal'
            const emoji = e.type === 'taller' ? '🪡' : e.type === 'pop-up' ? '✨' : '🎪'
            return `${emoji} ${e.title} (${tipo})\n   📅 ${d}\n   📍 ${e.location || 'Cartagena de Indias'}`
          })
          return `Tienes ${gcalRes.events.length} evento(s) sincronizado(s) directamente desde tu Google Calendar:\n\n${lines.join('\n\n')}`
        }

        const result = await payload.find({
          collection: 'events',
          depth: 0,
          limit: 20,
          overrideAccess: true,
          sort: '-date',
        })
        if (result.docs.length === 0) {
          return 'No hay talleres ni ferias programados actualmente en la tienda ni en tu Google Calendar.'
        }
        const lines = result.docs.map((e: any) => {
          const d = e.date ? new Date(e.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'
          const tipo = e.type === 'feria' ? 'Feria Artesanal' : 'Taller Artesanal'
          const emoji = e.type === 'feria' ? '🎪' : '🪡'
          return `${emoji} ${e.title} (${tipo})\n   📅 ${d}\n   📍 ${e.location || 'Cartagena de Indias'}`
        })
        return `Tienes ${result.docs.length} actividad(es) programada(s) en la tienda:\n\n${lines.join('\n\n')}`
      }

      case 'eliminarEvento': {
        const { eventoId, titulo } = args
        let targetId = eventoId ? Number(eventoId) : null

        if (!targetId && titulo) {
          const match = await payload.find({
            collection: 'events',
            where: {
              title: { like: titulo },
            },
            limit: 1,
            overrideAccess: true,
          })
          if (match.docs.length > 0) {
            targetId = Number(match.docs[0].id)
          }
        }

        if (!targetId) {
          return `No encontré ningún taller o feria con ${eventoId ? `el número ${eventoId}` : `el nombre "${titulo}"`}.`
        }

        const deleted = await payload.delete({
          collection: 'events',
          id: targetId,
          overrideAccess: true,
        })

        return `¡Listo Shirley! Eliminé "${deleted?.title || 'la actividad'}" de tu tienda 🗑️✨`
      }

      case 'crearTestimonio': {
        const { nombre, testimonio, rol, calificacion, mediaId } = args
        await payload.create({
          collection: 'testimonials',
          data: {
            authorName: nombre,
            quote: testimonio,
            ...(rol ? { authorRole: rol } : {}),
            ...(calificacion ? { rating: Number(calificacion) } : { rating: 5 }),
            ...(mediaId ? { avatar: mediaId } : {}),
            _status: 'published',
          } as any,
          draft: false,
          overrideAccess: true,
        })
        return `¡Listo Shirley! El testimonio de "${nombre}" fue publicado exitosamente en tu página de inicio ✨`
      }

      case 'listarTestimonios': {
        const res = await payload.find({
          collection: 'testimonials',
          limit: 10,
          overrideAccess: true,
          where: { _status: { equals: 'published' } },
          sort: '-createdAt',
        })
        if (res.docs.length === 0) return 'Aún no hay testimonios publicados en la tienda.'
        const lines = res.docs.map((d: any) => `⭐ ${d.authorName} (${d.authorRole || 'Clienta'}): "${d.quote.slice(0, 70)}..."`)
        return `Tienes ${res.docs.length} testimonio(s) en la tienda:\n\n${lines.join('\n\n')}`
      }

      case 'eliminarTestimonio': {
        const { nombre } = args
        const match = await payload.find({
          collection: 'testimonials',
          where: {
            authorName: { like: nombre },
          },
          limit: 1,
          overrideAccess: true,
        })
        if (match.docs.length === 0) {
          return `No encontré ningún testimonio a nombre de "${nombre}".`
        }
        await payload.delete({
          collection: 'testimonials',
          id: match.docs[0].id,
          overrideAccess: true,
        })
        return `¡Listo Shirley! Eliminé el testimonio de "${match.docs[0].authorName}" de tu página de inicio ✨`
      }

      // ─── 5. COPYWRITING DE VENTAS & MARKETING (ALTA CONVERSIÓN · ANTI-SLOP) ──
      case 'generarCopyProducto': {
        const { slug, nombrePieza, materialesOTecnica, ocasionOEstilo } = args
        let product: ProductWithSlug | null = null
        if (slug) {
          product = await findProductBySlug(payload, slug)
        }
        const titulo = product?.title || nombrePieza || 'Joya de Autor Nenúfar'
        const precio = product ? formatCOP(product.priceInCOP) : ''
        const tecnica = materialesOTecnica || 'micro-mostacilla checa calibrada e hilo técnico resistente a la humedad'
        const estilo = ocasionOEstilo || 'impacto visual protagónico pero ultra liviano, cómodo para usar de la mañana a la noche'
        const productSlug = product?.slug || slugify(titulo)

        const propuesta = [
          `📄 Ficha de descripción para /products/${productSlug}:`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ``,
          `${titulo} está tejida a mano punto por punto por Shirley en su taller de Cartagena utilizando ${tecnica}. Diseñada para ${estilo}, sus terminaciones cuidadas aseguran que la pieza conserve su forma, color y brillo intacto con el paso del tiempo.`,
          ``,
          `✨ Por qué te va a encantar:`,
          `• Comodidad total: ultraliviana (menos de 15 gramos), olvídate del dolor de orejas al final de tu evento o jornada.`,
          `• Cero alergias: postes y herrajes 100% libres de níquel, aptos para pieles reactivas y sensibles.`,
          `• Resistencia real: tejida con hilo técnico que no se deforma ni se altera con el calor ni la humedad.`,
          `• Exclusividad artesanal: producida en tirajes cortos de 3 a 5 piezas por lote.`,
          `• Origen local: joyería de autor confeccionada en Cartagena de Indias.`,
          ``,
          `📦 Haz tu pedido desde la tienda web y Shirley coordinará contigo el pago (Nequi, Daviplata o Bancolombia) y el despacho seguro a tu ciudad. Cada pieza sale empacada para regalo con tarjeta de origen artesanal.`,
          ...(precio ? [``, `🏷️ Valor: ${precio}`] : []),
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `💡 Di: "actualiza la descripción de ${productSlug} con este texto" para publicarla en el catálogo.`,
        ].join('\n')

        return propuesta
      }

      case 'actualizarDescripcionProducto': {
        const { slug, descripcion } = args
        const product = await findProductBySlug(payload, slug)
        if (!product) return `No encontré ningún producto con el slug "${slug}".`

        const lexical = textToLexical(descripcion)
        await payload.update({
          collection: 'products',
          id: product.id,
          data: {
            description: lexical as any,
          },
          overrideAccess: true,
        })

        return `¡Listo Shirley! La descripción de "${product.title}" ha sido actualizada en la tienda web (/products/${product.slug || slug}) ✨`
      }

      case 'generarCopyLanding': {
        const { seccion = 'hero', enfoque } = args
        const motivo = enfoque || 'joyería tejida a mano en Cartagena'

        if (seccion === 'hero') {
          return [
            `🎯 Propuestas de Ventas para el Hero Principal (Enfocadas en Conversión & Beneficio):`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `Opción 1 (Impacto Visual + Confort Insuperable):`,
            `• Titular: Joyería en mostacilla tejida a mano en Cartagena`,
            `• Bajada: Diseños llamativos que no pesan. Aretes y collares de autor confeccionados punto por punto con micro-mostacilla checa y acabados que cuidan tu piel.`,
            `• Botón: Comprar joyas disponibles → /shop`,
            ``,
            `Opción 2 (Diferenciación & Exclusividad de Lote):`,
            `• Titular: El arte del tejido artesanal en la piel`,
            `• Bajada: Piezas singulares elaboradas pacientemente en el taller de Getsemaní en lotes limitados que transforman cualquier atuendo.`,
            `• Botón: Explorar piezas de edición limitada → /shop`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ].join('\n')
        }

        if (seccion === 'cta') {
          return [
            `🎯 Copys de Ventas para Pedidos Personalizados (Generar Lead & Encargo):`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `Opción 1 (Combinación a tu medida):`,
            `• Titular: ¿Buscas el accesorio exacto para tu vestido?`,
            `• Bajada: Shirley confecciona piezas por encargo adaptando medidas, tonos y cierres según tu ocasión o evento.`,
            `• Botón: Diseñar mi joya con Shirley → WhatsApp`,
            ``,
            `Opción 2 (Regalos memorables con historia):`,
            `• Titular: Joyas tejidas por encargo a tu medida`,
            `• Bajada: Un detalle irrepetible tejido especialmente para ti o para quien más quieres, con empaque especial listo para sorprender.`,
            `• Botón: Cotizar pedido personalizado`,
          ].join('\n')
        }

        return [
          `🎯 Mensaje de Venta para sección "${seccion}" (${motivo}):`,
          `• Titular: Hechas para acompañarte todo el día sin incomodar`,
          `• Cuerpo: Combinamos la paciencia del tejido tradicional con materiales técnicos modernos. Cada joya se teje con micro-mostacilla checa calibrada e hilo ultrarresistente que no se vence ni despinta. Una joya protagonista que pesa menos de una moneda.`,
          `• Cierre: Haz tu pedido online sin intermediarios y recíbelo asegurado en tu puerta.`
        ].join('\n')
      }

      // ─── 6. MONITOREO DE ALMACENAMIENTO (SUPABASE 1 GB GRATIS) ─────────────
      case 'consultarAlmacenamientoFotos': {
        const limite = Number(args?.limiteFotos) || 5
        const stats = await getMediaStorageStats(payload, limite)
        return formatStorageReport(stats)
      }

      default:
        return `Herramienta "${toolName}" no reconocida.`
    }
  } catch (err) {
    payload.logger.error({ msg: `[shirley-agent] Error ejecutando ${toolName}`, err })
    return `Ocurrió un inconveniente ejecutando ${toolName}. Puedes verificar directamente en /admin.`
  }
}

