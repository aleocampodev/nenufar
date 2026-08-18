/**
 * Order formatter — pure function. Cart + buyer info → Telegram HTML message.
 *
 * Constitution §2.7: "the cart IS the order". This module reflects that cart
 * faithfully into a single HTML message for the Telegram channel.
 *
 * Nénufar v3.1 — Fase 4 baseline. Personalization (cart line attributes + cart
 * note) is Fase 5; COP currency swap is Fase 7. For now we format what the
 * template's plugin-ecommerce Cart actually exposes.
 */

import type { Cart } from '@/payload-types'

export interface BuyerInfo {
  name: string
  contact: string
}

export interface FormatOrderMessageArgs {
  cart: Cart
  buyer: BuyerInfo
  orderId: string
  personalizacion?: string
  timestamp?: Date
}

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  dateStyle: 'full',
  timeStyle: 'short',
})

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function productName(item: NonNullable<Cart['items']>[number]): string {
  const product = item?.product
  if (typeof product === 'object' && product && 'title' in product) {
    return product.title ?? 'Producto sin título'
  }
  return 'Producto sin título'
}

function variantOptionsLines(item: NonNullable<Cart['items']>[number]): string[] {
  const variant = item?.variant
  if (typeof variant !== 'object' || !variant || !('options' in variant)) {
    return []
  }
  const options = (variant as { options?: unknown[] }).options
  if (!Array.isArray(options)) return []

  const lines: string[] = []
  for (const opt of options) {
    if (typeof opt === 'object' && opt && 'variantType' in opt && 'value' in opt) {
      const o = opt as { variantType?: string | { label?: string }; label?: string; value?: string }
      const dimensionName =
        typeof o.variantType === 'object' && o.variantType && 'label' in o.variantType
          ? String(o.variantType.label ?? '')
          : typeof o.variantType === 'string'
            ? o.variantType
            : ''
      const value = o.value ?? o.label ?? ''
      if (dimensionName || value) {
        lines.push(`     • ${escapeHtml(dimensionName || 'Opción')}: ${escapeHtml(value)}`)
      }
    }
  }
  return lines
}

function unitPrice(item: NonNullable<Cart['items']>[number]): number {
  const variant = item?.variant
  if (typeof variant === 'object' && variant && 'priceInCOP' in variant) {
    return Number((variant as { priceInCOP?: number | null }).priceInCOP ?? 0)
  }
  const product = item?.product
  if (typeof product === 'object' && product && 'priceInCOP' in product) {
    return Number((product as { priceInCOP?: number | null }).priceInCOP ?? 0)
  }
  return 0
}

/**
 * Formats the order message that lands in the Telegram channel.
 * Pure — no side effects, no I/O. Easy to unit test.
 */
export function formatOrderMessage({
  cart,
  buyer,
  orderId,
  personalizacion,
  timestamp = new Date(),
}: FormatOrderMessageArgs): string {
  const lines: string[] = []

  // Header — destacar si es personalizado
  const esPersonalizado = Boolean(personalizacion)
  lines.push(
    esPersonalizado
      ? '✦ <b>Pedido PERSONALIZADO — Nénufar</b>'
      : '🔔 <b>Nuevo pedido — Nénufar</b>',
  )
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`🎫 Pedido: <code>#${escapeHtml(orderId)}</code>`)
  lines.push(`📅 ${escapeHtml(DATE_FORMATTER.format(timestamp))}`)
  lines.push('⚖️ Estado: <b>pendiente</b>')
  lines.push('')

  // Buyer
  lines.push('<b>👤 Cliente</b>')
  lines.push(`Nombre: ${escapeHtml(buyer.name)}`)
  lines.push(`WhatsApp: ${escapeHtml(buyer.contact)}`)
  lines.push('')

  // Items
  const items = cart.items ?? []
  lines.push(`<b>🛒 Items (${items.length})</b>`)
  lines.push('')

  let totalUnits = 0
  let calculatedSubtotal = 0

  items.forEach((item, index) => {
    const title = productName(item)
    const quantity = item?.quantity ?? 1
    const unit = unitPrice(item)
    const lineTotal = unit * quantity

    totalUnits += quantity
    calculatedSubtotal += lineTotal

    lines.push(`<b>${index + 1}. ${escapeHtml(title)}</b>`)

    const variantLines = variantOptionsLines(item)
    if (variantLines.length > 0) {
      lines.push('   Variantes:')
      lines.push(...variantLines)
    }

    lines.push(`   Cantidad: <b>×${quantity}</b>`)
    lines.push(`   Precio unitario: ${COP_FORMATTER.format(unit)}`)
    lines.push(`   Subtotal: <b>${COP_FORMATTER.format(lineTotal)}</b>`)
    lines.push('')
  })

  // Personalización — bloque destacado para que Shirley lo vea de inmediato
  if (personalizacion) {
    lines.push('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦')
    lines.push('<b>🎨 PERSONALIZACIÓN REQUERIDA</b>')
    lines.push('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦')
    lines.push(escapeHtml(personalizacion))
    lines.push('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦')
    lines.push('')
  }

  // Cart-level note
  const cartNote = (cart as { note?: string | null }).note?.trim()
  if (cartNote) {
    lines.push('<b>📝 Notas del pedido</b>')
    lines.push(escapeHtml(cartNote))
    lines.push('')
  }

  // Totals — prefer cart.subtotal, fall back to calculated
  const total = cart.subtotal ?? calculatedSubtotal
  lines.push('<b>💰 Totales</b>')
  lines.push(`Items: ${totalUnits} unidades`)
  lines.push(`<b>TOTAL: ${COP_FORMATTER.format(total)} COP</b>`)
  lines.push('')

  // Footer
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━')
  const adminUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  if (adminUrl) {
    lines.push(`Shirley: ver en admin → ${adminUrl}/admin/collections/orders`)
  }

  return lines.join('\n')
}

/**
 * Format a delivery-success message for the buyer's WhatsApp link.
 * Used in the confirmation page so the buyer can ping Shirley directly.
 */
export function formatWhatsAppLink(buyer: BuyerInfo, orderId: string): string {
  const text = `Hola Shirley, te escribo desde la web por mi pedido #${orderId} 😊`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
