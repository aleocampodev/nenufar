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
  const narrativeRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (narrativeRef.current) {
        tl.from(narrativeRef.current, {
          y: 25,
          opacity: 0,
          duration: 0.9,
        })
      }

      if (headingRef.current) {
        tl.from(
          headingRef.current,
          {
            y: 35,
            opacity: 0,
            duration: 1.1,
          },
          '-=0.6',
        )
      }

      if (modelRef.current) {
        tl.from(
          modelRef.current,
          {
            y: 50,
            scale: 0.95,
            opacity: 0,
            duration: 1.3,
            ease: 'power2.out',
          },
          '-=0.9',
        )
      }
    },
    { scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[92vh] -mt-[74px] sm:-mt-[78px] pt-[74px] sm:pt-[78px] bg-gradient-to-br from-[#C84E34] via-[#B84028] to-[#9E301B] overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Resplandor ambiental de iluminación suave */}
      <div className="absolute top-1/4 right-1/4 w-[550px] h-[550px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenedor Principal Closca */}
      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 w-full h-full min-h-[calc(100vh-78px)] flex flex-col justify-between py-8 sm:py-12 lg:py-16 z-20">
        
        {/* PARTE SUPERIOR IZQUIERDA: Párrafo Narrativo Closca */}
        <div ref={narrativeRef} className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <p className="font-sans font-light text-white/90 text-xs sm:text-sm md:text-[15px] leading-relaxed tracking-wide">
            Micro-mostacilla checa calibrada, tejida a mano con precisión milimétrica y la memoria viva del Caribe. Piezas de autor exclusivas creadas para elevar tu estilo con una joya irrepetible que cuenta una historia viva.
          </p>
        </div>

        {/* PARTE INFERIOR: Titular H1 Editorial (Izquierda) y Enlace de Catálogo (Derecha) */}
        <div
          ref={headingRef}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2"
        >
          <div className="max-w-2xl">
            {/* Eyebrow en Versalitas */}
            <div className="text-[10px] sm:text-xs font-sans font-medium uppercase tracking-[0.25em] text-white/80 mb-2 sm:mb-3">
              ALTA JOYERÍA ARTESANAL & EDICIÓN LIMITADA
            </div>

            {/* Titular H1 de Gran Escala con Cursiva */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.8rem] xl:text-[4.6rem] text-white font-normal leading-[1.05] tracking-tight">
              La nobleza del Caribe no se hereda.{' '}
              <span className="italic font-light opacity-95">
                Se teje.
              </span>
            </h1>
          </div>

          {/* Enlace Sutil Closca */}
          <div className="md:self-end pt-2 md:pt-0">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white text-xs sm:text-sm font-sans font-medium tracking-wider uppercase transition-all"
            >
              <span>Explorar Catálogo</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* CENTRO-DERECHA: Imagen Única de la Modelo (Estilo Closca) */}
      {/* ========================================================= */}
      <div
        ref={modelRef}
        className="absolute bottom-0 right-6 sm:right-14 md:right-24 lg:right-32 xl:right-44 h-[76%] sm:h-[85%] lg:h-[93%] max-w-[380px] sm:max-w-[500px] lg:max-w-[650px] flex items-end justify-center pointer-events-none z-10"
      >
        <img
          src="/hero-model-closca.webp"
          alt="Mujer luciendo alta joyería artesanal en micro-mostacilla Nénufar"
          className="w-full h-full object-contain select-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.32)] [mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)]"
          loading="eager"
        />
      </div>

    </section>
  )
}


