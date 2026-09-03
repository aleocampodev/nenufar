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
      <div className="container max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-8 text-center">
          <h2 className="text-2xl font-serif text-neutral-900 mb-3">Tu carrito está vacío</h2>
          <p className="text-neutral-600 mb-6 text-sm leading-relaxed">
            Agregá piezas artesanales al carrito antes de enviar tu pedido.
          </p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-brand text-brand-foreground text-sm font-medium rounded-xl hover:bg-brand-dark transition shadow-xs"
          >
            Ver catálogo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-xl mx-auto px-4">
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 sm:p-10">
        <form action={formAction} className="space-y-6">
          <header className="border-b border-neutral-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900 mb-2">Confirmá tu pedido</h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Shirley recibe tu pedido y te contacta para coordinar pago y envío.{' '}
              <span className="text-neutral-400 font-light">Sin pago online.</span>
            </p>
          </header>

          {/* Selector de modo */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100/90 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('standard')}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                mode === 'standard'
                  ? 'bg-white shadow-xs text-neutral-900 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Lo quiero tal como está
            </button>
            <button
              type="button"
              onClick={() => setMode('personalizado')}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                mode === 'personalizado'
                  ? 'bg-white shadow-xs text-brand font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              ✦ Lo quiero personalizado
            </button>
          </div>

          <input type="hidden" name="cartId" value={cartId} />
          <input type="hidden" name="modo" value={mode} />

          {/* Campo de personalización — solo en modo personalizado */}
          {mode === 'personalizado' && (
            <div className="p-5 bg-brand/5 border border-brand/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-brand text-lg">✦</span>
                <h2 className="font-medium text-neutral-900 text-sm sm:text-base">¿Cómo querés personalizarla?</h2>
              </div>
              <textarea
                id="personalizacion"
                name="personalizacion"
                rows={5}
                required
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white text-sm"
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
            <label htmlFor="buyerName" className="block text-sm font-medium text-neutral-800 mb-1.5">
              Nombre y apellido *
            </label>
            <input
              id="buyerName"
              name="buyerName"
              type="text"
              required
              autoComplete="name"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition bg-white text-sm"
              placeholder="María Quintana"
            />
          </div>

          <div>
            <label htmlFor="buyerContact" className="block text-sm font-medium text-neutral-800 mb-1.5">
              Número de WhatsApp *
            </label>
            <input
              id="buyerContact"
              name="buyerContact"
              type="tel"
              required
              autoComplete="tel"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition bg-white text-sm"
              placeholder="321 456 7890"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Shirley te contacta por WhatsApp. No lo compartimos con terceros.
            </p>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-neutral-800 mb-1.5">
              Notas adicionales <span className="text-neutral-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              rows={2}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition bg-white text-sm resize-none"
              placeholder="Instrucciones de envío, comentarios, etc."
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand accent-brand cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs sm:text-sm text-neutral-600 leading-snug cursor-pointer select-none">
              {CONSENT_TEXT}{' '}
              <a href={PRIVACY_URL} className="underline hover:text-neutral-900 font-medium">
                Ver política de privacidad
              </a>
              .
            </label>
          </div>

          {state.status === 'error' && state.errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm"
            >
              {state.errorMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto sm:min-w-[280px] py-3.5 px-8 bg-brand text-brand-foreground font-medium rounded-xl hover:bg-brand-dark transition shadow-xs hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-center text-sm sm:text-base cursor-pointer"
            >
              {isPending ? 'Enviando pedido…' : 'Confirmar pedido'}
            </button>

            <p className="text-xs text-neutral-500 text-center max-w-sm">
              Al confirmar, Shirley recibe tu pedido y te escribe por WhatsApp. No se hace cargo a tu
              tarjeta.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

