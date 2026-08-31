'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { submitOrderAction, type SubmitOrderState } from './submitOrderAction'
import { CONSENT_TEXT, PRIVACY_URL } from '@/lib/consent'
import { Price } from '@/components/Price'
import { Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react'

const initialState: SubmitOrderState = { status: 'idle' }

export function OrderForm() {
  const { cart } = useCart()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('modo') === 'personalizado' ? 'personalizado' : 'standard'
  const [mode, setMode] = useState<'standard' | 'personalizado'>(initialMode)

  const [state, formAction, isPending] = useActionState(submitOrderAction, initialState)

  const cartId = cart?.id ?? ''
  const items = cart?.items ?? []
  const itemCount = items.length

  if (itemCount === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-2">
          Joyería Artesanal
        </span>
        <h2 className="text-3xl font-serif mb-3 text-neutral-900">Tu carrito está vacío</h2>
        <p className="text-neutral-600 mb-8 max-w-sm mx-auto font-light text-sm sm:text-base">
          Explora nuestro catálogo y elige las piezas que deseas encargar a Shirley.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-brand text-white rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:bg-brand-dark transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02]"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-6 sm:p-10">
        <form action={formAction} className="space-y-6">
          {/* Encabezado Krafti */}
          <header className="text-center space-y-2 pb-2">
            <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold">
              Hecho a mano en Cartagena
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 font-normal">
              Confirma tu pedido
            </h1>
            <p className="text-sm text-neutral-600 font-light max-w-md mx-auto">
              Shirley recibe tu solicitud y se comunicará contigo por WhatsApp para coordinar el pago y la entrega.
            </p>
          </header>

          {/* Resumen compacto de los productos seleccionados */}
          <div className="bg-[#FAF8F5] border border-neutral-200/70 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-brand" />
                Resumen de tu selección ({itemCount} {itemCount === 1 ? 'pieza' : 'piezas'})
              </span>
              {typeof cart?.subtotal === 'number' && (
                <div className="text-sm font-serif text-brand flex items-center gap-1">
                  <span className="text-xs text-neutral-500 font-sans">Total:</span>
                  <Price amount={cart.subtotal} currencyCode="COP" className="font-bold" />
                </div>
              )}
            </div>

            <div className="divide-y divide-neutral-200/40 max-h-36 overflow-y-auto pr-1 text-xs">
              {items.map((item, idx) => {
                if (!item) return null
                const rawProduct = item.product
                const product = typeof rawProduct === 'object' && rawProduct !== null ? rawProduct : null
                const title = (product as any)?.title || `Joya #${item.product}`
                const variant = typeof item.variant === 'object' && item.variant !== null ? item.variant : null
                const price = (variant as any)?.priceInCOP ?? (product as any)?.priceInCOP

                return (
                  <div key={item.id || idx} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800">{title}</span>
                      <span className="text-neutral-400 font-mono text-[11px]">x{item.quantity}</span>
                    </div>
                    {typeof price === 'number' && (
                      <span className="font-mono text-neutral-700">
                        <Price amount={price * (item.quantity || 1)} currencyCode="COP" />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selector de modo estilo Krafti (Botones compactos centrados tipo Pill) */}
          <div className="flex flex-col items-center justify-center gap-2 pt-1">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Tipo de confección
            </span>
            <div className="inline-flex p-1 bg-[#FAF8F5] border border-neutral-200/80 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={() => setMode('standard')}
                className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                  mode === 'standard'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Diseño estándar
              </button>
              <button
                type="button"
                onClick={() => setMode('personalizado')}
                className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-1.5 ${
                  mode === 'personalizado'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalizado</span>
              </button>
            </div>
          </div>

          <input type="hidden" name="cartId" value={cartId} />
          <input type="hidden" name="modo" value={mode} />

          {/* Campo de personalización */}
          {mode === 'personalizado' && (
            <div className="p-5 bg-brand/5 border border-brand/20 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-brand text-base">✦</span>
                <h2 className="text-sm font-medium text-neutral-900">¿Cómo te gustaría personalizar tu joya?</h2>
              </div>
              <textarea
                id="personalizacion"
                name="personalizacion"
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                placeholder={
                  'Indica a Shirley los detalles:\n• Colores de hilo preferidos\n• Medida o talla (muñeca, cuello, dedo)\n• Nombre o motivo especial\n• Ocasión (regalo, fecha especial...)'
                }
              />
              <p className="text-xs text-neutral-500 font-light">
                Shirley confirmará la combinación cromática y el tiempo de tejido por WhatsApp.
              </p>
            </div>
          )}

          {/* Campos del Comprador */}
          <div className="space-y-4">
            <div>
              <label htmlFor="buyerName" className="block text-xs uppercase tracking-wider font-medium text-neutral-700 mb-1.5">
                Nombre y apellido *
              </label>
              <input
                id="buyerName"
                name="buyerName"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-[#FAF8F5]/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                placeholder="María Quintana"
              />
            </div>

            <div>
              <label htmlFor="buyerContact" className="block text-xs uppercase tracking-wider font-medium text-neutral-700 mb-1.5">
                Número de WhatsApp *
              </label>
              <input
                id="buyerContact"
                name="buyerContact"
                type="tel"
                required
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-[#FAF8F5]/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                placeholder="+57 321 456 7890"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Shirley te contactará por este número para coordinar el pago y la entrega.
              </p>
            </div>

            <div>
              <label htmlFor="note" className="block text-xs uppercase tracking-wider font-medium text-neutral-700 mb-1.5">
                Notas adicionales (opcional)
              </label>
              <textarea
                id="note"
                name="note"
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 bg-[#FAF8F5]/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                placeholder="Instrucciones de envío, empaque de regalo, etc."
              />
            </div>
          </div>

          {/* Consentimiento Ley 1581 */}
          <div className="flex items-start gap-3 pt-1">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand/30 border-neutral-300"
            />
            <label htmlFor="consent" className="text-xs text-neutral-600 leading-relaxed">
              {CONSENT_TEXT}{' '}
              <a href={PRIVACY_URL} className="underline hover:text-neutral-900 font-medium">
                Ver política de privacidad
              </a>
              .
            </label>
          </div>

          {/* Mensaje de Error */}
          {state.status === 'error' && state.errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm"
            >
              {state.errorMessage}
            </div>
          )}

          {/* Botón de Enviar Krafti (Centrado, elegante y no expandido de borde a borde) */}
          <div className="flex flex-col items-center justify-center pt-3 pb-1">
            <button
              type="submit"
              disabled={isPending}
              className="px-10 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-full text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? 'Enviando solicitud…' : 'Confirmar pedido'}
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-3.5 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>Sin pasarelas ni cobro automático a tarjeta. Shirley se comunica directamente contigo.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
