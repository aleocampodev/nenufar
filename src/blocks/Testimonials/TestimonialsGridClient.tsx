'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Quote, X, Sparkles, MapPin, ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'

export type TestimonialItem = {
  id: number | string
  quote: string
  authorName: string
  authorRole?: string | null
  avatarUrl?: string | null
  rating?: number | null
}

interface TestimonialsGridClientProps {
  testimonials: TestimonialItem[]
}

const defaultPieceDetails: Record<string, { pieceName: string; technique: string; location: string; image: string }> = {
  '1': {
    pieceName: 'Collar Flor de Loto en Mostacilla',
    technique: 'Tejido peyote a mano con 1.400 mostacillas checas calibradas e hilo de alta resistencia.',
    location: 'Elaborado en el Taller de Shirley, Getsemaní, Cartagena de Indias.',
    image: '/media/landing-image1.jpeg',
  },
  '2': {
    pieceName: 'Aretes Colibrí Caribeños',
    technique: 'Tejido artesanal liviano con topos hipoalergénicos en acero quirúrgico dorado.',
    location: 'Diseño original inspirado en los jardines y patios de Cartagena.',
    image: '/media/landing-image2.jpeg',
  },
  '3': {
    pieceName: 'Taller de Tejido de Pulseras',
    technique: 'Clase presencial personalizada: lectura de patrones ancestrales y ensartado fino.',
    location: 'Taller presencial en el Centro Histórico de Cartagena.',
    image: '/media/landing-image3.jpeg',
  },
}

export function TestimonialsGridClient({ testimonials }: TestimonialsGridClientProps) {
  const [activeTestimonial, setActiveTestimonial] = useState<TestimonialItem | null>(null)

  const handleClose = () => setActiveTestimonial(null)

  // Get details for active testimonial
  const activeDetails = activeTestimonial
    ? defaultPieceDetails[String(activeTestimonial.id)] || {
        pieceName: 'Joya de Autor en Mostacilla Calibrada',
        technique: 'Tejido artesanal hecho a mano con técnicas ancestrales colombianas.',
        location: 'Taller Shirley, Cartagena de Indias.',
        image: '/media/landing-image1.jpeg',
      }
    : null

  return (
    <>
      {/* Grilla de Testimonios Editoriales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-8">
        {testimonials.map((t, idx) => {
          const rating = t.rating || 5

          return (
            <ScrollReveal
              key={t.id || idx}
              variant="fade-up"
              delay={idx * 140}
              duration={800}
              className="h-full"
            >
              <div
                onClick={() => setActiveTestimonial(t)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveTestimonial(t)
                  }
                }}
                className="relative flex flex-col justify-between h-full p-7 sm:p-8 rounded-3xl bg-white border border-neutral-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(233,30,140,0.08)] hover:border-brand/30 transition-all duration-300 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <div>
                  {/* Comilla Decorativa y Badge de Clic */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-brand/30 group-hover:text-brand/60 transition-colors">
                      <Quote className="w-7 h-7 rotate-180" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-brand/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                      Ver historia <Sparkles className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Estrellas en Morado de Marca */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rating ? 'fill-brand text-brand' : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Cita en Serif Itálica */}
                  <p className="font-serif italic text-neutral-800 text-[15px] sm:text-base leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Autor y Origen */}
                <div className="flex items-center gap-3.5 pt-5 border-t border-neutral-100">
                  {t.avatarUrl ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-brand/30 bg-muted flex-shrink-0">
                      <Image
                        src={t.avatarUrl}
                        alt={t.authorName}
                        className="object-cover"
                        fill
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-serif font-semibold text-base flex-shrink-0 border border-brand/20">
                      {t.authorName.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-serif font-medium text-sm text-foreground truncate">
                      {t.authorName}
                    </span>
                    {t.authorRole && (
                      <span className="text-[11px] uppercase tracking-wider text-[#8B5A2B] truncate font-sans">
                        {t.authorRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>

      {/* Modal Editorial Expandido al hacer Clic */}
      {activeTestimonial && activeDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de Cierre */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-brand/10 text-neutral-500 hover:text-brand flex items-center justify-center transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado del Modal */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand/10 text-brand text-[11px] uppercase tracking-wider font-semibold border border-brand/20">
                <Sparkles className="w-3 h-3" /> Historia de la Joya
              </span>
            </div>

            {/* Testimonio y Calificación */}
            <div className="mb-6">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (activeTestimonial.rating || 5)
                        ? 'fill-brand text-brand'
                        : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <blockquote className="font-serif italic text-neutral-800 text-lg leading-relaxed mb-3">
                &ldquo;{activeTestimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-medium text-neutral-900">{activeTestimonial.authorName}</span>
                <span>•</span>
                <span>{activeTestimonial.authorRole}</span>
              </div>
            </div>

            {/* Ficha Artesanal de la Pieza */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-neutral-200/80 mb-6 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B5A2B] font-semibold block mb-1">
                  Pieza Nenúfar
                </span>
                <h4 className="font-serif text-base text-foreground font-medium">
                  {activeDetails.pieceName}
                </h4>
              </div>

              <div className="text-xs text-neutral-600 space-y-1.5 font-light leading-relaxed">
                <p>
                  <strong className="text-neutral-800 font-medium">Técnica:</strong>{' '}
                  {activeDetails.technique}
                </p>
                <p className="flex items-center gap-1 text-[#8B5A2B] pt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeDetails.location}</span>
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand hover:bg-brand-dark text-white text-xs uppercase tracking-wider font-medium transition-all shadow-md"
              >
                Explorar Catálogo <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
              <Link
                href="/#contacto"
                onClick={handleClose}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-brand/30 text-brand hover:bg-brand/5 text-xs uppercase tracking-wider font-medium transition-all"
              >
                Pedir Similar a Shirley
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
