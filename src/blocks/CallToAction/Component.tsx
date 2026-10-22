import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { MessageCircle, MapPin, Clock, Sparkles } from 'lucide-react'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'

export const CallToActionBlock: React.FC<
  CTABlockProps & {
    id?: string | number
    className?: string
  }
> = ({ id, links, richText }) => {
  const whatsappPhone = process.env.NEXT_PUBLIC_SHIRLEY_WHATSAPP?.replace(/\D/g, '') || ''
  const defaultWhatsappMessage = encodeURIComponent(
    'Hola Shirley, me gustaría encargar una joya personalizada a mi medida ✨',
  )
  const defaultWhatsappUrl = `https://wa.me/${whatsappPhone ? whatsappPhone : ''}?text=${defaultWhatsappMessage}`

  return (
    <section id={String(id || 'contacto')} className="container py-16 lg:py-24 scroll-mt-24 overflow-hidden">
      <ScrollReveal variant="scale-up" duration={900}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/5 via-[#FAF8F5] to-brand/10 dark:from-[#1E0D29] dark:via-[#160B24] dark:to-[#2A0E38] border border-brand/15 dark:border-brand/25 p-8 sm:p-12 lg:p-16 shadow-sm">
          {/* Resplandor ambiental decorativo sutil (solo en esquina superior derecha) */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/10 dark:bg-brand/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Columna Izquierda: Mensaje y Detalles del Taller */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/20 text-brand dark:text-[#FF4FA3] text-xs uppercase tracking-widest font-semibold shadow-xs">
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
                    <p className="text-muted-foreground dark:text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                      Shirley confecciona piezas personalizadas en mostacilla calibrada y filigrana a tu medida. Elige los tonos, el largo y los símbolos caribeños que deseas llevar contigo.
                    </p>
                  </>
                )}
              </div>

              {/* Micro tarjetas informativas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-brand/15 dark:border-white/10 backdrop-blur-sm shadow-xs transition-all duration-300 hover:border-brand/30">
                  <div className="w-10 h-10 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand dark:text-[#FF4FA3] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Taller Artesanal</h4>
                    <p className="text-xs text-muted-foreground dark:text-white/70">Cartagena de Indias, Colombia</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-brand/15 dark:border-white/10 backdrop-blur-sm shadow-xs transition-all duration-300 hover:border-brand/30">
                  <div className="w-10 h-10 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand dark:text-[#FF4FA3] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Atención Directa</h4>
                    <p className="text-xs text-muted-foreground dark:text-white/70">Respuesta en menos de 24h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Acciones de Contacto */}
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-4">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto items-stretch lg:items-end">
                {links && links.length > 0 ? (
                  links.map(({ link }, i) => {
                    const isPersonalizeOrContact =
                      link.url === '/contacto' ||
                      link.url === '#contacto' ||
                      link.label?.toLowerCase().includes('personalizar')

                    if (isPersonalizeOrContact) {
                      return (
                        <a
                          key={i}
                          href={defaultWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] hover:shadow-[0_6px_28px_rgba(233,30,140,0.45)] transition-all duration-300 w-full sm:w-auto text-center cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {link.label || 'Personalizar mi Joya'}
                        </a>
                      )
                    }

                    return (
                      <CMSLink
                        key={i}
                        size="lg"
                        className="rounded-full px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] hover:shadow-[0_6px_28px_rgba(233,30,140,0.45)] transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
                        {...link}
                      />
                    )
                  })
                ) : (
                  <a
                    href={defaultWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] hover:shadow-[0_6px_28px_rgba(233,30,140,0.45)] transition-all duration-300 w-full sm:w-auto text-center cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Personalizar mi Joya
                  </a>
                )}
                <p className="text-[11px] text-muted-foreground dark:text-white/60 tracking-wider uppercase text-center lg:text-right pt-1">
                  ✦ Atención directa por Shirley · Sin compromiso
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
