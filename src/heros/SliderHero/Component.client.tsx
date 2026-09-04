'use client'

import type { Media } from '@/payload-types'
import React from 'react'

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
  const activeSlide = slides?.[0]

  const badgeText =
    activeSlide?.badge || 'HERENCIA AFRO-CARIBEÑA & ALTA ARTESANÍA'
  const rawHeading =
    activeSlide?.heading || 'La nobleza del Caribe no se hereda. Se teje.'
  const subheadingText =
    activeSlide?.subheading ||
    'Micro-mostacilla checa tejida con la dignidad, el color y la memoria viva de nuestras raíces. Piezas de autor creadas por Shirley en Cartagena para mujeres que caminan con la frente en alto.'

  // Destacar poéticamente la última frase en cursiva de lujo
  const highlightWord = 'Se teje.'
  const hasHighlight = rawHeading.includes(highlightWord)
  const headingPrefix = hasHighlight
    ? rawHeading.replace(highlightWord, '').trim()
    : rawHeading

  return (
    <section className="relative w-full min-h-[88vh] lg:min-h-[92vh] -mt-[74px] sm:-mt-[78px] pt-[95px] sm:pt-[105px] lg:pt-[110px] pb-12 sm:pb-16 lg:pb-20 bg-[#FAF8FC] dark:bg-[#120A1E] flex items-center overflow-hidden select-none transition-colors duration-500">
      {/* Resplandor ambiental de fondo cálido / magenta suave detrás de la ilustración */}
      <div className="absolute top-1/4 -right-20 w-[420px] sm:w-[600px] lg:w-[750px] h-[420px] sm:h-[600px] lg:h-[750px] bg-gradient-to-bl from-[#E91E8C]/12 via-[#FF4FA3]/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-1/12 w-[350px] h-[350px] bg-gradient-to-tr from-[#3D1A5B]/8 via-[#FF4FA3]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: Titular, Badge y Subtítulo Neuromarketing */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 z-10 flex flex-col items-start text-left max-w-2xl">
            {/* Badge Eyebrow con aura sutil */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 dark:bg-[#1A0E2E]/90 border border-[#E8E0F0] dark:border-[#2D1A4A] shadow-xs mb-5 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-[#E91E8C] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#E91E8C]">
                {badgeText}
              </span>
            </div>

            {/* Titular H1 de Impacto Editorial */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] xl:text-[4.1rem] text-[#1A0E2E] dark:text-white font-normal leading-[1.08] tracking-tight mb-5 sm:mb-6">
              {headingPrefix}{' '}
              {hasHighlight && (
                <span className="text-[#E91E8C] font-serif italic font-light">
                  {highlightWord}
                </span>
              )}
            </h1>

            {/* Párrafo Narrativo de Alta Conexión Emocional */}
            <p className="font-sans font-light text-sm sm:text-base md:text-lg text-[#3D1A5B]/85 dark:text-white/80 leading-relaxed max-w-xl mb-7 sm:mb-8">
              {subheadingText}
            </p>

            {/* Sellos de Calidad y Valor de Marca (Sin Botones) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">🪡</span>
                <span>100% Hecho a mano</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">✨</span>
                <span>Micro-mostacilla checa</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#1A0E2E]/80 border border-[#E8E0F0] dark:border-[#2D1A4A] text-xs font-medium text-[#1A0E2E] dark:text-white/90 shadow-2xs backdrop-blur-xs">
                <span className="text-sm">📍</span>
                <span>Cartagena de Indias</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: Ilustración Vectorial Mujer Palenquera   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end mt-2 lg:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[540px] flex justify-center">
              <img
                src="/landing-modify-traced.svg"
                alt="Mujer palenquera con joyería en micro-mostacilla Nénufar"
                className="w-full h-auto max-h-[55vh] sm:max-h-[64vh] lg:max-h-[72vh] object-contain drop-shadow-[0_20px_35px_rgba(61,26,91,0.12)] select-none transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
