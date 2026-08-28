'use client'

import type { Media } from '@/payload-types'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { Media as PayloadMedia } from '@/components/Media'

type Slide = {
  image: number | Media
  heading: string
  subheading?: string | null
  linkLabel?: string | null
  linkUrl?: string | null
  imagePosition?: 'top' | 'center' | 'bottom' | null
}

const getImagePositionClass = (pos?: string | null) => {
  if (pos === 'center') return 'object-cover object-center'
  if (pos === 'bottom') return 'object-cover object-bottom'
  // Por defecto 'top': anclado al borde superior exacto (0% top) para mostrar cabezas y rostros completos
  return 'object-cover object-top'
}

export const SliderHeroClient: React.FC<{
  slides: Slide[]
  fallbackRichText?: any
  fallbackLinks?: any
}> = ({ slides }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  // Auto-play 5s
  useEffect(() => {
    if (!emblaApi) return
    const id = setInterval(() => emblaApi.scrollNext(), 5000)
    return () => clearInterval(id)
  }, [emblaApi])

  if (!slides?.length) return null

  return (
    <section className="relative w-full overflow-hidden -mt-[74px] sm:-mt-[78px]">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => {
            const media = slide.image as Media
            const isFirst = i === 0
            const positionClass = getImagePositionClass(slide.imagePosition)
            return (
              <div key={i} className="flex-[0_0_100%] min-w-0 relative">
                {/* Background image - Krafti full-bleed, no cut */}
                <div className="relative h-[68vh] md:h-[78vh] lg:h-[82vh] min-h-[520px] w-full overflow-hidden bg-[#f5f1eb]">
                  {media && typeof media === 'object' ? (
                    <PayloadMedia
                      resource={media}
                      sizeName="hero"
                      fill
                      priority={isFirst}
                      imgClassName={positionClass}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/30 md:bg-black/25" />

                  {/* Content - with elegant editorial typography */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="container max-w-[1300px] px-6 sm:px-12 lg:px-20">
                      <div className="max-w-2xl text-white space-y-4">
                        <span className="inline-block text-xs sm:text-sm uppercase tracking-[0.3em] font-medium text-purple-200 drop-shadow-sm">
                          Colección Artesanal
                        </span>
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] font-normal tracking-tight drop-shadow-md">
                          {slide.heading}
                        </h1>
                        {slide.subheading && (
                          <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-lg font-light drop-shadow-sm">
                            {slide.subheading}
                          </p>
                        )}
                        {slide.linkLabel && slide.linkUrl && (
                          <div className="pt-2">
                            <Link
                              href={slide.linkUrl}
                              onClick={(e) => {
                                if (slide.linkUrl?.includes('#')) {
                                  const hash = slide.linkUrl.substring(slide.linkUrl.indexOf('#'))
                                  const el = document.querySelector(hash)
                                  if (el) {
                                    e.preventDefault()
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    window.history.pushState(null, '', hash)
                                  }
                                }
                              }}
                              className="inline-block px-8 py-3.5 bg-white text-neutral-900 text-xs tracking-[0.22em] uppercase font-medium rounded-full hover:bg-brand hover:text-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.15)] cursor-pointer"
                            >
                              {slide.linkLabel}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edge-clipped Geometric Diamond Arrows (Krafti signature) */}
      {slides.length > 1 && (
        <>
          {/* Flecha Izquierda recortada al borde */}
          <button
            aria-label="Anterior"
            onClick={scrollPrev}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[52px] h-[104px] overflow-hidden z-20 group cursor-pointer"
          >
            <span className="absolute left-[18px] top-[12px] w-[80px] h-[80px] bg-white rotate-45 shadow-[-4px_4px_18px_rgba(0,0,0,0.12)] transition-colors duration-200 group-hover:bg-neutral-50" />
            <span className="relative z-10 flex items-center justify-start h-full pl-3 text-[#8B5A2B] group-hover:-translate-x-0.5 transition-transform duration-200">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </span>
          </button>

          {/* Flecha Derecha recortada al borde */}
          <button
            aria-label="Siguiente"
            onClick={scrollNext}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[52px] h-[104px] overflow-hidden z-20 group cursor-pointer"
          >
            <span className="absolute -left-[46px] top-[12px] w-[80px] h-[80px] bg-white rotate-45 shadow-[4px_4px_18px_rgba(0,0,0,0.12)] transition-colors duration-200 group-hover:bg-neutral-50" />
            <span className="relative z-10 flex items-center justify-end h-full pr-3 text-[#8B5A2B] group-hover:translate-x-0.5 transition-transform duration-200">
              <ChevronRight className="w-6 h-6 stroke-[2]" />
            </span>
          </button>

          {/* Dots / Bullets */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
