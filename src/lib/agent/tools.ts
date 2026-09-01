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
        categoria: {
          type: 'string',
          description: 'Nombre de la categoría opcional a la que pertenece la joya (ej. "Aretes", "Collares", "Pulseras"). Si no existe se creará automáticamente.',
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
  {
    name: 'crearCategoria',
    description:
      'Crea una nueva categoría en el catálogo de joyas (ej. "Aretes", "Collares", "Pulseras", "Tobilleras", "Anillos"). ' +
      'Permite clasificar las piezas y habilitar filtros automáticos en la tienda web (/shop).',
    input_schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Nombre de la categoría, ej. "Tobilleras", "Aretes", "Collares", "Pulseras"',
        },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'listarCategorias',
    description:
      'Lista todas las categorías de joyas registradas en el catálogo con el número de piezas asociadas.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'asignarCategoriaProducto',
    description:
      'Asigna o vincula una categoría a una joya existente del catálogo por su slug o nombre.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug o identificador del producto al que se le asignará la categoría',
        },
        categoria: {
          type: 'string',
          description: 'Nombre o título de la categoría a asignar (ej. "Aretes", "Collares", "Pulseras")',
        },
      },
      required: ['slug', 'categoria'],
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
    name: 'actualizarVideoTaller',
    description:
      'Actualiza el video vertical (formato celular 9:16) y texto de la sección "Talleres en Vivo & Próximas Ferias" de la landing page. ' +
      'Requiere que Shirley envíe un video por Telegram.',
    input_schema: {
      type: 'object',
      properties: {
        pieDeVideo: {
          type: 'string',
          description: 'Texto o frase descriptiva opcional al pie del video (ej. "El arte de tejer paciencia: experiencia vivencial en Getsemaní con Shirley.")',
        },
      },
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

  // ─── 5. COPYWRITING, CATÁLOGO, LANDING & REDES ─────────────────────────
  {
    name: 'generarCopyProducto',
    description:
      'Genera propuestas de textos persuasivos y atractivos para una joya (título llamativo, historia artesanal en Cartagena, descripción de materiales y llamado a la acción). ' +
      'Puede basarse en un producto existente por su slug o en los detalles que Shirley indique.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug del producto existente (opcional si se indican nombre o características)',
        },
        nombrePieza: {
          type: 'string',
          description: 'Nombre de la joya o tipo de accesorio (ej. "Aretes Filigrana Caribe")',
        },
        materialesOTecnica: {
          type: 'string',
          description: 'Técnica o materiales (ej. "mostacilla checa calibrada, tejido a mano, hilos de colores")',
        },
        ocasionOEstilo: {
          type: 'string',
          description: 'Ocasión o estilo (ej. "uso diario liviano", "fiesta", "regalo especial")',
        },
      },
    },
  },
  {
    name: 'actualizarDescripcionProducto',
    description:
      'Guarda o actualiza la descripción y narrativa artesanal de una joya en el catálogo web (/products/[slug]).',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug de la joya a actualizar',
        },
        descripcion: {
          type: 'string',
          description: 'Texto completo de la descripción de la pieza para el catálogo',
        },
      },
      required: ['slug', 'descripcion'],
    },
  },
  {
    name: 'generarCopyLanding',
    description:
      'Genera copys atractivos y persuasivos para secciones de la landing page web (carrusel Hero, bloque de historia, llamada a la acción CTA o banner promocional).',
    input_schema: {
      type: 'object',
      properties: {
        seccion: {
          type: 'string',
          enum: ['hero', 'cta', 'historia', 'taller'],
          description: 'Sección de la web para la que se redacta el texto',
        },
        enfoque: {
          type: 'string',
          description: 'Tema o motivo (ej. "nueva colección", "descuento especial", "invitación a taller presencial", "joyas personalizadas por encargo")',
        },
      },
      required: ['seccion'],
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
        const { titulo, precioCOP, inventario, publicar, mediaId, categoria } = args
        const shouldPublish = Boolean(publicar)
        let categoryIds: number[] = []

        if (categoria) {
          const { doc: catDoc } = await findOrCreateCategory(payload, String(categoria))
          categoryIds = [catDoc.id]
        }

        const doc = await payload.create({
          collection: 'products',
          data: {
            title: titulo,
            ...(precioCOP !== undefined ? { priceInCOPEnabled: true, priceInCOP: Number(precioCOP) } : {}),
            ...(inventario !== undefined ? { inventory: Number(inventario) } : {}),
            ...(mediaId ? { images: [{ image: mediaId }] } : {}),
            ...(categoryIds.length > 0 ? { categories: categoryIds } : {}),
            _status: shouldPublish ? 'published' : 'draft',
          } as any,
          draft: !shouldPublish,
          overrideAccess: true,
        })
        const catMsg = categoryIds.length > 0 ? ` en la categoría "${categoria}"` : ''
        return shouldPublish
          ? `¡Listo Shirley! Joya "${titulo}" creada y publicada exitosamente en el catálogo (/shop)${catMsg} con precio ${formatCOP(precioCOP)} ✨`
          : `Joya "${titulo}" guardada como borrador (#${doc.id})${catMsg} con precio ${formatCOP(precioCOP)}. Puedes publicarla cuando quieras diciendo "publicar ${titulo}".`
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

        const lines: string[] = []
        for (const cat of categoriesRes.docs) {
          const countRes = await payload.find({
            collection: 'products',
            limit: 0,
            depth: 0,
            overrideAccess: true,
            where: {
              categories: {
                contains: cat.id,
              },
            },
          })
          const count = countRes.totalDocs
          lines.push(`• ${cat.title} (${count} ${count === 1 ? 'joya' : 'joyas'})`)
        }

        return `Categorías en el catálogo (${categoriesRes.docs.length}):\n${lines.join('\n')}`
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

      case 'actualizarVideoTaller': {
        const { pieDeVideo, mediaId } = args
        if (!mediaId) {
          return 'Shirley, por favor adjúntame el video por Telegram junto con el mensaje para actualizar la sección de Talleres y Ferias.'
        }
        const homePage = await getHomePage(payload)
        if (!homePage) return 'No encontré la página de Inicio en la base de datos.'

        const layout = [...((homePage.layout || []) as any[])]
        const idx = layout.findIndex((b) => b.blockType === 'upcomingEvents')

        if (idx >= 0) {
          layout[idx] = {
            ...layout[idx],
            video: mediaId,
            ...(pieDeVideo ? { videoCaption: pieDeVideo } : {}),
          }
        } else {
          layout.push({
            blockType: 'upcomingEvents',
            tagline: 'EXPERIENCIAS & ENCUENTROS',
            title: 'Talleres en Vivo & Próximas Ferias en Cartagena',
            description: 'Vive el arte de tejer mostacilla en nuestro taller o encuéntranos en las ferias artesanales del Centro Histórico.',
            video: mediaId,
            videoCaption: pieDeVideo || 'El arte de tejer paciencia: experiencia vivencial en Cartagena con Shirley.',
          })
        }

        await payload.update({
          collection: 'pages',
          id: homePage.id,
          data: { layout, _status: 'published' } as any,
          overrideAccess: true,
        })

        return '¡Video de Talleres y Ferias actualizado exitosamente en la landing page! ✨ Ya los visitantes pueden ver la experiencia vivencial en la web.'
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

      // ─── 5. COPYWRITING, CATÁLOGO, LANDING & REDES ─────────────────────────
      case 'generarCopyProducto': {
        const { slug, nombrePieza, materialesOTecnica, ocasionOEstilo } = args
        let product: ProductWithSlug | null = null
        if (slug) {
          product = await findProductBySlug(payload, slug)
        }
        const titulo = product?.title || nombrePieza || 'Joya Artesanal Nénufar'
        const precio = product ? formatCOP(product.priceInCOP) : ''
        const tecnica = materialesOTecnica || 'mostacilla checa calibrada e hilos de alta resistencia tejidos a mano'
        const estilo = ocasionOEstilo || 'ideal para lucir con elegancia y autenticidad en cualquier ocasión'

        const propuesta = [
          `✨ Propuesta de Copy para Catálogo & Web:`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `💎 Título sugerido: ${titulo}`,
          ...(precio ? [`🏷️ Precio: ${precio}`] : []),
          ``,
          `📖 Descripción para la ficha del producto:`,
          `"${titulo} es una pieza única elaborada 100% a mano por Shirley en Cartagena de Indias. Creada mediante ${tecnica}, combina la tradición artesanal colombiana con un diseño contemporáneo, ${estilo}.`,
          ``,
          `• Ultraliviana y cómoda para llevar todo el día.`,
          `• Acabados hipoalergénicos pensados para proteger tu piel.`,
          `• Cada detalle cuenta una historia irrepetible y llena de calidez caribeña."`,
          ``,
          `🎯 Llamado a la acción (CTA):`,
          `"Haz tu pedido por la web y Shirley coordinará personalmente el pago y envío a tu ciudad."`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `💡 Si te gusta esta descripción, puedes decirme: "actualiza la descripción de ${slug || titulo} con este texto" para publicarla de inmediato.`
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
        const motivo = enfoque || 'nueva colección de joyas artesanales'

        if (seccion === 'hero') {
          return [
            `🎨 Opciones de Copy para el Carrusel Principal (Hero Slider):`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `Opción 1 (Emotiva & Ancestral):`,
            `• Título: Joyas Tejidas con Alma Caribeña`,
            `• Subtítulo: Piezas únicas elaboradas pacientemente a mano en Cartagena de Indias para resaltar tu esencia.`,
            `• Botón: Explorar Colección → /shop`,
            ``,
            `Opción 2 (Enfocada en ${motivo}):`,
            `• Título: Arte Textil & Filigrana de Autor`,
            `• Subtítulo: Descubre diseños exclusivos inspirados en los colores y la magia del Caribe colombiano.`,
            `• Botón: Ver Catálogo → /shop`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `💡 Puedes decirme: "agrega un slide con el título X y subtítulo Y" junto a una foto para publicarlo.`
          ].join('\n')
        }

        if (seccion === 'cta') {
          return [
            `🎨 Opciones para Bloque de Pedido Personalizado (CTA):`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `Opción 1:`,
            `• Título: ¿Buscas una joya personalizada a tu medida?`,
            `• Subtítulo: Shirley confecciona piezas por encargo con tus colores, patrones o combinaciones favoritas. Cuéntanos tu idea y la tejemos para ti.`,
            `• Botón: Personalizar mi Joya → /contacto`,
            ``,
            `Opción 2:`,
            `• Título: Lleva una pieza con historia propia`,
            `• Subtítulo: Diseños exclusivos y ediciones limitadas hechas con amor en Cartagena. Haz tu pedido directo sin intermediarios.`,
            `• Botón: Escribir a Shirley → /contacto`
          ].join('\n')
        }

        return [
          `🎨 Copy para la sección "${seccion}" (${motivo}):`,
          `• Título: Manos que Tejen Tradición e Identidad`,
          `• Cuerpo: Cada pieza de Nénufar nace en el corazón de Cartagena de Indias. Shirley entrelaza hilos y mostacillas creando obras de autor que honran el legado cultural de Colombia.`,
          `• Cierre: Joyería liviana, hipoalergénica y llena de significado.`
        ].join('\n')
      }

      default:
        return `Herramienta "${toolName}" no reconocida.`
    }
  } catch (err) {
    payload.logger.error({ msg: `[shirley-agent] Error ejecutando ${toolName}`, err })
    return `Ocurrió un inconveniente ejecutando ${toolName}. Puedes verificar directamente en /admin.`
  }
}

