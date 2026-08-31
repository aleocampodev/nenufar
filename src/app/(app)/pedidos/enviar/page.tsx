/**
 * /pedidos/enviar — order form page.
 *
 * Buyer enters name + contact + consent. On submit, server action dispatches
 * an order message to the Telegram channel (invisible to the buyer) and creates
 * an Order in Payload with status 'pending'. Buyer is redirected to /confirmacion.
 *
 * Server component — renders <OrderForm /> which is a client component
 * (needs useCart() hook from plugin-ecommerce).
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { OrderForm } from './OrderForm'

export default function PedidosEnviarPage() {
  return (
    <main className="min-h-[85vh] bg-[#FAF8F5] py-10 sm:py-14">
      <Suspense>
        <OrderForm />
      </Suspense>
    </main>
  )
}

export const metadata: Metadata = {
  description: 'Confirmá tu pedido a Nenúfar. Shirley te contacta para coordinar.',
  openGraph: mergeOpenGraph({
    title: 'Confirmar pedido | Nenúfar',
    url: '/pedidos/enviar',
  }),
  title: 'Confirmar pedido | Nenúfar',
}
