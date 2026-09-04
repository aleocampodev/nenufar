'use client'

import type { Media } from '@/payload-types'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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

const closcaSlides = [
  {
    number: '01',
    eyebrow: 'ALTA JOYERÍA ARTESANAL & EDICIÓN LIMITADA',
    headingPrefix: 'La nobleza del Caribe no se hereda.',
    headingHighlight: 'Se teje.',
    narrative:
      'Micro-mostacilla checa calibrada, tejida a mano con precisión milimétrica y la memoria viva del Caribe. Piezas de autor exclusivas creadas para elevar tu estilo con una joya irrepetible que cuenta una historia viva.',
    bgGradient: 'from-[#C84E34] via-[#B84028] to-[#9E301B]',
    image: '/hero-model-closca.webp',
    imageAlt: 'Mujer luciendo alta joyería artesanal en micro-mostacilla Nénufar',
    isPortrait: true,
    linkLabel: 'Explorar Catálogo',
    linkUrl: '/shop',
  },
  {
    number: '02',
    eyebrow: 'EXPERIENCIAS & APRENDIZAJE ANCESTRAL',
    headingPrefix: 'El arte de tejer historias vivas.',
    headingHighlight: 'En comunidad.',
    narrative:
      'Aprende la técnica milenaria de la mostacilla en talleres presenciales de grupos reducidos en Cartagena de Indias. Conéctate con la sabiduría de nuestras raíces a través de tus propias manos.',
    bgGradient: 'from-[#3D1A5B] via-[#32134C] to-[#250B3A]',
    image:
      'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/talleres-comunidad.jpeg',
    imageAlt: 'Talleres que Tejen Comunidad en Cartagena - Nénufar',
    isPortrait: false,
    linkLabel: 'Ver Próximos Talleres',
    linkUrl: '/eventos',
  },
  {
    number: '03',
    eyebrow: 'ENCUENTROS & POP-UPS EN CARTAGENA',
    headingPrefix: 'Encuéntranos en el corazón del Caribe.',
    headingHighlight: 'En vivo.',
    narrative:
      'Descubre nuestras piezas de autor en las ferias artesanales y mercados de diseño más emblemáticos de Cartagena: Centro Histórico y Getsemaní. Siente la textura y el brillo de cada joya de cerca.',
    bgGradient: 'from-[#6A1B4D] via-[#52133B] to-[#3B0A29]',
    image:
      'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/feria-y-talleres.jpg',
    imageAlt: 'Ferias y Pop-ups de Joyería Artesanal en Cartagena',
    isPortrait: false,
    linkLabel: 'Próximas Ferias',
    linkUrl: '/eventos',
  },
]

export const SliderHeroClient: React.FC<{
  slides?: Slide[]
  fallbackRichText?: any
  fallbackLinks?: any
  authorMedia?: number | Media | null
}> = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)

  const currentSlide = closcaSlides[activeIndex]
  const nextIndex = (activeIndex + 1) % closcaSlides.length
  const nextSlide = closcaSlides[nextIndex]

  useGSAP(
    () => {
      // Animación al cambiar de slide
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        )
      }
      if (modelRef.current) {
        gsap.fromTo(
          modelRef.current,
          { opacity: 0, scale: 0.96, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        )
      }
    },
    { dependencies: [activeIndex], scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      className={`relative w-full min-h-[92vh] -mt-[74px] sm:-mt-[78px] pt-[74px] sm:pt-[78px] bg-gradient-to-br ${currentSlide.bgGradient} transition-all duration-700 overflow-hidden select-none flex flex-col justify-between`}
    >
      {/* Halo ambiental orgánico */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenedor Principal Closca */}
      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 w-full h-full min-h-[calc(100vh-78px)] flex flex-col justify-between py-8 sm:py-10 lg:py-14 z-10">
        
        {/* FILA SUPERIOR: Párrafo Narrativo (Top Left) */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg z-20">
          <p className="font-sans font-light text-white/90 text-xs sm:text-sm md:text-[15px] leading-relaxed tracking-wide">
            {currentSlide.narrative}
          </p>
        </div>

        {/* FILA INTERMEDIA: Navegación Numerada Closca (01 02 03 + Progress Bar) */}
        <div className="my-auto py-6 sm:py-8 z-20">
          <div className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm tracking-widest font-sans mb-3">
            {closcaSlides.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  activeIndex === idx
                    ? 'text-white font-semibold scale-105'
                    : 'text-white/45 hover:text-white/80'
                }`}
              >
                {s.number}
              </button>
            ))}
          </div>

          {/* Línea de progreso interactiva */}
          <div className="relative w-32 sm:w-44 h-[2px] bg-white/25 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-1/3 bg-white transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
          </div>
        </div>

        {/* FILA INFERIOR: Categoría + Titular Editorial H1 (Bottom Left) y CTA (Bottom Right) */}
        <div
          ref={contentRef}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 z-20 pb-2"
        >
          <div className="max-w-2xl">
            {/* Tag / Eyebrow en Versalitas */}
            <div className="text-[10px] sm:text-xs font-sans font-medium uppercase tracking-[0.25em] text-white/80 mb-2 sm:mb-3">
              {currentSlide.eyebrow}
            </div>

            {/* Titular H1 Editorial con énfasis cursivo */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.8rem] xl:text-[4.5rem] text-white font-normal leading-[1.05] tracking-tight">
              {currentSlide.headingPrefix}{' '}
              <span className="italic font-light opacity-95">
                {currentSlide.headingHighlight}
              </span>
            </h1>
          </div>

          {/* Enlace de Acción Sutil Estilo Closca (Bottom Right) */}
          <div className="md:self-end pt-2 md:pt-0">
            <Link
              href={currentSlide.linkUrl}
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white text-xs sm:text-sm font-sans font-medium tracking-wider uppercase transition-all"
            >
              <span>{currentSlide.linkLabel}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* CENTRO-DERECHA: Fotografía Retrato de la Modelo (Closca) */}
      {/* ========================================================= */}
      <div
        ref={modelRef}
        className="absolute bottom-0 right-8 sm:right-16 md:right-28 lg:right-40 xl:right-52 h-[75%] sm:h-[84%] lg:h-[92%] max-w-[380px] sm:max-w-[500px] lg:max-w-[640px] flex items-end justify-center pointer-events-none z-15"
      >
        <img
          src={currentSlide.image}
          alt={currentSlide.imageAlt}
          className={`w-full h-full object-contain select-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.3)] ${
            currentSlide.isPortrait
              ? '[mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]'
              : 'rounded-2xl lg:rounded-3xl max-h-[70vh] object-cover [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]'
          }`}
          loading="eager"
        />
      </div>

      {/* ========================================================= */}
      {/* EXTREMO DERECHO: Tarjeta de Arco / Cápsula del Siguiente Slide */}
      {/* ========================================================= */}
      <button
        onClick={() => setActiveIndex(nextIndex)}
        aria-label="Ver siguiente colección"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-16 sm:w-24 md:w-32 lg:w-44 xl:w-52 h-[52%] sm:h-[60%] lg:h-[68%] rounded-l-full overflow-hidden border-l-2 border-y-2 border-white/35 bg-black/25 backdrop-blur-xs shadow-2xl cursor-pointer group transition-all duration-500 hover:w-20 sm:hover:w-28 md:hover:w-36 lg:hover:w-48 z-25"
      >
        <img
          src={nextSlide.image}
          alt="Siguiente diseño"
          className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 text-white/90 text-xs sm:text-sm font-sans tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {nextSlide.number}
        </div>
      </button>

    </section>
  )
}


