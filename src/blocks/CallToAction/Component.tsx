import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { MessageCircle, ShieldCheck, Clock, Sparkles } from 'lucide-react'

export const CallToActionBlock: React.FC<
  CTABlockProps & {
    id?: string | number
    className?: string
  }
> = ({ id, links, richText }) => {
  const whatsappUrl = `https://wa.me/573000000000?text=${encodeURIComponent(
    'Hola Shirley, vi la tienda de Nénufar y me gustaría cotizar una joya personalizada ✨',
  )}`

  return (
    <section id={String(id || 'contacto')} className="container py-16 lg:py-24 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/5 via-[#FAF8F5] to-brand/10 dark:from-zinc-900 dark:to-zinc-900/60 border border-brand/15 p-8 sm:p-12 lg:p-16 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Mensaje de Atención Directa */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Atención Directa & Diseños a Medida
            </div>

            <div className="space-y-4">
              {richText ? (
                <RichText className="mb-0 font-serif" data={richText} enableGutter={false} />
              ) : (
                <>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
                    ¿Buscas una joya personalizada?
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl font-light">
                    Shirley confecciona piezas a tu medida con tus colores favoritos, dimensiones especiales o para fechas inolvidables. Escríbele directamente a su WhatsApp para coordinar tu diseño.
                  </p>
                </>
              )}
            </div>

            {/* Micro tarjetas de confianza y atención directa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/60 border border-brand/10 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Asesoría de Autor</h4>
                  <p className="text-xs text-muted-foreground">Shirley te atiende directamente</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/60 border border-brand/10 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Respuesta Rápida</h4>
                  <p className="text-xs text-muted-foreground">Coordinación directa por WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Botón Directo a WhatsApp */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(106,27,154,0.25)] hover:shadow-[0_6px_25px_rgba(106,27,154,0.35)] hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Escribir a Shirley por WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
