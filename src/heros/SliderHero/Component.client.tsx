'use client'

import type { Media } from '@/payload-types'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export type Slide = {
  modelImage?: number | Media | null
  image?: number | Media
  imagePosition?: 'top' | 'center' | 'bottom' | null
  badge?: string | null
  heading?: string
  metaText?: string | null
  subheading?: string | null
  tabTitle?: string | null
  linkLabel?: string | null
  linkUrl?: string | null
}

export const SliderHeroClient: React.FC<{
  slides?: Slide[]
  fallbackRichText?: any
  fallbackLinks?: any
  authorMedia?: number | Media | null
}> = () => {
  const containerRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const socialsRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (badgeRef.current) {
        tl.from(badgeRef.current, { y: 20, opacity: 0, duration: 0.8 })
      }
      if (headingRef.current) {
        tl.from(headingRef.current, { y: 35, opacity: 0, duration: 1 }, '-=0.5')
      }
      if (chipsRef.current) {
        tl.from(
          chipsRef.current.children,
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
          '-=0.5',
        )
      }
      if (socialsRef.current) {
        tl.from(socialsRef.current, { y: 15, opacity: 0, duration: 0.6 }, '-=0.4')
      }
      if (glowRef.current) {
        tl.from(
          glowRef.current,
          { scale: 0.7, opacity: 0, duration: 1.5, ease: 'power2.out' },
          '-=1.2',
        )
      }
    },
    { scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[90vh] lg:min-h-[94vh] -mt-[74px] sm:-mt-[78px] pt-[95px] sm:pt-[105px] lg:pt-[110px] pb-0 bg-[#FAF8FC] dark:bg-[#120A1E] flex flex-col justify-between overflow-hidden select-none transition-colors duration-500"
    >
      {/* Resplandor ambiental de iluminación suave (Derecha e Izquierda) */}
      <div
        ref={glowRef}
        className="absolute top-1/4 -right-12 sm:-right-20 w-[460px] sm:w-[650px] lg:w-[820px] h-[460px] sm:h-[650px] lg:h-[820px] bg-gradient-to-bl from-[#FF4FA3]/18 via-[#E91E8C]/10 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <div
        className="absolute top-1/6 -left-16 sm:-left-24 w-[440px] sm:w-[600px] lg:w-[740px] h-[440px] sm:h-[600px] lg:h-[740px] bg-gradient-to-br from-[#FF4FA3]/14 via-[#6A1B9A]/8 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <div className="absolute -bottom-16 left-1/12 w-[350px] h-[350px] bg-gradient-to-tr from-[#3D1A5B]/8 via-[#FF4FA3]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-end">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: Titular, Badge, Chips (Elevado)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-2xl pb-24 sm:pb-32 lg:pb-36 pt-6 sm:pt-8">
            {/* Badge superior (Rosa Oscuro de Alto Contraste) */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FDF2F8] dark:bg-[#831843]/25 border border-[#E91E8C]/30 dark:border-[#FF4FA3]/30 shadow-2xs mb-5 sm:mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#B01255] dark:bg-[#FF4FA3] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#9D174D] dark:text-[#FF80BF]">
                ALTA JOYERÍA ARTESANAL & EDICIÓN LIMITADA
              </span>
            </div>

            {/* Titular H1 (Tipografía de la página: Serif / Neutro Oscuro #1A0E2E) */}
            <h1
              ref={headingRef}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] xl:text-[4.2rem] text-[#1A0E2E] dark:text-[#FAF8FC] font-normal leading-[1.1] tracking-tight mb-6 sm:mb-8"
            >
              La nobleza del Caribe no se hereda.{' '}
              <span className="italic font-light opacity-95">Se teje.</span>
            </h1>

            {/* Sellos de Confianza y Gatillos de Compra (Sin Botones) */}
            <div ref={chipsRef} className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">✦</span>
                <span>Piezas únicas de autor</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">✨</span>
                <span>Micro-mostacilla checa calibrada</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">📦</span>
                <span>Envíos asegurados a Colombia</span>
              </div>
            </div>

            {/* Redes Sociales justo debajo de los tags */}
            <div
              ref={socialsRef}
              className="inline-flex items-center gap-4 sm:gap-5 text-[#3D1A5B]/85 dark:text-white/90 bg-white/75 dark:bg-black/40 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#E8E0F0] dark:border-white/15 shadow-md mt-6 sm:mt-7"
              role="navigation"
              aria-label="Redes sociales de Nénufar"
            >
              <a
                href="https://www.instagram.com/nenufar.co/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Nénufar"
                className="p-1 hover:text-[#E91E8C] transition-all duration-200 hover:scale-125 cursor-pointer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://wa.me/?text=Hola%2C%20quisiera%20consultar%20sobre%20las%20joyas%20artesanales%20de%20N%C3%A9nufar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de Nénufar"
                className="p-1 hover:text-[#25D366] transition-all duration-200 hover:scale-125 cursor-pointer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram de Nénufar"
                className="p-1 hover:text-[#0088cc] transition-all duration-200 hover:scale-125 cursor-pointer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.54c-.15.68-.56.84-1.12.52l-3.1-2.28-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12l-7.14 4.5-3.08-.96c-.67-.21-.68-.67.14-.99l12.04-4.64c.56-.2 1.05.14.81 1.06z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ESPACIO RESERVADO COLUMNA DERECHA (Desktop Grid)         */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-5 h-1 pointer-events-none" />

        </div>
      </div>

      {/* ========================================================= */}
      {/* FOTOGRAFÍA EN PRIMER PLANO (Sin recortes en las manos)    */}
      {/* ========================================================= */}
      <div
        ref={modelRef}
        className="relative md:absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 lg:right-8 xl:right-16 h-[50vh] sm:h-[60vh] md:h-[68vh] lg:h-[75vh] xl:h-[78vh] flex items-end justify-center pointer-events-none z-10 select-none"
      >
        <img
          src="/hero-woman-uncropped.webp"
          alt="Mujer luciendo alta joyería artesanal en micro-mostacilla Nénufar"
          className="w-auto h-full max-h-[82vh] object-contain object-bottom select-none drop-shadow-none"
          loading="eager"
        />
      </div>
    </section>
  )
}



