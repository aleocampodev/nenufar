'use client'

import type { Media } from '@/payload-types'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { Media as PayloadMedia } from '@/components/Media'

export type Slide = {
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

const getImagePositionClass = (pos?: string | null) => {
  if (pos === 'center') return 'object-cover object-center'
  if (pos === 'bottom') return 'object-cover object-bottom'
  return 'object-cover object-top'
}

export const SliderHeroClient: React.FC<{
  slides: Slide[]
  fallbackRichText?: any
  fallbackLinks?: any
}> = ({ slides }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 25 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

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

  // Autoplay with pause on hover
  useEffect(() => {
    if (!emblaApi || isPaused) return
    const id = setInterval(() => {
      emblaApi.scrollNext()
    }, 6000)
    return () => clearInterval(id)
  }, [emblaApi, isPaused])

  if (!slides?.length) return null

  return (
    <section
      className="relative w-full overflow-hidden -mt-[74px] sm:-mt-[78px] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Colecciones destacadas"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => {
            const media = slide.image as Media
            const isFirst = i === 0
            const positionClass = getImagePositionClass(slide.imagePosition)
            const badgeText = slide.badge || 'Colección Destacada'
            const meta = slide.metaText || 'Cartagena de Indias • Hecho a Mano'

            return (
              <div key={i} className="flex-[0_0_100%] min-w-0 relative">
                {/* Background image container with full viewport presence */}
                <div className="relative h-[85vh] sm:h-[90vh] lg:h-screen min-h-[580px] w-full overflow-hidden bg-neutral-900">
                  {media && typeof media === 'object' ? (
                    <PayloadMedia
                      resource={media}
                      sizeName="hero"
                      fill
                      priority={isFirst}
                      imgClassName={`${positionClass} transition-transform duration-1000 ease-out`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/40 to-neutral-950" />
                  )}

                  {/* High-contrast cinematic overlays for flawless legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/35" />
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Main Editorial Content Area (Aligned Left-Center as in Reference) */}
                  <div className="absolute inset-0 flex items-center pt-24 sm:pt-20 pb-28 md:pb-32">
                    <div className="container max-w-[1300px] px-6 sm:px-12 lg:px-20">
                      <div className="max-w-2xl text-white space-y-4 sm:space-y-5">
                        {/* Overline Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                          {badgeText}
                        </div>

                        {/* Preserved Typography Heading */}
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-md">
                          {slide.heading}
                        </h1>

                        {/* Metadata Tagline (Location & Craft Details) */}
                        <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white/75 drop-shadow-sm">
                          {meta}
                        </div>

                        {/* Subheading / Description */}
                        {slide.subheading && (
                          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-lg font-light drop-shadow-sm pt-1">
                            {slide.subheading}
                          </p>
                        )}

                        {/* Primary CTA Button (Brand Purple matching Menu) */}
                        {slide.linkLabel && slide.linkUrl && (
                          <div className="pt-3 sm:pt-4">
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
                              className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#6A1B9A] hover:bg-[#581482] text-white text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_8px_25px_rgba(106,27,154,0.45)] hover:shadow-[0_12px_35px_rgba(106,27,154,0.65)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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

      {/* Flechas de Navegación Laterales Flotantes a los Lados */}
      {slides.length > 1 && (
        <>
          <button
            aria-label="Diapositiva anterior"
            onClick={scrollPrev}
            className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/30 bg-black/40 hover:bg-white text-white hover:text-neutral-950 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:scale-110 active:scale-95 group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:-translate-x-1" />
          </button>

          <button
            aria-label="Diapositiva siguiente"
            onClick={scrollNext}
            className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/30 bg-black/40 hover:bg-white text-white hover:text-neutral-950 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:scale-110 active:scale-95 group cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </>
      )}
    </section>
  )
}
