import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { MessageCircle, MapPin, Clock, Sparkles } from 'lucide-react'

export const CallToActionBlock: React.FC<
  CTABlockProps & {
    id?: string | number
    className?: string
  }
> = ({ id, links, richText }) => {
  return (
    <section id={String(id || 'contacto')} className="container py-16 lg:py-24 scroll-mt-24">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/5 via-[#FAF8F5] to-brand/10 dark:from-zinc-900 dark:to-zinc-900/60 border border-brand/15 p-8 sm:p-12 lg:p-16 shadow-sm">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Mensaje y Detalles del Taller */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Contacto & Pedidos Especiales
            </div>

            <div className="space-y-4">
              {richText ? (
                <RichText className="mb-0 font-serif" data={richText} enableGutter={false} />
              ) : (
                <>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
                    ¿Sueñas con una joya única?
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl font-light">
                    Shirley confecciona piezas personalizadas en mostacilla calibrada y filigrana a tu medida. Elige los tonos, el largo y los símbolos caribeños que deseas llevar contigo.
                  </p>
                </>
              )}
            </div>

            {/* Micro tarjetas informativas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-brand/10">
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Taller Artesanal</h4>
                  <p className="text-xs text-muted-foreground">Cartagena de Indias, Colombia</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-brand/10">
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Atención Directa</h4>
                  <p className="text-xs text-muted-foreground">Respuesta en menos de 24h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Acciones de Contacto */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-4">
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              {(links && links.length > 0) ? (
                links.map(({ link }, i) => (
                  <CMSLink
                    key={i}
                    size="lg"
                    className="rounded-full px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(106,27,154,0.25)] hover:shadow-[0_6px_25px_rgba(106,27,154,0.35)] transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
                    {...link}
                  />
                ))
              ) : (
                <a
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-xs uppercase tracking-wider font-medium bg-brand hover:bg-brand-dark text-white shadow-md transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  Explorar Colección de Autor
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
