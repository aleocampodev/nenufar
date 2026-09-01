'use client'

import type { Media } from '@/payload-types'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { Media as PayloadMedia } from '@/components/Media'

type Testimonial = {
  id: number
  quote: string
  authorName: string
  authorRole?: string | null
  avatar: number | Media
  rating?: number | null
}

export const TestimonialsClient: React.FC<{
  id?: string
  title: string
  testimonials: Testimonial[]
  showRating: boolean
}> = ({ id, title, testimonials, showRating }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  if (!testimonials?.length) return null

  return (
    <section id={id} className="py-12 md:py-16 bg-muted/20 border-y border-border/40">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-serif text-center mb-8 md:mb-10 text-foreground">
          {title}
        </h2>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t) => {
                const avatar = t.avatar as Media
                return (
                  <div
                    key={t.id}
                    className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-3"
                  >
                    <article className="h-full rounded-2xl border border-border bg-card p-6 md:p-7 flex flex-col items-center text-center space-y-4">
                      {/* Avatar */}
                      {avatar && typeof avatar === 'object' ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand/20 shrink-0">
                          <PayloadMedia
                            resource={avatar}
                            sizeName="thumbnail"
                            fill
                            imgClassName="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xl font-serif">
                          {t.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {showRating && t.rating ? (
                        <div className="flex items-center gap-1" aria-label={`${t.rating} de 5 estrellas`}>
                          <span className="sr-only">{t.rating} de 5 estrellas</span>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              aria-hidden="true"
                              className={`w-4 h-4 ${i < t.rating! ? 'fill-brand text-brand' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                      ) : null}

                      <blockquote className="text-sm md:text-[15px] leading-relaxed text-muted-foreground italic">
                        “{t.quote}”
                      </blockquote>

                      <div>
                        <p className="font-medium text-foreground text-sm">{t.authorName}</p>
                        {t.authorRole && (
                          <p className="text-xs text-muted-foreground">{t.authorRole}</p>
                        )}
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>

          {testimonials.length > 1 && (
            <>
              <button
                aria-label="Testimonio anterior"
                onClick={scrollPrev}
                className="hidden md:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-border shadow-md hover:bg-muted items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                aria-label="Testimonio siguiente"
                onClick={scrollNext}
                className="hidden md:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-border shadow-md hover:bg-muted items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>

              <div className="flex justify-center items-center gap-1 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ir al testimonio ${i + 1}`}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  >
                    <span
                      className={`h-2 rounded-full transition-all block ${
                        i === selectedIndex ? 'w-6 bg-brand' : 'w-2 bg-border hover:bg-brand/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
