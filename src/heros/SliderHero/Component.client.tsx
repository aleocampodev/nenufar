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
    <section className="relative w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => {
            const media = slide.image as Media
            const isFirst = i === 0
            return (
              <div key={i} className="flex-[0_0_100%] min-w-0 relative">
                {/* Background image */}
                <div className="relative h-[60vh] md:h-[78vh] min-h-[380px] w-full overflow-hidden bg-muted">
                  {media && typeof media === 'object' ? (
                    <PayloadMedia
                      resource={media}
                      sizeName="hero"
                      fill
                      priority={isFirst}
                      imgClassName="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/30 md:bg-black/25" />

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="container">
                      <div className="max-w-2xl text-white space-y-4">
                        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight font-light">
                          {slide.heading}
                        </h1>
                        {slide.subheading && (
                          <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-lg">
                            {slide.subheading}
                          </p>
                        )}
                        {slide.linkLabel && slide.linkUrl && (
                          <Link
                            href={slide.linkUrl}
                            className="inline-block mt-2 px-7 py-3 bg-white text-foreground text-xs md:text-sm tracking-widest uppercase font-medium rounded-full hover:bg-brand hover:text-white transition-colors"
                          >
                            {slide.linkLabel}
                          </Link>
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

      {/* Arrows - hidden on mobile */}
      {slides.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={scrollPrev}
            className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-foreground items-center justify-center shadow-md transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Siguiente"
            onClick={scrollNext}
            className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-foreground items-center justify-center shadow-md transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`h-2 rounded-full transition-all ${i === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
