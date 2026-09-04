'use client'

import type { Media } from '@/payload-types'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export type Slide = {
  modelImage?: number | Media | null
  image: number | Media
  imagePosition?: 'top' | 'center' | 'bottom' | null
  badge?: string | null
  heading: string
  metaText?: string | null
  subheading?: string | null
  tabTitle?: string | null
  linkLabel?: string | null
  linkUrl?: string | null
}

export const SliderHeroClient: React.FC<{
  slides: Slide[]
  fallbackRichText?: any
  fallbackLinks?: any
  authorMedia?: number | Media | null
}> = ({ slides }) => {
  const containerRef = useRef<HTMLElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const activeSlide = slides?.[0]

  const badgeText =
    activeSlide?.badge || 'HERENCIA AFRO-CARIBEÑA & ALTA ARTESANÍA'
  const rawHeading =
    activeSlide?.heading || 'La nobleza del Caribe no se hereda. Se teje.'
  const subheadingText =
    activeSlide?.subheading ||
    'Micro-mostacilla checa tejida con la dignidad, el color y la memoria viva de nuestras raíces. Piezas de autor creadas por Shirley en Cartagena para mujeres que caminan con la frente en alto.'

  useGSAP(
    () => {
      // 1. Animación de entrada refinada al montar
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (badgeRef.current) {
        tl.from(badgeRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
        })
      }

      if (headingRef.current) {
        tl.from(
          headingRef.current,
          {
            y: 35,
            opacity: 0,
            duration: 1,
          },
          '-=0.5',
        )
      }

      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.9,
          },
          '-=0.6',
        )
      }

      if (chipsRef.current) {
        tl.from(
          chipsRef.current.children,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.5',
        )
      }

      if (imageRef.current) {
        tl.from(
          imageRef.current,
          {
            y: 50,
            scale: 0.92,
            opacity: 0,
            duration: 1.3,
            ease: 'power2.out',
          },
          '-=1.1',
        )
      }

      if (glowRef.current) {
        tl.from(
          glowRef.current,
          {
            scale: 0.7,
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
          },
          '-=1.2',
        )
      }

      // 2. Micro-respiración orgánica sutil (flotado continuo de alta gama)
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: -10,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // 3. GSAP ScrollTrigger: Parallax dinámico al hacer scroll
      if (imageWrapperRef.current && containerRef.current) {
        gsap.to(imageWrapperRef.current, {
          yPercent: 22,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }

      if (glowRef.current && containerRef.current) {
        gsap.to(glowRef.current, {
          yPercent: 30,
          scale: 1.3,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      }
    },
    { scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[90vh] lg:min-h-[94vh] -mt-[74px] sm:-mt-[78px] pt-[95px] sm:pt-[105px] lg:pt-[110px] pb-12 sm:pb-16 lg:pb-20 bg-[#FAF8FC] dark:bg-[#120A1E] flex items-center overflow-hidden select-none transition-colors duration-500"
    >
      {/* Resplandor ambiental de fondo cálido / rosa acento suave detrás de la fotografía */}
      <div
        ref={glowRef}
        className="absolute top-1/4 -right-12 sm:-right-20 w-[460px] sm:w-[650px] lg:w-[820px] h-[460px] sm:h-[650px] lg:h-[820px] bg-gradient-to-bl from-[#FF4FA3]/20 via-[#E91E8C]/12 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <div className="absolute -bottom-16 left-1/12 w-[350px] h-[350px] bg-gradient-to-tr from-[#3D1A5B]/8 via-[#FF4FA3]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: Titular, Badge y Subtítulo             */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 z-10 flex flex-col items-start text-left max-w-2xl">
            {/* Badge superior (Rosa Acento #FF4FA3) */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FF4FA3]/10 dark:bg-[#FF4FA3]/15 border border-[#FF4FA3]/30 shadow-xs mb-5 sm:mb-6 backdrop-blur-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4FA3] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#FF4FA3]">
                {badgeText}
              </span>
            </div>

            {/* Titular H1 (Tipografía Serif / Neutro Oscuro #1A0E2E) */}
            <h1
              ref={headingRef}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] xl:text-[4.2rem] text-[#1A0E2E] dark:text-[#FAF8FC] font-normal leading-[1.1] tracking-tight mb-5 sm:mb-6"
            >
              {rawHeading}
            </h1>

            {/* Subtítulo (Contraste cálido y fluido) */}
            <p
              ref={subtitleRef}
              className="font-sans font-normal text-base sm:text-lg lg:text-[1.125rem] text-[#3D1A5B]/90 dark:text-[#FAF8FC]/85 leading-[1.7] max-w-xl mb-7 sm:mb-8"
            >
              {subheadingText}
            </p>

            {/* Sellos de Calidad y Valor de Marca (Sin Botones) */}
            <div ref={chipsRef} className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">🪡</span>
                <span>100% Hecho a mano</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">✨</span>
                <span>Micro-mostacilla checa</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">📍</span>
                <span>Cartagena de Indias</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: Fotografía Real Palenquera + GSAP Parallax */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
            <div
              ref={imageWrapperRef}
              className="relative w-full max-w-[380px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[620px] flex justify-center will-change-transform"
            >
              <picture>
                <source srcSet="/landing-morena.webp" type="image/webp" />
                <img
                  ref={imageRef}
                  src="/landing-morena.webp"
                  alt="Mujer palenquera luciendo joyería en micro-mostacilla Nénufar"
                  className="w-full h-auto max-h-[62vh] sm:max-h-[72vh] lg:max-h-[80vh] object-contain drop-shadow-[0_25px_45px_rgba(61,26,91,0.18)] select-none will-change-transform"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

