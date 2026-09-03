'use client'

import type { Media } from '@/payload-types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Media as PayloadMedia } from '@/components/Media'

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

const getImagePositionClass = (pos?: string | null) => {
  if (pos === 'center') return 'object-center'
  if (pos === 'bottom') return 'object-bottom'
  return 'object-top'
}

const DEFAULT_LEFT_IMAGES = [
  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg',
  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/feria-y-talleres.jpg',
  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/shirley-creadora.jpeg',
]

export const SliderHeroClient: React.FC<{
  slides: Slide[]
  fallbackRichText?: any
  fallbackLinks?: any
  authorMedia?: number | Media | null
}> = ({ slides, authorMedia }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'active'>('idle')
  const [isPaused, setIsPaused] = useState(false)

  const isAnimating = incomingIndex !== null
  const lastWheelTime = useRef(0)
  const touchStartY = useRef(0)
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const goToSlide = useCallback(
    (targetIndex: number, dir: 'next' | 'prev') => {
      if (incomingIndex !== null) return
      const nextIdx = (targetIndex + slides.length) % slides.length
      if (nextIdx === currentIndex) return

      setDirection(dir)
      setIncomingIndex(nextIdx)
      setAnimationPhase('idle')

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationPhase('active')
        })
      })

      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
      animTimeoutRef.current = setTimeout(() => {
        setCurrentIndex(nextIdx)
        setIncomingIndex(null)
        setAnimationPhase('idle')
      }, 950)
    },
    [incomingIndex, slides.length, currentIndex],
  )

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1, 'next')
  }, [goToSlide, currentIndex])

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1, 'prev')
  }, [goToSlide, currentIndex])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now()
      if (now - lastWheelTime.current < 950 || isAnimating) return
      if (Math.abs(e.deltaY) > 20) {
        lastWheelTime.current = now
        if (e.deltaY > 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }
    },
    [nextSlide, prevSlide, isAnimating],
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating) return
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    }
  }

  useEffect(() => {
    if (isPaused || isAnimating) return
    const id = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(id)
  }, [isPaused, isAnimating, nextSlide])

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [])

  if (!slides?.length) return null

  const authorMediaObj =
    authorMedia && typeof authorMedia === 'object' ? (authorMedia as Media) : null

  const getLeftSlideClass = (i: number) => {
    if (incomingIndex === null) {
      if (i === currentIndex) return 'translate-y-0 opacity-100 z-10'
      return 'opacity-0 pointer-events-none -translate-y-full z-0'
    }

    if (i === currentIndex) {
      if (animationPhase === 'idle') return 'translate-y-0 z-10'
      return direction === 'next'
        ? 'translate-y-full z-10 transition-transform duration-[950ms] ease-[cubic-bezier(0.25,1,0.5,1)]'
        : '-translate-y-full z-10 transition-transform duration-[950ms] ease-[cubic-bezier(0.25,1,0.5,1)]'
    }

    if (i === incomingIndex) {
      if (animationPhase === 'idle') {
        return direction === 'next' ? '-translate-y-full z-20' : 'translate-y-full z-20'
      }
      return 'translate-y-0 z-20 transition-transform duration-[950ms] ease-[cubic-bezier(0.25,1,0.5,1)]'
    }

    return 'opacity-0 pointer-events-none z-0'
  }

  const getRightSlideClass = (i: number) => {
    if (incomingIndex === null) {
      if (i === currentIndex) return 'translate-y-0 opacity-100 z-10'
      return 'opacity-0 pointer-events-none translate-y-full z-0'
    }

    if (i === currentIndex) {
      if (animationPhase === 'idle') return 'translate-y-0 z-10'
      return direction === 'next'
        ? '-translate-y-full z-10 transition-transform duration-[950ms] ease-[cubic-bezier(0.25,1,0.5,1)]'
        : 'translate-y-full z-10 transition-transform duration-[950ms] ease-[cubic-bezier(0.25,1,0.5,1)]'
    }

    if (i === incomingIndex) {
      if (animationPhase === 'idle') {
        return direction === 'next' ? 'translate-y-full z-20' : '-translate-y-full z-20'
      }
      return 'translate-y-0 z-20 transition-transform duration-[950ms] ease-[cubic-bezier(0.25,1,0.5,1)]'
    }

    return 'opacity-0 pointer-events-none z-0'
  }

  return (
    <section
      className="relative w-full min-h-screen lg:h-screen -mt-[74px] sm:-mt-[78px] flex flex-col lg:flex-row overflow-hidden bg-[#12100E] select-none"
      onWheel={handleWheel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Colecciones destacadas"
    >
      <div className="w-full lg:w-1/2 h-[52vh] sm:h-[58vh] lg:h-full lg:min-h-screen relative overflow-hidden bg-neutral-900 group shrink-0">
        {slides.map((slide, i) => {
          const modelMedia =
            slide.modelImage && typeof slide.modelImage === 'object'
              ? (slide.modelImage as Media)
              : null
          const leftImgSrc = DEFAULT_LEFT_IMAGES[i % DEFAULT_LEFT_IMAGES.length]

          const leftPositionClass = getImagePositionClass(slide.imagePosition || 'top')

          return (
            <div
              key={i}
              className={`absolute inset-0 will-change-transform ${getLeftSlideClass(i)}`}
            >
              {modelMedia ? (
                <PayloadMedia
                  resource={modelMedia}
                  sizeName="hero"
                  fill
                  priority={i === 0}
                  imgClassName={`object-cover ${leftPositionClass} w-full h-full`}
                />
              ) : authorMediaObj && i === 0 ? (
                <PayloadMedia
                  resource={authorMediaObj}
                  sizeName="hero"
                  fill
                  priority
                  imgClassName={`object-cover ${leftPositionClass} w-full h-full`}
                />
              ) : (
                <img
                  src={leftImgSrc}
                  alt=""
                  role="presentation"
                  className={`w-full h-full object-cover ${leftPositionClass}`}
                />
              )}
            </div>
          )
        })}
        {/* Shading removed per user request: left image remains clean and vibrant */}
        <div
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-5 sm:gap-6 text-white/90 bg-black/35 backdrop-blur-md px-5 py-2 rounded-full border border-white/15 shadow-md"
          role="navigation"
          aria-label="Redes sociales de Shirley"
        >
          <a href="https://www.instagram.com/nenufar.co/" target="_blank" rel="noopener noreferrer" className="p-1 hover:text-white transition-all duration-200 hover:scale-125 cursor-pointer">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a href="https://wa.me/?text=Hola%20Shirley%2C%20quisiera%20consultar%20sobre%20tus%20joyas%20artesanales" target="_blank" rel="noopener noreferrer" className="p-1 hover:text-white transition-all duration-200 hover:scale-125 cursor-pointer">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="p-1 hover:text-white transition-all duration-200 hover:scale-125 cursor-pointer">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.54c-.15.68-.56.84-1.12.52l-3.1-2.28-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12l-7.14 4.5-3.08-.96c-.67-.21-.68-.67.14-.99l12.04-4.64c.56-.2 1.05.14.81 1.06z" />
            </svg>
          </a>
        </div>
      </div>
      {/* ========================================================= */}
      {/* PANEL DERECHO: 50% A PANTALLA COMPLETA                     */}
      {/* Opción A: Terracota Caribeña / Atardecer en Cartagena      */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-[50vh] sm:min-h-[55vh] lg:min-h-screen relative overflow-hidden flex-1 bg-[linear-gradient(135deg,#C2A690_0%,#B87355_48%,#682358_100%)]">
        {slides.map((slide, i) => {
          const media = slide.image as Media
          const isFirst = i === 0
          const isActive = i === (incomingIndex ?? currentIndex)
          const positionClass = getImagePositionClass(slide.imagePosition)
          const categoryTitle = slide.tabTitle || slide.badge || 'COLECCIÓN'

          return (
            <div
              key={i}
              className={`absolute inset-0 w-full h-full flex flex-col justify-between pt-6 sm:pt-10 lg:pt-24 pb-14 sm:pb-16 lg:pb-20 px-4 sm:px-8 lg:px-12 will-change-transform ${getRightSlideClass(
                i,
              )}`}
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
                {/* Título sutil de categoría con revelado elegante */}
                <div className="overflow-hidden mb-2 sm:mb-3 lg:mb-4">
                  <span
                    className={`inline-block text-[10px] sm:text-xs tracking-[0.32em] uppercase text-white/80 font-medium font-sans drop-shadow-sm ${
                      isActive ? 'animate-prismara-subtle-reveal' : 'opacity-0'
                    }`}
                  >
                    {categoryTitle}
                  </span>
                </div>

                {/* Marco en Arco Romano (Arched Frame con borde fino blanco) */}
                <div
                  className={`relative w-[160px] sm:w-[200px] md:w-[250px] lg:w-[310px] xl:w-[330px] aspect-[3/4] p-1.5 sm:p-2.5 border border-white/40 rounded-t-[90px] sm:rounded-t-[120px] md:rounded-t-[150px] lg:rounded-t-[185px] rounded-b-none shadow-2xl overflow-hidden mb-3 sm:mb-5 lg:mb-7 transition-all duration-700 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                  }`}
                >
                  <div className="w-full h-full rounded-t-[84px] sm:rounded-t-[112px] md:rounded-t-[142px] lg:rounded-t-[176px] rounded-b-none overflow-hidden relative bg-black/10">
                    {media && typeof media === 'object' ? (
                      <div
                        className={`relative w-full h-full ${
                          isActive ? 'animate-prismara-ken-burns' : 'scale-100'
                        }`}
                      >
                        <PayloadMedia
                          resource={media}
                          sizeName="hero"
                          fill
                          priority={isFirst}
                          imgClassName={`object-cover ${positionClass} transition-transform duration-1000 ease-out`}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-neutral-800/40" />
                    )}
                  </div>
                </div>

                {/* Texto descriptivo (blanco cálido, tipografía ligera y elegante) */}
                <div className="overflow-hidden mb-3 sm:mb-5 lg:mb-7 max-w-xs sm:max-w-md mx-auto px-2">
                  <p className="text-white/95 text-xs sm:text-sm md:text-[15px] font-light tracking-wide leading-relaxed drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                    {slide.subheading ||
                      slide.heading ||
                      'Piezas únicas tejidas a mano en Cartagena, con la dedicación y maestría de Shirley.'}
                  </p>
                </div>

                {/* Botón ovalado estilo píldora con borde fino */}
                <div>
                  <Link
                    href={slide.linkUrl || '/shop'}
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
                    className="inline-flex items-center justify-center px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full border border-white/60 hover:border-white text-white hover:bg-white hover:text-[#2A2421] text-[10px] sm:text-xs tracking-[0.22em] uppercase font-medium transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    {slide.linkLabel || 'EXPLORAR CATÁLOGO'}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 text-white/80">
          <button
            onClick={prevSlide}
            aria-label="Diapositiva anterior"
            className="p-2 hover:text-white transition-transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <ChevronUp className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Diapositiva siguiente"
            className="p-2 hover:text-white transition-transform hover:translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <ChevronDown className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </section>
  )
}
