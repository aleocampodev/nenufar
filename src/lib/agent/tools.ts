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

  // ─── 2. PEDIDOS ───────────────────────────────────────────────────────
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

  // ─── 3. GALERÍA DE MOMENTOS, CLIENTAS & FERIAS ─────────────────────────
  {
    name: 'agregarFotoGaleria',
    description:
      'Agrega una nueva fotografía a la subpágina de galería de Nénufar (/galeria). ' +
      'Permite subir fotos enviadas por Shirley en Telegram de clientas luciendo joyas, ferias de diseño, talleres de tejido o del espacio de creación.',
    input_schema: {
      type: 'object',
      properties: {
        categoria: {
          type: 'string',
          enum: ['clientas', 'ferias', 'talleres', 'shirley'],
          description:
            'Categoría o pestaña de la galería: "clientas" (Nuestras Clientas), "ferias" (Ferias en Cartagena), "talleres" (Talleres de Tejido) o "shirley" (El Taller & Shirley)',
        },
        titulo: {
          type: 'string',
          description: 'Título o pie descriptivo de la fotografía (ej. "Clienta luciendo Collar Okama en Getsemaní", "Stand en Feria Centro Histórico")',
        },
        descripcion: {
          type: 'string',
          description: 'Descripción breve u observación adicional de la pieza o momento (opcional)',
        },
        esDestacada: {
          type: 'boolean',
          description: 'true para que la foto tenga mayor tamaño destacado en la cuadrícula de la galería',
        },
      },
      required: ['categoria', 'titulo'],
    },
  },
  {
    name: 'listarFotosGaleria',
    description:
      'Lista las fotos y momentos publicados en cada pestaña de la galería interactiva (/galeria).',
    input_schema: {
      type: 'object',
      properties: {
        categoria: {
          type: 'string',
          description: 'Filtro opcional por categoría: "clientas", "ferias", "talleres" o "shirley"',
        },
      },
    },
  },
  {
    name: 'eliminarFotoGaleria',
    description:
      'Elimina una fotografía de la galería web de autor por su título o nombre.',
    input_schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Título o parte del título de la foto que Shirley desea retirar de la galería',
        },
        categoria: {
          type: 'string',
          description: 'Categoría opcional para afinar la búsqueda ("clientas", "ferias", "talleres", "shirley")',
        },
      },
      required: ['titulo'],
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
          enum: ['taller', 'feria'],
          description: 'Tipo de evento: taller o feria',
        },
      },
      required: ['titulo', 'fecha'],
    },
  },
  {
    name: 'listarEventos',
    description:
      'Lista todos los talleres, ferias o pop-ups programados con su ID, título, fecha y ubicación.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'eliminarEvento',
    description:
      'Elimina o cancela un taller o feria de la web por su ID o por su título.',
    input_schema: {
      type: 'object',
      properties: {
        eventoId: {
          type: 'number',
          description: 'ID numérico del evento a eliminar (ej. 4)',
        },
        titulo: {
          type: 'string',
          description: 'Nombre o parte del nombre del taller/feria a eliminar si no se especifica el ID',
        },
      },
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
  {
    name: 'eliminarTestimonio',
    description: 'Elimina un testimonio de la página de inicio por el nombre de la clienta.',
    input_schema: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre de la clienta cuyo testimonio se quiere eliminar',
        },
      },
      required: ['nombre'],
    },
  },

  // ─── 5. COPYWRITING, CATÁLOGO, LANDING & REDES ─────────────────────────
  {
    name: 'generarCopyProducto',
    description:
      'Genera la ficha de descripción persuasiva para la página web del producto (/products/[slug]): ' +
      'descripción artesanal, beneficios concretos de la pieza y texto de pedido/envío. ' +
      'Solo para el catálogo web de Nénufar. Puede basarse en un producto existente por su slug o en los detalles que Shirley indique.',
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
  {
    name: 'consultarAlmacenamientoFotos',
    description:
      'Consulta el estado del almacenamiento en la nube de Supabase (1 GB gratuito), porcentaje ocupado, espacio libre disponible y las fotos más pesadas de la tienda para que Shirley decida cuáles eliminar si necesita liberar espacio.',
    input_schema: {
      type: 'object',
      properties: {
        limiteFotos: {
          type: 'number',
          description: 'Número de fotos más pesadas a listar (por defecto 5)',
        },
      },
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
          const stock = typeof p.inventory === 'number' && p.inventory <= 0 ? ' (Sin stock)' : ` (${p.inventory ?? 0} disp.)`
          return `💎 ${p.title} — ${formatCOP(p.priceInCOP)}${stock}`
        })
        return `Encontré ${result.docs.length} pieza(s) en el catálogo:\n\n${lines.join('\n')}`
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
          : `¡Listo Shirley! Joya "${titulo}" guardada como borrador${catMsg} con precio ${formatCOP(precioCOP)}. Puedes publicarla cuando quieras diciendo "publicar ${titulo}".`
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
          return `📦 Pedido #${o.id} — ${formatCOP(o.amount)} — ${o.customerEmail || 'Sin email'}\n   Detalle: ${items || 'Sin items'}`
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

        return `Galería Nénufar (/galeria):\n\n${sections.join('\n\n')}`
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
        const titulo = product?.title || nombrePieza || 'Joya de Autor Nénufar'
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

