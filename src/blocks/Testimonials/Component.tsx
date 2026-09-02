import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'

type Props = {
  tagline?: string | null
  heading?: string | null
  limit?: number | null
  items?: any[] | null
}

import { TestimonialsGridClient, type TestimonialItem } from './TestimonialsGridClient'

export const TestimonialsBlock: React.FC<Props> = async ({
  tagline = 'Voces de Nuestra Comunidad',
  heading = 'Lo que dicen quienes lucen Nenúfar',
  limit = 6,
  items,
}) => {
  let docs: any[] = []

  if (items && Array.isArray(items) && items.length > 0) {
    docs = items
  } else {
    try {
      const payload = await getPayload({ config: configPromise })

      const testimonialsRes = await payload.find({
        collection: 'testimonials',
        depth: 1,
        limit: limit || 6,
        overrideAccess: true,
        where: {
          _status: { equals: 'published' },
        },
      })

      if (testimonialsRes.docs && testimonialsRes.docs.length > 0) {
        docs = testimonialsRes.docs as any[]
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err)
    }
  }

  // Placeholder when no testimonials yet (so landing is not empty before Shirley adds real ones)
  if (!docs || docs.length === 0) {
    docs = [
      {
        id: 1,
        quote:
          'Mi collar de mostacilla es una obra de arte. Se nota el amor y la dedicación en cada detalle. ¡Shirley es una artista!',
        authorName: 'María José',
        authorRole: 'Cartagena',
        avatar: null,
        rating: 5,
      },
      {
        id: 2,
        quote: 'El empaque es hermoso y el envío llegó perfecto. Mis aretes son cómodos y brillan muchísimo.',
        authorName: 'Laura V.',
        authorRole: 'Bogotá',
        avatar: null,
        rating: 5,
      },
      {
        id: 3,
        quote: 'Tomé el taller de mostacilla y fue una experiencia hermosa. Aprendí mucho y me llevé mi primera pulsera.',
        authorName: 'Camila R.',
        authorRole: 'Medellín — Taller',
        avatar: null,
        rating: 5,
      },
    ]
  }

  const formattedDocs: TestimonialItem[] = (docs || [])
    .filter((t) => t != null && typeof t === 'object')
    .map((t, idx) => {
      const avatar = t.avatar && typeof t.avatar === 'object' ? (t.avatar as any) : null
      return {
        id: t.id || `test-${idx + 1}`,
        quote: t.quote || '',
        authorName: t.authorName || 'Cliente',
        authorRole: t.authorRole || null,
        avatarUrl: avatar?.url || null,
        rating: t.rating || 5,
      }
    })

  return (
    <section id="testimonios" className="py-14 sm:py-16 md:py-20 bg-[#FAF8F5] border-y border-neutral-100 scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial Krafti */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2.5">
          <span className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans block">
            {tagline}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
            {heading}
          </h2>
          <div className="w-12 h-0.5 bg-brand mx-auto mt-3.5 rounded-full opacity-60" />
        </div>

        {/* Grilla Interactiva con Modal de Historia al hacer Clic */}
        <TestimonialsGridClient testimonials={formattedDocs} />
      </div>
    </section>
  )
}
