/**
 * /pedidos/enviar/confirmacion — success page after order submission.
 *
 * Buyer sees this after the server action dispatches the Telegram message.
 * Shows order ID and a reassuring message. Shirley responds by Telegram
 * (not WhatsApp — per design brief).
 *
 * The page is server-rendered — the order ID comes from the URL search params.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

interface ConfirmationPageProps {
  searchParams: Promise<{ id?: string; warn?: string }>
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams
  const orderId = params.id

  if (!orderId) {
    notFound()
  }

  // Fetch the order to get buyer info
  const payload = await getPayload({ config: configPromise })
  let buyerName = ''
  let buyerContact = ''
  try {
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
    })
    buyerName = order.shippingAddress?.firstName ?? ''
    buyerContact = order.shippingAddress?.phone ?? ''
  } catch {
    // If we can't fetch the order, still show confirmation
  }

  const hasWarning = params.warn === '1'

  return (
    <main className="min-h-[80vh] bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
          ✓
        </div>

        <h1 className="text-3xl font-serif mb-3 text-neutral-900">¡Pedido enviado!</h1>

        <p className="text-neutral-700 mb-6">
          Gracias {buyerName || 'por tu compra'}. Shirley recibió tu pedido{' '}
          <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
            #{orderId}
          </span>{' '}
          y te va a contactar en las próximas 24 horas.
        </p>

        {buyerContact && (
          <p className="text-sm text-neutral-600 mb-6">
            Shirley te va a escribir por WhatsApp al número{' '}
            <span className="font-medium">{buyerContact}</span>.
          </p>
        )}

        {hasWarning && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
            Tu pedido fue registrado pero podría haber un pequeño retraso en la
            notificación a Shirley. No es necesario que hagas nada — igual te va a contactar.
          </div>
        )}

        <a
          href="/"
          className="inline-block px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-dark transition mb-3"
        >
          Volver al inicio
        </a>

        <p className="mt-8 text-xs text-neutral-500">
          Guardá tu número de pedido por si necesitás contactarnos.
        </p>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  description: 'Tu pedido fue enviado a Nénufar.',
  openGraph: mergeOpenGraph({
    title: 'Pedido enviado | Nénufar',
    url: '/pedidos/enviar/confirmacion',
  }),
  title: 'Pedido enviado | Nénufar',
}
