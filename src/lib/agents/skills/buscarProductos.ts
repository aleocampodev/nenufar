/**
 * Skill: buscarProductos — consulta el catálogo real de Payload.
 *
 * v1: búsqueda simple por título (like) sobre productos publicados.
 * (Fase RAG: se reemplazará por búsqueda semántica en pgvector.)
 */
import type { Skill } from '../types'

const formatCOP = (n: number | null | undefined): string =>
  typeof n === 'number'
    ? new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(n)
    : 'precio por confirmar'

export const buscarProductos: Skill = {
  name: 'buscarProductos',
  definition: {
    type: 'function',
    function: {
      name: 'buscarProductos',
      description:
        'Busca piezas de joyería en el catálogo de Nénufar por nombre o palabra clave. ' +
        'Úsalo cuando la clienta pregunte por productos, precios o disponibilidad. ' +
        'Devuelve solo piezas reales del catálogo — nunca inventes productos.',
      parameters: {
        type: 'object',
        properties: {
          consulta: {
            type: 'string',
            description: 'Palabra clave o nombre a buscar, ej. "aretes", "collar de plata".',
          },
        },
        required: ['consulta'],
      },
    },
  },
  async run(args, ctx) {
    const consulta = String(args.consulta ?? '').trim()
    if (!consulta) return 'No se indicó qué buscar en el catálogo.'

    const result = await ctx.payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      depth: 0,
      limit: 5,
      select: { title: true, slug: true, priceInCOP: true },
      where: {
        and: [{ _status: { equals: 'published' } }, { title: { like: consulta } }],
      },
    })

    if (result.docs.length === 0) {
      return `No encontré piezas para "${consulta}" en el catálogo.`
    }

    const base = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
    const lines = result.docs.map((doc) => {
      // slug se pierde del tipo generado (bug pre-existente), pero existe en runtime.
      const p = doc as { title?: string; slug?: string; priceInCOP?: number | null }
      const price = formatCOP(p.priceInCOP)
      const url = base ? `${base}/products/${p.slug}` : `/products/${p.slug}`
      return `- ${p.title} — ${price} (${url})`
    })
    return `Encontré ${result.docs.length} pieza(s) para "${consulta}":\n${lines.join('\n')}`
  },
}
