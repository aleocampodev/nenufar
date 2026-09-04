'use client'

import type { Media } from '@/payload-types'
import React, { useRef } from 'react'
import Link from 'next/link'
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
  const ctaRef = useRef<HTMLDivElement>(null)
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
      if (ctaRef.current) {
        tl.from(ctaRef.current, { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
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
    <>
      <section
        ref={containerRef}
        className="relative w-full min-h-[86vh] lg:min-h-[92vh] -mt-[74px] sm:-mt-[78px] pt-[95px] sm:pt-[105px] lg:pt-[110px] pb-0 bg-[#FAF8FC] dark:bg-[#120A1E] flex flex-col justify-between overflow-hidden select-none transition-colors duration-500"
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
            {/* COLUMNA IZQUIERDA: Titular, Badge, CTA                    */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 flex flex-col items-start text-left max-w-2xl pb-24 sm:pb-32 lg:pb-36 pt-6 sm:pt-8">
              {/* Badge superior (Magenta Vibrante #E91E8C) */}
              <div
                ref={badgeRef}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FDF2F8] dark:bg-[#E91E8C]/20 border border-[#E91E8C]/40 dark:border-[#E91E8C]/50 shadow-2xs mb-5 sm:mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-[#E91E8C] animate-pulse shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#E91E8C] dark:text-[#FF66B2]">
                  ALTA JOYERÍA ARTESANAL & EDICIÓN LIMITADA
                </span>
              </div>

              {/* Titular H1 (Tipografía de la página: Serif / Neutro Oscuro #1A0E2E + Acento Magenta Vibrante #E91E8C) */}
              <h1
                ref={headingRef}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] xl:text-[4.2rem] text-[#1A0E2E] dark:text-[#FAF8FC] font-normal leading-[1.1] tracking-tight mb-8 sm:mb-10"
              >
                La nobleza del Caribe no se hereda.{' '}
                <span className="italic font-light text-[#E91E8C] dark:text-[#FF60AB]">
                  Se teje.
                </span>
              </h1>

              {/* CTA Principal hacia el Catálogo */}
              <div ref={ctaRef}>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#E91E8C] hover:bg-[#D81B60] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold uppercase tracking-widest shadow-lg shadow-[#E91E8C]/25 hover:shadow-xl hover:shadow-[#E91E8C]/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                >
                  <span>Conoce la colección</span>
                  <span className="text-base transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
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

      {/* ========================================================= */}
      {/* BARRA DE PROPUESTA DE VALOR (Debajo del Hero)            */}
      {/* ========================================================= */}
      <div className="relative z-20 w-full bg-white dark:bg-[#160D27] border-y border-[#E8E0F0] dark:border-[#2D1A4A] py-4 shadow-xs transition-colors">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-around gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-[#1A0E2E]/85 dark:text-white/90">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#E91E8C]">✦</span>
            <span>Piezas únicas de autor</span>
          </div>
          <div className="hidden sm:inline-block text-[#E8E0F0] dark:text-[#2D1A4A]">•</div>
          <div className="flex items-center gap-2">
            <span className="text-base text-[#E91E8C]">✨</span>
            <span>Micro-mostacilla checa calibrada</span>
          </div>
          <div className="hidden sm:inline-block text-[#E8E0F0] dark:text-[#2D1A4A]">•</div>
          <div className="flex items-center gap-2">
            <span className="text-base text-[#E91E8C]">📦</span>
            <span>Envíos asegurados a toda Colombia</span>
          </div>
        </div>
      </div>
    </>
  )
}



