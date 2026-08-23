/**
 * Tools del bot de Shirley (IP-001 / SPEC-002).
 *
 * Cada tool es una función que el Claude Agent SDK puede invocar durante su
 * loop agéntico. Todas operan sobre la Payload Local API actuando en nombre
 * de Shirley (admin): `overrideAccess: false` es intencional — el bot SOLO
 * responde a TELEGRAM_ADMIN_CHAT_ID (ver webhook route).
 *
 * Reglas:
 * - Los errores se capturan y devuelven como texto amigable: Shirley lee la
 *   respuesta en Telegram; jamás un stack trace.
 * - Moneda COP sin decimales.
 */
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk'
import type { Payload } from 'payload'
import { z } from 'zod'

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

const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] })
const toolError = (t: string) => ({
  content: [{ type: 'text' as const, text: t }],
  isError: true,
})

async function findProductBySlug(
  payload: Payload,
  slug: string,
): Promise<ProductWithSlug | null> {
  const result = await payload.find({
    collection: 'products',
    limit: 1,
    depth: 0,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return (result.docs[0] as ProductWithSlug | undefined) ?? null
}

/**
 * Crea el servidor MCP in-process con las 7 tools de gestión de Shirley.
 * Se pasa a `query()` vía `options.mcpServers`.
 */
export function createShirleyTools(payload: Payload) {
  const buscarProducto = tool(
    'buscarProducto',
    'Busca piezas de joyería en el catálogo real de Nénufar por nombre o palabra clave. ' +
      'Devuelve solo piezas que existen — nunca inventes productos.',
    { consulta: z.string().describe('Palabra clave, ej. "aretes", "collar de plata"') },
    async ({ consulta }) => {
      try {
        const result = await payload.find({
          collection: 'products',
          draft: false,
          depth: 0,
          limit: 5,
          overrideAccess: false,
          select: { title: true, priceInCOP: true, inventory: true },
          where: { title: { like: consulta } },
        })
        if (result.docs.length === 0) {
          return text(`No encontré piezas para "${consulta}" en el catálogo.`)
        }
        const base = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
        const lines = result.docs.map((p) => {
          const prod = p as unknown as ProductWithSlug
          const url = base ? `${base}/products/${prod.slug}` : `/products/${prod.slug}`
          const stock =
            typeof prod.inventory === 'number' && prod.inventory <= 0 ? ' — SIN stock' : ''
          return `- ${prod.title} — ${formatCOP(prod.priceInCOP)}${stock} (${url})`
        })
        return text(`Encontré ${result.docs.length} pieza(s):\n${lines.join('\n')}`)
      } catch (err) {
        return toolError(
          `No pude consultar el catálogo: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  const destacarProducto = tool(
    'destacarProducto',
    'Marca o desmarca un producto como destacado en el sitio web. Identifica el producto por su slug.',
    {
      slug: z.string().describe('Slug del producto, ej. "aretes-perla-chica"'),
      destacado: z
        .boolean()
        .optional()
        .describe('true para destacar (por defecto), false para quitar el destaque'),
    },
    async ({ slug, destacado }) => {
      const marcar = destacado ?? true
      try {
        const product = await findProductBySlug(payload, slug)
        if (!product) return text(`No encontré ningún producto con el slug "${slug}".`)
        await payload.update({
          collection: 'products',
          id: product.id,
          data: { featured: marcar },
          overrideAccess: false,
        })
        return text(
          marcar
            ? `Listo: "${product.title}" ahora está destacado en el sitio. ✨`
            : `"${product.title}" ya no aparece como destacado.`,
        )
      } catch (err) {
        return toolError(
          `No pude actualizar el destaque: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  const actualizarInventario = tool(
    'actualizarInventario',
    'Actualiza el inventario (unidades disponibles) y/o el precio en COP de un producto, por slug. ' +
      'Puedes actualizar solo uno de los dos valores.',
    {
      slug: z.string().describe('Slug del producto'),
      inventario: z.number().int().optional().describe('Nueva cantidad de unidades disponibles'),
      precioCOP: z.number().int().optional().describe('Nuevo precio en pesos colombianos, sin decimales'),
    },
    async ({ slug, inventario, precioCOP }) => {
      if (inventario === undefined && precioCOP === undefined) {
        return text('Indícame al menos un valor nuevo: inventario o precio.')
      }
      try {
        const product = await findProductBySlug(payload, slug)
        if (!product) return text(`No encontré ningún producto con el slug "${slug}".`)
        const data: Record<string, number> = {}
        if (inventario !== undefined) data.inventory = inventario
        if (precioCOP !== undefined) data.priceInCOP = precioCOP
        await payload.update({
          collection: 'products',
          id: product.id,
          data,
          draft: false,
          overrideAccess: false,
        })
        const cambios = [
          inventario !== undefined ? `inventario → ${inventario} unidades` : null,
          precioCOP !== undefined ? `precio → ${formatCOP(precioCOP)}` : null,
        ]
          .filter(Boolean)
          .join(', ')
        return text(`Actualicé "${product.title}": ${cambios}.`)
      } catch (err) {
        return toolError(
          `No pude actualizar el producto: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  const pedidosPendientes = tool(
    'pedidosPendientes',
    'Lista los pedidos web pendientes de confirmación (estado processing), del más viejo al más nuevo.',
    {},
    async () => {
      try {
        const result = await payload.find({
          collection: 'orders',
          depth: 1,
          limit: 20,
          overrideAccess: false,
          sort: 'createdAt',
          where: { status: { equals: 'processing' } },
        })
        if (result.docs.length === 0) {
          return text('No tienes pedidos pendientes. Todo al día 💜')
        }
        const lines = result.docs.map((o) => {
          const order = o as {
            id: number
            customerEmail?: string | null
            amount?: number | null
            createdAt?: string
            items?: { quantity?: number; product?: { title?: string } | number | null }[] | null
          }
          const items = (order.items ?? [])
            .map((it) => {
              const titulo = typeof it.product === 'object' ? it.product?.title : 'producto'
              return `${it.quantity ?? 1}× ${titulo ?? 'producto'}`
            })
            .join(', ')
          return (
            `- #${order.id} — ${formatCOP(order.amount)} — ${order.customerEmail ?? 'sin email'}\n` +
            `  📦 ${items || '(sin items)'}`
          )
        })
        return text(`Tienes ${result.docs.length} pedido(s) pendiente(s):\n${lines.join('\n')}`)
      } catch (err) {
        return toolError(
          `No pude consultar los pedidos: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  const confirmarPedido = tool(
    'confirmarPedido',
    'Confirma un pedido web: cambia su estado a completed (pagado y coordinado). Pide el número de pedido si no lo tienes.',
    { pedidoId: z.number().int().describe('Número (ID) del pedido a confirmar') },
    async ({ pedidoId }) => {
      try {
        const order = await payload.findByID({
          collection: 'orders',
          id: pedidoId,
          depth: 0,
          overrideAccess: false,
        })
        if (!order) return text(`No encontré el pedido #${pedidoId}.`)
        if (order.status === 'completed') {
          return text(`El pedido #${pedidoId} ya estaba confirmado.`)
        }
        await payload.update({
          collection: 'orders',
          id: pedidoId,
          data: { status: 'completed' },
          overrideAccess: false,
        })
        return text(`Pedido #${pedidoId} confirmado ✅ (${formatCOP(order.amount)}).`)
      } catch (err) {
        return toolError(
          `No pude confirmar el pedido: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  const publicarEvento = tool(
    'publicarEvento',
    'Agenda un evento (feria, pop-up, mercado) dejándolo como borrador en el sitio. ' +
      'Shirley lo publica desde /admin cuando revise la fecha y la foto.',
    {
      titulo: z.string().describe('Nombre del evento'),
      fecha: z.string().describe('Fecha y hora en formato ISO, ej. "2026-09-15T10:00:00-05:00"'),
      lugar: z.string().optional().describe('Lugar, ej. "Cartagena — Centro Histórico"'),
      descripcion: z.string().optional().describe('Descripción breve'),
    },
    async ({ titulo, fecha, lugar, descripcion }) => {
      try {
        const parsed = new Date(fecha)
        if (Number.isNaN(parsed.getTime())) {
          return text(`La fecha "${fecha}" no es válida. Usa formato ISO, ej. 2026-09-15T10:00:00.`)
        }
        const event = await payload.create({
          collection: 'events',
          data: {
            title: titulo,
            date: parsed.toISOString(),
            ...(lugar ? { location: lugar } : {}),
            ...(descripcion ? { description: descripcion } : {}),
          },
          draft: true,
          overrideAccess: false,
        })
        return text(
          `Evento "${titulo}" guardado como borrador (#${event.id}). Revísalo y publícalo desde /admin.`,
        )
      } catch (err) {
        return toolError(
          `No pude crear el evento: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  const crearProductoDraft = tool(
    'crearProductoDraft',
    'Crea un producto nuevo en borrador con título y precio. Queda invisible al público hasta que ' +
      'Shirley le agregue fotos y lo publique desde /admin.',
    {
      titulo: z.string().describe('Nombre de la pieza, ej. "Aretes filigrana oro"'),
      precioCOP: z.number().int().optional().describe('Precio en pesos colombianos, sin decimales'),
    },
    async ({ titulo, precioCOP }) => {
      try {
        const product = await payload.create({
          collection: 'products',
          data: {
            title: titulo,
            ...(precioCOP !== undefined
              ? { priceInCOPEnabled: true, priceInCOP: precioCOP }
              : {}),
          },
          draft: true,
          overrideAccess: false,
        })
        return text(
          `Producto "${titulo}" creado en borrador (#${product.id})` +
            (precioCOP !== undefined ? ` con precio ${formatCOP(precioCOP)}` : '') +
            '. Agrégale fotos y publícalo desde /admin.',
        )
      } catch (err) {
        return toolError(
          `No pude crear el producto: ${err instanceof Error ? err.message : 'error desconocido'}`,
        )
      }
    },
  )

  return createSdkMcpServer({
    name: 'nenufar-tienda',
    version: '1.0.0',
    tools: [
      buscarProducto,
      destacarProducto,
      actualizarInventario,
      pedidosPendientes,
      confirmarPedido,
      publicarEvento,
      crearProductoDraft,
    ],
  })
}
