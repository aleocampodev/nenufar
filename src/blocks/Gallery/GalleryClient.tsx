'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'
import { NenufarPagination } from '@/components/Pagination/NenufarPagination'

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

const ITEMS_PER_PAGE = 6

export const GalleryClient: React.FC<Props> = ({
  tagline = null,
  heading = null,
  description = null,
  tabs = [],
  id = 'galeria',
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const gridTopRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerCardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const safeTabs = tabs.length > 0 ? tabs : []
  const activeTab = safeTabs[activeTabIndex] || safeTabs[0]
  const currentImages = activeTab?.images || []

  // Cálculo de paginación
  const totalPages = Math.max(1, Math.ceil(currentImages.length / ITEMS_PER_PAGE))
  const paginatedImages = currentImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleTabChange = (idx: number) => {
    setActiveTabIndex(idx)
    setCurrentPage(1)
    setSelectedImageIndex(null)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    if (gridTopRef.current) {
      const yOffset = -120
      const y = gridTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Manejo de teclado para el visor Lightbox con Focus Trap
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
      } else if (e.key === 'Tab' && modalRef.current) {
        // Focus trap dentro del modal Lightbox
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length > 0) {
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            last.focus()
            e.preventDefault()
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus()
            e.preventDefault()
          }
        }
      }
    },
    [selectedImageIndex, currentImages.length],
  )

  // Gestos táctiles de swipe en móvil para el Lightbox
  const minSwipeDistance = 45
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }
  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const distance = touchStartX - touchEndX
    if (distance > minSwipeDistance && currentImages.length > 1) {
      // Swipe izquierda -> siguiente imagen
      setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % currentImages.length : null))
    } else if (distance < -minSwipeDistance && currentImages.length > 1) {
      // Swipe derecha -> imagen anterior
      setSelectedImageIndex((prev) =>
        prev !== null ? (prev - 1 + currentImages.length) % currentImages.length : null,
      )
    }
  }

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
      // Auto-enfocar botón de cierre para accesibilidad
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImageIndex, handleKeyDown])

  const handleOpenImage = (globalIndex: number, localIdx: number) => {
    setSelectedImageIndex(globalIndex)
  }

  const handleCloseImage = () => {
    const lastIndex = selectedImageIndex
    setSelectedImageIndex(null)
    if (lastIndex !== null) {
      const localIdx = lastIndex % ITEMS_PER_PAGE
      triggerCardRefs.current[localIdx]?.focus()
    }
  }

  const selectedImage =
    selectedImageIndex !== null && currentImages[selectedImageIndex]
      ? currentImages[selectedImageIndex]
      : null

  return (
    <section
      id={id}
      className="py-10 sm:py-14 md:py-16 bg-[#FAF8F5] border-b border-neutral-100 scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Editorial opcional (solo si se pasa explícitamente) */}
        {(heading || tagline || description) && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
            <ScrollReveal variant="fade-up" duration={800} once={false}>
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
              {description && (
                <p className="text-sm sm:text-base text-neutral-600 font-sans leading-relaxed max-w-2xl mx-auto mt-2">
                  {description}
                </p>
              )}
            </ScrollReveal>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 2 COLUMNAS: TABS A LA IZQUIERDA - FOTOS A LA DERECHA */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: Pestañas / Sidebar de Categorías       */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-28 space-y-3">
            {/* Contenedor: En desktop tarjeta sólida, en móvil barra limpia horizontal */}
            <div className="bg-white/80 lg:bg-white rounded-2xl lg:rounded-3xl p-2.5 sm:p-3 lg:p-4 border border-neutral-200/80 shadow-xs">
              <div className="hidden lg:flex items-center justify-between px-2 pb-3 mb-2 border-b border-neutral-100">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B5A2B] font-semibold font-sans flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  CATEGORÍAS
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {safeTabs.length} colecciones
                </span>
              </div>

              {/* Lista vertical en Desktop, scroll horizontal de píldoras en Mobile */}
              <div
                role="tablist"
                aria-label="Categorías de la galería"
                className="flex lg:flex-col gap-1.5 lg:gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none px-0.5"
              >
                {safeTabs.map((tab, idx) => {
                  const isActive = idx === activeTabIndex
                  return (
                    <button
                      key={idx}
                      id={`gallery-tab-${idx}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`gallery-panel-${idx}`}
                      type="button"
                      onClick={() => handleTabChange(idx)}
                      className={`text-left transition-all duration-200 flex items-center cursor-pointer shrink-0 lg:shrink group px-4 py-2.5 min-h-[44px] lg:min-h-0 lg:py-3 rounded-full lg:rounded-2xl w-auto lg:w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.98] ${
                        isActive
                          ? 'bg-brand text-white shadow-md shadow-brand/20 font-medium translate-x-0 lg:translate-x-1'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 hover:border-brand/30'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs lg:text-sm font-medium leading-snug whitespace-nowrap lg:whitespace-normal">
                          {tab.tabTitle}
                        </span>
                        {tab.tabSubtitle && (
                          <span
                            className={`hidden lg:block text-[11px] line-clamp-1 mt-0.5 ${
                              isActive ? 'text-white/80' : 'text-neutral-500'
                            }`}
                          >
                            {tab.tabSubtitle}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: Cuadrícula de Fotos + Paginación         */}
          {/* ========================================================= */}
          <div
            id={`gallery-panel-${activeTabIndex}`}
            role="tabpanel"
            aria-labelledby={`gallery-tab-${activeTabIndex}`}
            className="lg:col-span-8 xl:col-span-9 space-y-6"
          >
            
            {/* Header de la categoría activa */}
            <div ref={gridTopRef} className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-normal">
                  {activeTab?.tabTitle}
                </h2>
                {activeTab?.tabSubtitle && (
                  <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                    {activeTab.tabSubtitle}
                  </p>
                )}
              </div>
              {totalPages > 1 && (
                <span className="text-xs font-mono text-neutral-600 bg-white px-3 py-1 rounded-full border border-neutral-200/80 shadow-2xs">
                  Pág. {currentPage} de {totalPages}
                </span>
              )}
            </div>

            {/* Cuadrícula de Fotografías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {paginatedImages.map((img, idx) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx
                return (
                  <button
                    key={img.id || idx}
                    ref={(el) => {
                      triggerCardRefs.current[idx] = el
                    }}
                    type="button"
                    onClick={() => handleOpenImage(globalIndex, idx)}
                    aria-label={`Ver fotografía ampliada: ${img.title}`}
                    className="group relative aspect-[3/4] w-full p-0 text-left rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-200/70 shadow-xs hover:shadow-[0_16px_36px_rgba(233,30,140,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-all duration-500 cursor-pointer border border-neutral-200/60"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || img.title || 'Joyería Nenúfar'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={currentPage === 1 && idx < 3}
                    />

                    {/* Gradient Overlay: visible en móvil para legibilidad de títulos, en desktop al hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Botón Flotante para expandir */}
                    <div className="absolute bottom-3.5 right-3.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-brand opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-md scale-95 group-hover:scale-100 pointer-events-none">
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>

                    {/* Título de la imagen: siempre visible en móvil, fade-in en desktop */}
                    <div className="absolute bottom-3.5 left-3.5 right-12 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <p className="text-xs sm:text-sm text-white font-medium line-clamp-1 drop-shadow-sm">
                        {img.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Paginación Innovadora y Cohesiva de Nenúfar */}
            <NenufarPagination
              page={currentPage}
              totalPages={totalPages}
              totalDocs={currentImages.length}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              categoryLabel="Galería de Momentos"
              itemCountLabel="fotos"
              showAlways={false}
              className="w-full max-w-2xl mx-auto pt-10 flex flex-col items-center gap-5 select-none"
            />

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. LIGHTBOX MODAL: Expansión de Imagen al Seleccionar     */}
      {/* ========================================================= */}
      {selectedImage && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-image-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 touch-pan-y"
          onClick={handleCloseImage}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Botón de Cierre */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleCloseImage}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar vista ampliada"
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
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Contenedor de la Imagen Expandida */}
          <div
            className="relative max-w-4xl max-h-[88vh] w-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[65vh] sm:h-[72vh] flex items-center justify-center">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt || selectedImage.title || 'Joyería Nenúfar'}
                fill
                className="object-contain rounded-2xl shadow-2xl"
                sizes="95vw"
                priority
              />
            </div>

            {/* Pie de foto en el visor */}
            <div className="w-full max-w-xl text-center mt-3 px-4">
              <p id="lightbox-image-title" className="text-white font-serif text-lg sm:text-xl drop-shadow-sm">
                {selectedImage.title}
              </p>
              <span className="inline-block text-[11px] text-neutral-400 font-mono mt-1.5">
                {(selectedImageIndex ?? 0) + 1} de {currentImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
