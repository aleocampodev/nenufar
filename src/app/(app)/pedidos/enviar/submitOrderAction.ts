'use server'

/**
 * /pedidos/enviar server action — Nénufar v3.1 Fase 4.
 *
 * Buyer submits name+contact+consent → this action:
 *   1. Validates consent (Ley 1581)
 *   2. Fetches the cart by cartId from Payload
 *   3. Checks idempotency (no duplicate submissions)
 *   4. Formats the order message (cart → HTML)
 *   5. Sends to Telegram channel (invisible to buyer)
 *   6. Creates an Order in Payload (status: pending)
 *   7. Marks idempotency as seen
 *   8. Returns confirmation data for the success screen
 *
 * On ANY failure, returns a retryable error. Buyer never sees Telegram.
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import path from 'path'

import { validateConsent } from '@/lib/consent'
import { checkIdempotency, markSeen } from '@/lib/idempotency'
import { formatOrderMessage } from '@/lib/order-formatter'
import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram'

export interface SubmitOrderState {
  status: 'idle' | 'error' | 'success'
  errorMessage?: string
  orderId?: string
}

export async function submitOrderAction(
  _prevState: SubmitOrderState,
  formData: FormData,
): Promise<SubmitOrderState> {
  // 1. Parse form
  const buyerName = String(formData.get('buyerName') ?? '').trim()
  const buyerContact = String(formData.get('buyerContact') ?? '').trim()
  const consent = formData.get('consent')
  const cartId = String(formData.get('cartId') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()
  const modo = String(formData.get('modo') ?? '').trim()
  const personalizacion =
    modo === 'personalizado' ? String(formData.get('personalizacion') ?? '').trim() : undefined

  // 2. Basic field validation
  if (!buyerName || buyerName.length < 2) {
    return { status: 'error', errorMessage: 'Por favor ingresá tu nombre.' }
  }
  if (!buyerContact || buyerContact.length < 6) {
    return {
      status: 'error',
      errorMessage: 'Por favor ingresá un número de WhatsApp válido.',
    }
  }

  if (modo === 'personalizado' && (!personalizacion || personalizacion.length < 5)) {
    return {
      status: 'error',
      errorMessage: 'Por favor describí cómo querés personalizar tu pedido.',
    }
  }
  if (!cartId) {
    return {
      status: 'error',
      errorMessage: 'Tu carrito está vacío. Agregá productos antes de enviar el pedido.',
    }
  }

  // 3. Consent guard (Ley 1581)
  const consentResult = validateConsent(consent)
  if (!consentResult.ok) {
    return { status: 'error', errorMessage: consentResult.reason }
  }

  // 4. Idempotency guard (no duplicate Telegram messages)
  const idempotencyCheck = checkIdempotency(cartId)
  if (!idempotencyCheck.allowed && idempotencyCheck.existingOrderId) {
    // Duplicate click — return the original confirmation
    redirect(`/pedidos/enviar/confirmacion?id=${idempotencyCheck.existingOrderId}`)
  }

  // 5. Fetch cart from Payload (server-side, Local API)
  const payload = await getPayload({ config: configPromise })
  let cart
  try {
    cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2, // populate product + variant refs
      overrideAccess: true, // public submission — cart has secret in real flow
    })
  } catch (err) {
    payload.logger.error({ msg: '[submitOrder] Failed to fetch cart', err, cartId })
    return {
      status: 'error',
      errorMessage: 'No pudimos encontrar tu carrito. Recargá la página e intentá de nuevo.',
    }
  }

  if (!cart || (cart.items ?? []).length === 0) {
    return {
      status: 'error',
      errorMessage: 'Tu carrito está vacío. Agregá productos antes de enviar el pedido.',
    }
  }

  // 5b. Update cart with note (personalization)
  if (note) {
    try {
      await payload.update({
        collection: 'carts',
        id: cartId,
        data: { note },
        overrideAccess: true,
      })
    } catch (err) {
      payload.logger.error({ msg: '[submitOrder] Failed to update cart note', err, cartId })
      // Non-fatal — continue without note
    }
  }

  // 6. Create the Order FIRST (so we have an orderId for the message)
  //    Status: pending. Amount: cart.subtotal. Currency: cart.currency.
  let order
  try {
    order = await payload.create({
      collection: 'orders',
      data: {
        items: cart.items ?? [],
        amount: cart.subtotal ?? null,
        currency: cart.currency ?? null,
        status: 'processing',
        customerEmail: null,
        // NOTE: buyerName + buyerContact go into shippingAddress for now
        // (Fase 6 will add proper fields via ordersCollectionOverride)
        shippingAddress: {
          firstName: buyerName,
          phone: buyerContact,
        },
      },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error({ msg: '[submitOrder] Failed to create order', err })
    return {
      status: 'error',
      errorMessage: 'Hubo un problema al registrar tu pedido. Intentá de nuevo.',
    }
  }

  // 7. Format and send Telegram message
  const orderId = String(order.id)
  const message = formatOrderMessage({
    cart,
    buyer: { name: buyerName, contact: buyerContact },
    orderId,
    personalizacion,
  })

  const telegramResult = await sendTelegramMessage({ text: message })
  if (!telegramResult.ok) {
    payload.logger.error({
      msg: '[submitOrder] Telegram send failed — Order created but Shirley NOT notified',
      orderId,
      error: telegramResult.error,
    })
    // The Order exists in DB — Shirley can still see it in admin.
    // Tell the buyer it went through (don't leak Telegram internals) but log the issue.
    markSeen(cartId, orderId)
    redirect(`/pedidos/enviar/confirmacion?id=${orderId}&warn=1`)
  }

  // 7b. Send one photo per product (non-fatal — order already confirmed above)
  const mediaDir = path.join(process.cwd(), 'public', 'media')
  const seenProducts = new Set<string>()
  for (const item of cart.items ?? []) {
    const product = typeof item?.product === 'object' ? item.product : null
    if (!product || !('id' in product)) continue
    const productId = String(product.id)
    if (seenProducts.has(productId)) continue
    seenProducts.add(productId)

    const gallery = (product as { gallery?: Array<{ image?: unknown }> }).gallery ?? []
    const firstImage = gallery[0]?.image
    if (!firstImage || typeof firstImage !== 'object') continue

    const media = firstImage as { filename?: string; url?: string; title?: string }
    const title = (product as { title?: string }).title ?? 'Producto'
    const qty = item.quantity ?? 1
    const caption = qty > 1 ? `${title} ×${qty}` : title

    const photoResult = await sendTelegramPhoto({
      filePath: media.filename ? path.join(mediaDir, media.filename) : undefined,
      photoUrl: media.url ?? undefined,
      caption,
    })

    if (!photoResult.ok) {
      payload.logger.warn({
        msg: '[submitOrder] Photo send skipped',
        productId,
        error: photoResult.error,
      })
    }
  }

  // 8. Mark idempotency (after Telegram succeeds + Order exists)
  markSeen(cartId, orderId)

  // 9. Mark cart as purchased (optional, for analytics)
  try {
    await payload.update({
      collection: 'carts',
      id: cartId,
      data: { status: 'purchased', purchasedAt: new Date().toISOString() },
      overrideAccess: true,
    })
  } catch {
    // Non-fatal — cart status update is best-effort
  }

  // 10. Clear the cart cookie so buyer doesn't see stale cart
  const cookieStore = await cookies()
  cookieStore.delete('payload-commerce-cart')

  // 11. Redirect to confirmation page (PRG pattern — Post/Redirect/Get)
  redirect(`/pedidos/enviar/confirmacion?id=${order.id}`)
}
