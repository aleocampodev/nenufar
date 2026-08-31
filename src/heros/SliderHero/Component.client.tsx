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

      {/* Bottom Controls Bar (Reference Layout: Left Circular Buttons, Right Slide Title Tabs) */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20 pointer-events-none">
          <div className="container max-w-[1300px] px-6 sm:px-12 lg:px-20 flex items-center justify-between">
            {/* Left Circular Navigation Controls */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                aria-label="Diapositiva anterior"
                onClick={scrollPrev}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/30 hover:bg-white text-white hover:text-neutral-950 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md group cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
              <button
                aria-label="Diapositiva siguiente"
                onClick={scrollNext}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/30 hover:bg-white text-white hover:text-neutral-950 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md group cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Right Tabs Switcher with Slide Names & Animated Indicator */}
            <div className="hidden sm:flex items-center gap-6 md:gap-8 pointer-events-auto">
              {slides.map((s, idx) => {
                const isActive = idx === selectedIndex
                const title = s.tabTitle || s.heading || `Slide ${idx + 1}`

                return (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`group text-left py-2 relative transition-all duration-300 cursor-pointer ${
                      isActive ? 'text-white font-medium' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="text-xs md:text-sm tracking-wide block truncate max-w-[200px]">
                      {title}
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-white scale-x-100 opacity-100'
                          : 'bg-white/40 scale-x-0 group-hover:scale-x-100 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            {/* Mobile-only Slide Indicator */}
            <div className="sm:hidden flex items-center gap-1.5 pointer-events-auto">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Ir al slide ${i + 1}`}
                  onClick={() => scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === selectedIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
