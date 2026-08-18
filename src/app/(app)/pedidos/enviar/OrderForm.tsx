'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { submitOrderAction, type SubmitOrderState } from './submitOrderAction'
import { CONSENT_TEXT, PRIVACY_URL } from '@/lib/consent'
import { useState } from 'react'

const initialState: SubmitOrderState = { status: 'idle' }

export function OrderForm() {
  const { cart } = useCart()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('modo') === 'personalizado' ? 'personalizado' : 'standard'
  const [mode, setMode] = useState<'standard' | 'personalizado'>(initialMode)

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
          className="inline-block px-6 py-3 bg-brand text-brand-foreground rounded-md hover:bg-brand-dark transition"
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

      {/* Selector de modo */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-100 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('standard')}
          className={`py-3 px-4 rounded-md text-sm font-medium transition ${
            mode === 'standard'
              ? 'bg-white shadow text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Lo quiero tal como está
        </button>
        <button
          type="button"
          onClick={() => setMode('personalizado')}
          className={`py-3 px-4 rounded-md text-sm font-medium transition ${
            mode === 'personalizado'
              ? 'bg-white shadow text-brand'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          ✦ Lo quiero personalizado
        </button>
      </div>

      <input type="hidden" name="cartId" value={cartId} />
      <input type="hidden" name="modo" value={mode} />

      {/* Campo de personalización — solo en modo personalizado */}
      {mode === 'personalizado' && (
        <div className="p-5 bg-brand/5 border border-brand/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-brand text-lg">✦</span>
            <h2 className="font-medium text-neutral-900">¿Cómo querés personalizarla?</h2>
          </div>
          <textarea
            id="personalizacion"
            name="personalizacion"
            rows={5}
            required
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand bg-white"
            placeholder={
              'Contale a Shirley todos los detalles:\n• Colores de hilo preferidos\n• Largo o talla (muñeca, cuello, dedo)\n• Nombre o texto para incluir\n• Ocasión (regalo, uso diario, evento...)\n• Cualquier otro detalle'
            }
          />
          <p className="text-xs text-neutral-500">
            Shirley te contacta por WhatsApp para confirmar los detalles y darte el tiempo de
            elaboración.
          </p>
        </div>
      )}

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
          Número de WhatsApp *
        </label>
        <input
          id="buyerContact"
          name="buyerContact"
          type="tel"
          required
          autoComplete="tel"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="+57 321 456 7890"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Shirley te contacta por WhatsApp. No lo compartimos con terceros.
        </p>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-1">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="Instrucciones de envío, comentarios, etc."
        />
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
        className="w-full py-3 px-6 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Enviando pedido…' : 'Confirmar pedido'}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        Al confirmar, Shirley recibe tu pedido y te escribe por WhatsApp. No se hace cargo a tu
        tarjeta.
      </p>
    </form>
  )
}
