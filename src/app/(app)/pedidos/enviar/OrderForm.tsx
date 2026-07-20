'use client'

/**
 * Order form — client component.
 * Reads cart via useCart() from plugin-ecommerce, passes cartId to server action.
 */

import { useActionState } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { submitOrderAction, type SubmitOrderState } from './submitOrderAction'
import { CONSENT_TEXT, PRIVACY_URL } from '@/lib/consent'

const initialState: SubmitOrderState = { status: 'idle' }

export function OrderForm() {
  const { cart } = useCart()
  const [state, formAction, isPending] = useActionState(submitOrderAction, initialState)

  const cartId = cart?.id ?? ''
  const itemCount = (cart?.items ?? []).length

  if (itemCount === 0) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-serif mb-4">Tu carrito está vacío</h2>
        <p className="text-neutral-600 mb-8">
          Agregá piezas al carrito antes de enviar tu pedido.
        </p>
        <a
          href="/shop"
          className="inline-block px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-700 transition"
        >
          Ver catálogo
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="container max-w-2xl py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-serif mb-2">Confirmá tu pedido</h1>
        <p className="text-neutral-600">
          Shirley recibe tu pedido y te contacta para coordinar pago y envío.{' '}
          <span className="text-neutral-400">Sin pago online.</span>
        </p>
      </header>

      {/* Hidden cartId — server action needs it to fetch the cart */}
      <input type="hidden" name="cartId" value={cartId} />

      <div>
        <label htmlFor="buyerName" className="block text-sm font-medium mb-1">
          Nombre y apellido *
        </label>
        <input
          id="buyerName"
          name="buyerName"
          type="text"
          required
          autoComplete="name"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="María Quintana"
        />
      </div>

      <div>
        <label htmlFor="buyerContact" className="block text-sm font-medium mb-1">
          WhatsApp o email *
        </label>
        <input
          id="buyerContact"
          name="buyerContact"
          type="text"
          required
          autoComplete="tel"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="+57 321 456 7890"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Shirley te contacta por este medio. No lo compartimos con terceros.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4"
        />
        <label htmlFor="consent" className="text-sm text-neutral-700">
          {CONSENT_TEXT}{' '}
          <a href={PRIVACY_URL} className="underline hover:text-neutral-900">
            Ver política de privacidad
          </a>
          .
        </label>
      </div>

      {state.status === 'error' && state.errorMessage && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm"
        >
          {state.errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-6 bg-neutral-900 text-white font-medium rounded-md hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Enviando pedido…' : 'Confirmar pedido'}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        Al confirmar, Shirley recibe tu pedido y te escribe. No se hace cargo a tu tarjeta.
      </p>
    </form>
  )
}
