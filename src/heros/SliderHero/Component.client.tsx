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
  const chipsRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia(containerRef)

      const textElements = [
        badgeRef.current,
        headingRef.current,
        chipsRef.current,
        actionsRef.current,
      ].filter(Boolean)

      // Desktop & Tablet landscape (>= 1024px)
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        // 1. Imagen desciende suavemente
        if (imgRef.current) {
          tl.fromTo(
            imgRef.current,
            { y: -35, opacity: 0.85, scale: 1, x: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
            0.05,
          )

          // 2. Zoom cinematográfico que mantiene la palenquera completa y eleva la flor del collar
          tl.to(
            imgRef.current,
            {
              scale: 1.35,
              transformOrigin: '51.8% 25%',
              x: 50,
              y: -45,
              duration: 1.8,
              ease: 'power2.inOut',
            },
            '+=0.05',
          )
        }

        // 3. Texto entra elegante desde abajo
        if (textElements.length > 0) {
          tl.from(
            textElements,
            {
              y: 45,
              opacity: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            0.25,
          )
        }
      })

      // Tablet portrait (768px - 1023px)
      mm.add('(min-width: 768px) and (max-width: 1023px)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        if (textElements.length > 0) {
          tl.from(
            textElements,
            {
              y: 35,
              opacity: 0,
              duration: 0.75,
              stagger: 0.07,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            0.1,
          )
        }

        if (imgRef.current) {
          tl.fromTo(
            imgRef.current,
            { y: -20, opacity: 0.85, scale: 1 },
            { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' },
            0.05,
          )

          tl.to(
            imgRef.current,
            {
              scale: 1.35,
              transformOrigin: '51.8% 25%',
              y: 15,
              duration: 1.5,
              ease: 'power2.inOut',
            },
            '+=0.05',
          )
        }
      })

      // Mobile (< 768px)
      mm.add('(max-width: 767px)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        // En móvil el texto entra INMEDIATAMENTE para garantizar visibilidad total
        if (textElements.length > 0) {
          tl.from(
            textElements,
            {
              y: 25,
              opacity: 0,
              duration: 0.65,
              stagger: 0.05,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            0.05,
          )
        }

        // En móvil zoom suave y proporcionado al collar sin salirse del marco ni tapar textos
        if (imgRef.current) {
          tl.fromTo(
            imgRef.current,
            { y: -12, opacity: 0.9, scale: 1 },
            { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
            0.05,
          )

          tl.to(
            imgRef.current,
            {
              scale: 1.25,
              transformOrigin: '51.8% 30%',
              duration: 1.4,
              ease: 'power2.inOut',
            },
            '+=0.05',
          )
        }
      })

      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen min-h-[100dvh] -mt-[74px] sm:-mt-[78px] pt-[78px] sm:pt-[88px] lg:pt-[105px] pb-0 bg-[#DBC4AC] border-b border-[#C8AF95]/60 flex flex-col justify-between overflow-hidden select-none transition-colors duration-500"
    >
      <div className="relative z-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-0 lg:mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-end">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: Titular, Badge, Tabs, CTA & Redes      */}
          {/* ========================================================= */}
          <div className="md:col-span-7 flex flex-col items-start text-left max-w-2xl pt-2 sm:pt-4 md:py-8 lg:py-16">
            {/* Badge superior */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#F4ECE3] border border-[#C8AF95] shadow-xs mb-2.5 sm:mb-4 lg:mb-5 backdrop-blur-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.25em] text-[#8B5A2B]">
                ALTA JOYERÍA ARTESANAL
              </span>
            </div>

            {/* Titular H1 */}
            <h1
              ref={headingRef}
              className="font-serif text-[1.75rem] leading-[1.12] sm:text-4xl md:text-5xl lg:text-[3.4rem] xl:text-[4rem] text-[#1A0E2E] dark:text-white font-normal tracking-tight mb-2.5 sm:mb-4 lg:mb-6"
            >
              La nobleza del Caribe no se hereda.{' '}
              <span className="italic font-light text-brand">
                Se teje.
              </span>
            </h1>

            {/* Tabs / Sellos de Confianza */}
            <div ref={chipsRef} className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mb-3.5 sm:mb-5 lg:mb-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#F4ECE3] border border-[#C8AF95] text-[11px] sm:text-xs font-medium text-[#1A0E2E] shadow-xs">
                <span className="text-[#8B5A2B] text-xs sm:text-sm">✦</span>
                <span>Piezas únicas de autor</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#F4ECE3] border border-[#C8AF95] text-[11px] sm:text-xs font-medium text-[#1A0E2E] shadow-xs">
                <span className="text-[#8B5A2B] text-xs sm:text-sm">✨</span>
                <span>Micro-mostacilla checa calibrada</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#F4ECE3] border border-[#C8AF95] text-[11px] sm:text-xs font-medium text-[#1A0E2E] shadow-xs">
                <span className="text-xs sm:text-sm">📦</span>
                <span>Envíos asegurados a Colombia</span>
              </div>
            </div>

            {/* CTA Principal hacia el Catálogo & Redes Sociales */}
            <div ref={actionsRef} className="flex flex-wrap items-center gap-2.5 sm:gap-4 lg:gap-5">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-brand hover:bg-brand-dark active:scale-95 text-white font-sans text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              >
                <span>Conoce la colección</span>
                <span className="text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>

              {/* Redes Sociales */}
              <div
                className="inline-flex items-center gap-2.5 sm:gap-3 text-neutral-700 bg-[#F4ECE3] backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#C8AF95] shadow-xs"
                role="navigation"
                aria-label="Redes sociales de Nénufar"
              >
                <a
                  href="https://www.instagram.com/nenufar.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Nénufar"
                  className="p-1 text-neutral-600 hover:text-brand transition-all duration-200 hover:scale-115 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
                  className="p-1 text-neutral-600 hover:text-brand transition-all duration-200 hover:scale-115 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram de Nénufar"
                  className="p-1 text-neutral-600 hover:text-brand transition-all duration-200 hover:scale-115 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.54c-.15.68-.56.84-1.12.52l-3.1-2.28-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12l-7.14 4.5-3.08-.96c-.67-.21-.68-.67.14-.99l12.04-4.64c.56-.2 1.05.14.81 1.06z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ESPACIO RESERVADO COLUMNA DERECHA (Desktop/Tablet Grid)   */}
          {/* ========================================================= */}
          <div className="hidden md:block md:col-span-5 h-1 pointer-events-none" />

        </div>
      </div>

      {/* ========================================================= */}
      {/* FOTOGRAFÍA EN PRIMER PLANO (Sin recortes en las manos)    */}
      {/* ========================================================= */}
      <div
        ref={modelRef}
        className="relative md:absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-10 xl:bottom-12 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-2 lg:right-8 xl:right-16 h-[38vh] sm:h-[46vh] md:h-[68vh] lg:h-[78vh] xl:h-[84vh] w-full md:w-auto flex items-end justify-center pointer-events-none z-10 select-none overflow-hidden md:overflow-visible"
      >
        <img
          ref={imgRef}
          src="/shirley-sin-fondo.svg"
          alt="Shirley luciendo alta joyería artesanal en micro-mostacilla Nénufar"
          className="w-auto h-full max-h-[86vh] object-contain object-bottom select-none drop-shadow-none will-change-transform"
          loading="eager"
        />
      </div>
    </section>
  )
}




