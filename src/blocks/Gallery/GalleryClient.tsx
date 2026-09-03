'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Maximize2, X, ChevronRight, Eye, ArrowUpRight, MessageCircle } from 'lucide-react'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'

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
  const [selectedImage, setSelectedImage] = useState<GalleryImageItem | null>(null)

  // Cerrar lightbox con tecla Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    },
    [],
  )

  useEffect(() => {
    if (selectedImage) {
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
  }, [selectedImage, handleKeyDown])

  const safeTabs = tabs.length > 0 ? tabs : []
  const activeTab = safeTabs[activeTabIndex] || safeTabs[0]
  const currentImages = activeTab?.images || []

  return (
    <section
      id={id}
      className="py-16 sm:py-20 md:py-24 bg-[#FCFBF9] border-b border-neutral-100 scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial Krafti */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <ScrollReveal variant="fade-up" duration={800}>
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

        {/* Móvil: Selector Horizontal con Scroll */}
        <div className="lg:hidden mb-8 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none flex gap-2.5">
          {safeTabs.map((tab, idx) => {
            const isActive = idx === activeTabIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTabIndex(idx)}
                className={`shrink-0 px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-brand/20 scale-[1.02]'
                    : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-neutral-300'
                }`}
              >
                <span>{tab.tabTitle}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {tab.images?.length || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Layout Desktop: Tabs Verticales a la izquierda + Grilla Linda a la derecha */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Tabs Verticales */}
          <div className="hidden lg:flex flex-col w-full lg:w-[32%] shrink-0 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400 px-3">
              Colecciones & Momentos
            </span>

            <div className="space-y-2">
              {safeTabs.map((tab, idx) => {
                const isActive = idx === activeTabIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTabIndex(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative group border ${
                      isActive
                        ? 'bg-white border-neutral-200/90 shadow-[0_8px_30px_rgba(106,27,154,0.08)] translate-x-1'
                        : 'bg-transparent border-transparent hover:bg-neutral-50/90 text-neutral-600'
                    }`}
                  >
                    {/* Indicador de Barra Activa Lateral */}
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all duration-300 ${
                        isActive ? 'bg-brand opacity-100' : 'bg-neutral-300 opacity-0 group-hover:opacity-40'
                      }`}
                    />

                    <div className="pl-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono transition-colors ${
                              isActive ? 'text-brand font-semibold' : 'text-neutral-400'
                            }`}
                          >
                            0{idx + 1}.
                          </span>
                          <h3
                            className={`font-serif text-base lg:text-lg transition-colors leading-snug ${
                              isActive
                                ? 'text-neutral-900 font-medium'
                                : 'text-neutral-600 group-hover:text-neutral-900'
                            }`}
                          >
                            {tab.tabTitle}
                          </h3>
                        </div>
                        {tab.tabSubtitle && (
                          <p className="text-xs text-neutral-500 font-sans mt-1 leading-relaxed pl-6">
                            {tab.tabSubtitle}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium transition-colors ${
                          isActive
                            ? 'bg-purple-50 text-brand border border-purple-100'
                            : 'bg-neutral-100 text-neutral-400 group-hover:text-neutral-600'
                        }`}
                      >
                        {tab.images?.length || 0}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Tarjeta de Acción / Consultar a Shirley */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#FAF8F5] border border-purple-100/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-brand">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">¿Viste una pieza que amas?</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                Shirley puede tejer cualquiera de estos diseños en tus colores preferidos o a la medida exacta de tu cuello.
              </p>
              <div className="pt-1">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark transition-colors"
                >
                  Explorar todo el catálogo en tienda
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Grilla Linda Asimétrica con Animación Sutil */}
          <div className="w-full lg:w-[68%] grow">
            {/* Contenedor con key para reiniciar la animación sutil de cascada al cambiar de tab */}
            <div
              key={activeTabIndex}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both"
            >
              {currentImages.map((img, idx) => {
                const isFirst = idx === 0
                const isSecond = idx === 1

                // Estilo de jerarquía asimétrica tipo alta joyería
                const layoutClasses = isFirst
                  ? 'sm:col-span-2 md:col-span-2 sm:row-span-2 aspect-[4/5] sm:aspect-auto sm:min-h-[420px]'
                  : isSecond
                  ? 'sm:col-span-1 md:col-span-1 aspect-[3/4] sm:min-h-[260px]'
                  : 'sm:col-span-1 md:col-span-1 aspect-square'

                // Retardo escalonado (stagger) para animación suave
                const delayStyle = {
                  animationDelay: `${idx * 65}ms`,
                }

                return (
                  <div
                    key={img.id || idx}
                    style={delayStyle}
                    className={`relative rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 group shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(106,27,154,0.14)] transition-all duration-500 cursor-pointer animate-in fade-in duration-500 ${layoutClasses}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || img.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={idx < 2}
                    />

                    {/* Gradiente sutil y Viñeta en Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Botón flotante de visualización / zoom */}
                    <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:scale-100 scale-90">
                      <Maximize2 className="w-4 h-4 text-brand" />
                    </div>

                    {/* Información inferior en Hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none text-white">
                      {img.category && (
                        <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full mb-1.5 text-purple-100">
                          {img.category}
                        </span>
                      )}
                      <h4 className="font-serif text-base sm:text-lg text-white font-medium leading-tight">
                        {img.title}
                      </h4>
                      {img.description && (
                        <p className="text-xs text-neutral-200 line-clamp-2 mt-1 font-sans">
                          {img.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Contador móvil o pie de grilla */}
            <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 px-1">
              <span className="font-sans">
                Mostrando {currentImages.length} creaciones en{' '}
                <strong className="text-neutral-800 font-medium">{activeTab?.tabTitle}</strong>
              </span>
              <span className="text-[11px] text-neutral-400">Toca cualquier imagen para ver en alta resolución</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal Minimalista a Pantalla Completa */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Cerrar visor de imagen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tarjeta Modal de la Imagen */}
          <div
            className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fotografía en Alta Resolución */}
            <div className="relative flex-1 bg-black min-h-[350px] sm:min-h-[480px] flex items-center justify-center">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt || selectedImage.title}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 80vw"
                priority
              />
            </div>

            {/* Panel Lateral con Descripción y Acción */}
            <div className="w-full md:w-80 p-6 sm:p-8 bg-[#18181B] text-white flex flex-col justify-between shrink-0 border-t md:border-t-0 md:border-l border-white/10">
              <div className="space-y-4">
                {selectedImage.category && (
                  <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-purple-300">
                    {selectedImage.category}
                  </span>
                )}
                <h3 className="font-serif text-2xl text-white font-normal leading-snug">
                  {selectedImage.title}
                </h3>
                <div className="w-8 h-0.5 bg-brand rounded-full" />
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {selectedImage.description ||
                    'Pieza única elaborada pacientemente a mano en Cartagena de Indias con micro-mostacilla checa calibrada e hilos técnicos de alta durabilidad.'}
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="pt-6 space-y-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hola Shirley, vi en la galería de Nénufar la pieza "${selectedImage.title}" y me encantaría consultar disponibilidad o un encargo personalizado ✨`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-medium text-xs uppercase tracking-wider transition-colors shadow-lg shadow-brand/25"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar por WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Cerrar visor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
