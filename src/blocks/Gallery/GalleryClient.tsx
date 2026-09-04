'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export type GalleryImageItem = {
  id?: string
  title: string
  category?: string
  description?: string
  src: string
  alt: string
  isFeatured?: boolean
}

export type GalleryTabItem = {
  tabTitle: string
  tabSubtitle?: string
  images: GalleryImageItem[]
}

type Props = {
  tagline?: string | null
  heading?: string | null
  description?: string | null
  tabs: GalleryTabItem[]
  id?: string
}

export const GalleryClient: React.FC<Props> = ({
  tagline = 'MUESTRARIO VISUAL & LOOKBOOK',
  heading = 'Nénufar en la Piel: Arte y Color Caribeño',
  description = 'Explora nuestras piezas tejidas a mano en Cartagena de Indias, el brillo de la micro-mostacilla checa calibrada y la fuerza del diseño ancestral lucido por mujeres reales.',
  tabs = [],
  id = 'galeria',
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const safeTabs = tabs.length > 0 ? tabs : []
  const activeTab = safeTabs[activeTabIndex] || safeTabs[0]
  const currentImages = activeTab?.images || []

  // Manejo de teclado (Escape para cerrar, flechas para navegar en lightbox)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return

      if (e.key === 'Escape') {
        setSelectedImageIndex(null)
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev + 1) % currentImages.length : null,
        )
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev - 1 + currentImages.length) % currentImages.length : null,
        )
      }
    },
    [selectedImageIndex, currentImages.length],
  )

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImageIndex, handleKeyDown])

  const selectedImage =
    selectedImageIndex !== null && currentImages[selectedImageIndex]
      ? currentImages[selectedImageIndex]
      : null

  return (
    <section
      id={id}
      className="py-16 sm:py-20 md:py-24 bg-[#FAF8F5] border-b border-neutral-100 scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial con animación bidireccional (subir y bajar) */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <ScrollReveal variant="fade-up" duration={800} once={false} rootMargin="0px 0px -20px 0px">
            {tagline && (
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                {tagline}
              </span>
            )}
            {heading && (
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight mt-2">
                {heading}
              </h2>
            )}
            <div className="w-12 h-0.5 bg-brand mx-auto my-3 rounded-full opacity-70" />
            {description && (
              <p className="text-sm sm:text-base text-neutral-600 font-sans leading-relaxed max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </ScrollReveal>
        </div>

        {/* 1. TABS SUPERIORES (Animados bidireccionalmente al subir y bajar) */}
        {safeTabs.length > 1 && (
          <ScrollReveal variant="fade-up" delay={120} duration={800} distance={28} once={false} rootMargin="0px 0px -20px 0px" className="mb-10 sm:mb-12">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none px-2 -mx-2">
              {safeTabs.map((tab, idx) => {
                const isActive = idx === activeTabIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveTabIndex(idx)
                      setSelectedImageIndex(null)
                    }}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-brand text-white shadow-lg shadow-brand/25 scale-[1.03]'
                        : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-brand/40 hover:text-brand shadow-sm'
                    }`}
                  >
                    <span>{tab.tabTitle}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {tab.images?.length || 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </ScrollReveal>
        )}

        {/* 2. CARRUSEL HORIZONTAL FLUIDO (Animado bidireccionalmente desde abajo con inercia) */}
        <ScrollReveal variant="fade-up" delay={240} duration={900} distance={40} once={false} rootMargin="0px 0px -20px 0px">
          <div key={activeTabIndex} className="animate-in fade-in duration-500 relative px-2 sm:px-6">
            <Carousel
              opts={{
                align: 'start',
                dragFree: true,
                containScroll: 'trimSnaps',
                loop: currentImages.length > 3,
              }}
              className="w-full relative select-none"
            >
              <CarouselContent className="-ml-3 sm:-ml-4 cursor-grab active:cursor-grabbing">
                {currentImages.map((img, idx) => (
                  <CarouselItem
                    key={img.id || idx}
                    className="pl-3 sm:pl-4 basis-[82%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div
                      onClick={() => setSelectedImageIndex(idx)}
                      className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-200/70 group shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(106,27,154,0.18)] transition-all duration-500 cursor-pointer"
                    >
                      <Image
                        src={img.src}
                        alt={img.alt || img.title || 'Joyería Nénufar'}
                        fill
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        priority={idx < 4}
                      />

                      {/* Overlay sutil al hover con botón de expansión */}
                      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Botón flotante para expandir */}
                      <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-brand opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md scale-90 group-hover:scale-100">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Flechas de Navegación del Carrusel */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <CarouselPrevious className="relative static translate-y-0 h-10 w-10 rounded-full border-neutral-300 bg-white hover:bg-brand hover:text-white hover:border-brand text-neutral-800 shadow-sm transition-colors cursor-pointer" />
                <CarouselNext className="relative static translate-y-0 h-10 w-10 rounded-full border-neutral-300 bg-white hover:bg-brand hover:text-white hover:border-brand text-neutral-800 shadow-sm transition-colors cursor-pointer" />
              </div>
            </Carousel>
          </div>
        </ScrollReveal>
      </div>

      {/* 3. LIGHTBOX MODAL: Expansión de Imagen al Seleccionar */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Botón de Cierre */}
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flecha Anterior en Lightbox */}
          {currentImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImageIndex((prev) =>
                  prev !== null ? (prev - 1 + currentImages.length) % currentImages.length : null,
                )
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Flecha Siguiente en Lightbox */}
          {currentImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImageIndex((prev) =>
                  prev !== null ? (prev + 1) % currentImages.length : null,
                )
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Contenedor de la Imagen Expandida */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-[75vh] flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || selectedImage.title || 'Joyería Nénufar'}
              fill
              className="object-contain rounded-2xl shadow-2xl"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </section>
  )
}
