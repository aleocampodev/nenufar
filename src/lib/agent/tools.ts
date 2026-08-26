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

export interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

/** Producto con slug casteado — `slug` se perdió del tipo generado (bug pre-existente). */
type ProductWithSlug = {
  id: number
  title?: string
  slug?: string
  priceInCOP?: number | null
  inventory?: number | null
  featured?: boolean | null
}

const formatCOP = (n: number | null | undefined): string =>
  typeof n === 'number'
    ? new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(n)
    : 'precio por confirmar'

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

async function getHomePage(payload: Payload) {
  const result = await payload.find({
    collection: 'pages',
    limit: 1,
    depth: 1,
    overrideAccess: true,
    where: {
      or: [
        { slug: { equals: 'home' } },
        { slug: { equals: 'inicio' } },
      ],
    },
  })
  return result.docs[0] || null
}

/**
 * Definiciones de herramientas para el API de Anthropic / LiteLLM.
 */
export const ANTHROPIC_SHIRLEY_TOOLS: ToolDefinition[] = [
  // ─── 1. CATÁLOGO & JOYAS ───────────────────────────────────────────────
  {
    name: 'buscarProducto',
    description:
      'Busca piezas de joyería en el catálogo real de Nenúfar por nombre o palabra clave. ' +
      'Devuelve solo piezas que existen en la base de datos.',
    input_schema: {
      type: 'object',
      properties: {
        consulta: {
          type: 'string',
          description: 'Palabra clave, ej. "aretes", "collar de mostacilla", "pulsera"',
        },
      },
      required: ['consulta'],
    },
  },
  {
    name: 'crearProductoDraft',
    description:
      'Crea una joya nueva. Puede guardarse como borrador o publicarse de inmediato en la tienda web (/shop). ' +
      'Si Shirley envía una foto por Telegram, se vincula automáticamente.',
    input_schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Nombre de la pieza, ej. "Collar Filigrana Atardecer"',
        },
        precioCOP: {
          type: 'number',
          description: 'Precio en pesos colombianos sin decimales (ej. 45000)',
        },
        inventario: {
          type: 'number',
          description: 'Cantidad de unidades disponibles (ej. 5)',
        },
        publicar: {
          type: 'boolean',
          description: 'true para publicarlo de inmediato en la tienda web, false para dejarlo en borrador',
        },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'publicarProducto',
    description:
      'Publica o cambia a borrador un producto existente para que sea visible (o invisible) en la tienda web (/shop).',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug o identificador del producto a publicar o despublicar',
        },
        publicar: {
          type: 'boolean',
          description: 'true para publicar (por defecto), false para cambiar a borrador',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'actualizarInventario',
    description:
      'Actualiza el inventario (unidades disponibles) y/o el precio en COP de una joya por su slug.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug del producto',
        },
        inventario: {
          type: 'number',
          description: 'Nueva cantidad de unidades disponibles',
        },
        precioCOP: {
          type: 'number',
          description: 'Nuevo precio en pesos colombianos, sin decimales',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'destacarProducto',
    description:
      'Marca o desmarca un producto como destacado en la tienda web y la landing.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug del producto',
        },
        destacado: {
          type: 'boolean',
          description: 'true para destacar, false para quitar destaque',
        },
      },
      required: ['slug'],
    },
  },

  // ─── 2. GESTIÓN DE LA LANDING PAGE & FOTOS ────────────────────────────
  {
    name: 'actualizarFotoLanding',
    description:
      'Cambia la foto de una sección de la landing page (ej. "tradicion" para la pieza central de Tradición y Delicadeza, o "historia" para la foto del taller en Nuestra Historia). ' +
      'Requiere que Shirley envíe una foto por Telegram.',
    input_schema: {
      type: 'object',
      properties: {
        seccion: {
          type: 'string',
          enum: ['tradicion', 'historia'],
          description: 'Sección a actualizar: "tradicion" (beneficios) o "historia" (taller Shirley)',
        },
      },
      required: ['seccion'],
    },
  },
  {
    name: 'agregarSlideHero',
    description:
      'Agrega una nueva diapositiva al carrusel principal superior (slider) de la landing page. ' +
      'Usa la foto enviada por Telegram y los textos indicados.',
    input_schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Título grande del slide (ej. "Nueva Colección Caribeña")',
        },
        subtitulo: {
          type: 'string',
          description: 'Texto descriptivo secundario del slide',
        },
        botonTexto: {
          type: 'string',
          description: 'Texto del botón de acción (ej. "Explorar Colección", por defecto "Ver Catálogo")',
        },
        botonUrl: {
          type: 'string',
          description: 'Enlace del botón (por defecto "/shop")',
        },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'listarSlidesHero',
    description:
      'Lista todas las diapositivas activas en el carrusel superior de la landing page de inicio.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'eliminarSlideHero',
    description:
      'Elimina una diapositiva del carrusel superior de la landing page por su número de posición (1, 2, 3...).',
    input_schema: {
      type: 'object',
      properties: {
        posicion: {
          type: 'number',
          description: 'Número de la diapositiva a eliminar (1 para la primera, 2 para la segunda, etc.)',
        },
      },
      required: ['posicion'],
    },
  },

  // ─── 3. PEDIDOS ───────────────────────────────────────────────────────
  {
    name: 'pedidosPendientes',
    description:
      'Lista los pedidos de la web pendientes de confirmación o pago (estado processing).',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'confirmarPedido',
    description:
      'Marca un pedido como completado (completed) tras coordinar el pago y envío con la compradora.',
    input_schema: {
      type: 'object',
      properties: {
        pedidoId: {
          type: 'number',
          description: 'Número (ID) del pedido a confirmar',
        },
      },
      required: ['pedidoId'],
    },
  },

  // ─── 4. TALLERES, FERIAS & TESTIMONIOS ────────────────────────────────
  {
    name: 'publicarEvento',
    description:
      'Agenda un taller, feria o pop-up en Cartagena para la sección "Próximos Talleres y Ferias" de la landing.',
    input_schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Nombre del taller o feria',
        },
        fecha: {
          type: 'string',
          description: 'Fecha y hora en formato ISO o texto claro (ej. "2026-09-15T10:00:00-05:00")',
        },
        lugar: {
          type: 'string',
          description: 'Lugar en Cartagena (ej. "Getsemaní, Taller Shirley")',
        },
        descripcion: {
          type: 'string',
          description: 'Descripción breve de la actividad',
        },
        tipo: {
          type: 'string',
          enum: ['taller', 'feria', 'pop-up'],
          description: 'Tipo de evento: taller, feria o pop-up',
        },
      },
      required: ['titulo', 'fecha'],
    },
  },
  {
    name: 'crearTestimonio',
    description:
      'Guarda un testimonio de compradora con su foto para la sección de testimonios de la landing.',
    input_schema: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre de la clienta (ej. "María José")',
        },
        testimonio: {
          type: 'string',
          description: 'Cita textual u opinión sobre sus joyas',
        },
        rol: {
          type: 'string',
          description: 'Ciudad u origen (ej. "Cartagena" o "Bogotá")',
        },
        calificacion: {
          type: 'number',
          description: 'Calificación de 1 a 5 estrellas',
        },
      },
      required: ['nombre', 'testimonio'],
    },
  },
  {
    name: 'listarTestimonios',
    description: 'Lista los testimonios publicados en la landing.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
]

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
          const stock = typeof p.inventory === 'number' && p.inventory <= 0 ? ' — (SIN stock)' : ` (${p.inventory ?? 0} disp.)`
          return `• ${p.title} — ${formatCOP(p.priceInCOP)}${stock} [/products/${p.slug}]`
        })
        return `Encontré ${result.docs.length} pieza(s) en el catálogo:\n${lines.join('\n')}`
      }

      case 'crearProductoDraft': {
        const { titulo, precioCOP, inventario, publicar, mediaId } = args
        const shouldPublish = Boolean(publicar)
        const doc = await payload.create({
          collection: 'products',
          data: {
            title: titulo,
            ...(precioCOP !== undefined ? { priceInCOPEnabled: true, priceInCOP: Number(precioCOP) } : {}),
            ...(inventario !== undefined ? { inventory: Number(inventario) } : {}),
            ...(mediaId ? { images: [{ image: mediaId }] } : {}),
            _status: shouldPublish ? 'published' : 'draft',
          } as any,
          draft: !shouldPublish,
          overrideAccess: true,
        })
        return shouldPublish
          ? `¡Listo Shirley! Joya "${titulo}" creada y publicada exitosamente en el catálogo (/shop) con precio ${formatCOP(precioCOP)} ✨`
          : `Joya "${titulo}" guardada como borrador (#${doc.id}) con precio ${formatCOP(precioCOP)}. Puedes publicarla cuando quieras diciendo "publicar ${titulo}".`
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

      // ─── 2. GESTIÓN DE LA LANDING PAGE & FOTOS ────────────────────────────
      case 'actualizarFotoLanding': {
        const { seccion, mediaId } = args
        if (!mediaId) {
          return 'Shirley, adjúntame la foto por Telegram junto con el mensaje para actualizar la sección.'
        }
        const homePage = await getHomePage(payload)
        if (!homePage) return 'No encontré la página de Inicio en la base de datos.'

        const layout = [...((homePage.layout || []) as any[])]
        let actualizada = false

        if (seccion === 'tradicion') {
          const idx = layout.findIndex((b) => b.blockType === 'features')
          if (idx >= 0) {
            layout[idx] = { ...layout[idx], centerImage: mediaId }
            actualizada = true
          }
        } else if (seccion === 'historia') {
          const idx = layout.findIndex((b) => b.blockType === 'nenufarStory')
          if (idx >= 0) {
            layout[idx] = { ...layout[idx], image: mediaId }
            actualizada = true
          }
        }

        if (!actualizada) {
          return `No encontré la sección "${seccion}" en la landing page para actualizar su foto.`
        }

        await payload.update({
          collection: 'pages',
          id: homePage.id,
          data: { layout, _status: 'published' } as any,
          overrideAccess: true,
        })

        return `¡Foto de la sección "${seccion === 'tradicion' ? 'Tradición y Delicadeza' : 'Nuestra Historia'}" actualizada exitosamente en la landing! ✨ Puedes verla en vivo en la web.`
      }

      case 'agregarSlideHero': {
        const { titulo, subtitulo, botonTexto, botonUrl, mediaId } = args
        const homePage = await getHomePage(payload)
        if (!homePage) return 'No encontré la página de Inicio en la base de datos.'

        const currentHero = (homePage.hero || {}) as any
        const currentSlides = Array.isArray(currentHero.slides) ? [...currentHero.slides] : []

        const newSlide = {
          heading: titulo,
          subheading: subtitulo || '',
          linkLabel: botonTexto || 'Ver Colección',
          linkUrl: botonUrl || '/shop',
          ...(mediaId ? { image: mediaId } : {}),
        }

        currentSlides.push(newSlide)

        await payload.update({
          collection: 'pages',
          id: homePage.id,
          data: {
            hero: {
              ...currentHero,
              type: 'slider',
              slides: currentSlides,
            },
            _status: 'published',
          } as any,
          overrideAccess: true,
        })

        return `¡Listo Shirley! El nuevo slide "${titulo}" fue agregado al carrusel de la landing page (Total slides: ${currentSlides.length}) ✨`
      }

      case 'listarSlidesHero': {
        const homePage = await getHomePage(payload)
        if (!homePage) return 'No encontré la página de Inicio.'
        const slides = (homePage.hero as any)?.slides || []
        if (slides.length === 0) return 'El carrusel principal no tiene diapositivas actualmente.'

        const list = slides.map((s: any, i: number) => {
          const imgStatus = s.image ? '📸 Con foto' : '⚠️ Sin foto'
          return `${i + 1}. "${s.heading || 'Sin título'}" — ${imgStatus} (Botón: ${s.linkLabel || 'Ver'})`
        })
        return `Carrusel Principal (${slides.length} slides):\n${list.join('\n')}`
      }

      case 'eliminarSlideHero': {
        const { posicion } = args
        const index = Number(posicion) - 1
        const homePage = await getHomePage(payload)
        if (!homePage) return 'No encontré la página de Inicio.'
        const currentHero = (homePage.hero || {}) as any
        const currentSlides = Array.isArray(currentHero.slides) ? [...currentHero.slides] : []

        if (index < 0 || index >= currentSlides.length) {
          return `La posición ${posicion} no existe. Actualmente hay ${currentSlides.length} diapositivas.`
        }

        const removed = currentSlides.splice(index, 1)[0]
        await payload.update({
          collection: 'pages',
          id: homePage.id,
          data: {
            hero: { ...currentHero, slides: currentSlides },
            _status: 'published',
          } as any,
          overrideAccess: true,
        })

        return `Diapositiva "${removed.heading || posicion}" eliminada del carrusel. Quedan ${currentSlides.length} slides.`
      }

      // ─── 3. PEDIDOS ───────────────────────────────────────────────────────
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
          return `• Pedido #${o.id} — ${formatCOP(o.amount)} — ${o.customerEmail || 'Sin email'}\n  📦 ${items || 'Sin items'}`
        })
        return `Tienes ${result.docs.length} pedido(s) pendiente(s):\n${lines.join('\n')}`
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

      // ─── 4. TALLERES & TESTIMONIOS ────────────────────────────────────────
      case 'publicarEvento': {
        const { titulo, fecha, lugar, descripcion, tipo } = args
        const parsed = new Date(fecha)
        const event = await payload.create({
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
        return `¡Evento publicado! "${titulo}" (${tipo || 'taller'}) ya aparece en la sección de talleres de la landing ✨ (#${event.id})`
      }

      case 'crearTestimonio': {
        const { nombre, testimonio, rol, calificacion, mediaId } = args
        const doc = await payload.create({
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
        return `Testimonio de "${nombre}" publicado en la landing exitosamente ✨ (#${doc.id})`
      }

      case 'listarTestimonios': {
        const res = await payload.find({
          collection: 'testimonials',
          limit: 10,
          overrideAccess: true,
          where: { _status: { equals: 'published' } },
          sort: '-createdAt',
        })
        if (res.docs.length === 0) return 'Aún no hay testimonios publicados en la landing.'
        const lines = res.docs.map((d: any) => `• #${d.id} — ${d.authorName}: "${d.quote.slice(0, 60)}..."`)
        return `Testimonios publicados (${res.docs.length}):\n${lines.join('\n')}`
      }

      default:
        return `Herramienta "${toolName}" no reconocida.`
    }
  } catch (err) {
    payload.logger.error({ msg: `[shirley-agent] Error ejecutando ${toolName}`, err })
    return `Ocurrió un inconveniente ejecutando ${toolName}. Puedes verificar directamente en /admin.`
  }
}

