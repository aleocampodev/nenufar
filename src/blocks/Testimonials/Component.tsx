import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'

type Props = {
  tagline?: string | null
  heading?: string | null
  limit?: number | null
}

export const TestimonialsBlock: React.FC<Props> = async ({
  tagline = 'Voces de Nuestra Comunidad',
  heading = 'Lo que dicen quienes lucen Nenúfar',
  limit = 3,
}) => {
  let docs: any[] = []
  try {
    const payload = await getPayload({ config: configPromise })

    const testimonialsRes = await payload.find({
      collection: 'testimonials',
      depth: 1,
      limit: limit || 3,
      overrideAccess: true,
      where: {
        _status: { equals: 'published' },
      },
    })

    docs = testimonialsRes.docs as any[]
  } catch (err) {
    console.error('Error fetching testimonials:', err)
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

  return (
    <section id="testimonios" className="py-24 md:py-32 bg-[#FAF8F5] border-y border-neutral-100 scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial Krafti */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans block">
            {tagline}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
            {heading}
          </h2>
          <div className="w-10 h-0.5 bg-brand mx-auto mt-4 rounded-full opacity-60" />
        </div>

        {/* Grilla de Testimonios Editoriales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {docs.map((t) => {
            const avatar = t.avatar && typeof t.avatar === 'object' ? (t.avatar as any) : null
            const avatarUrl = avatar?.url || null
            const rating = t.rating || 5

            return (
              <div
                key={t.id}
                className="relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-white border border-neutral-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.07)] transition-all duration-300 group"
              >
                <div>
                  {/* Comilla Decorativa */}
                  <div className="text-brand/30 group-hover:text-brand/50 transition-colors mb-4">
                    <Quote className="w-8 h-8 rotate-180" />
                  </div>

                  {/* Cita en Serif Itálica */}
                  <p className="font-serif italic text-neutral-800 text-base sm:text-lg leading-relaxed mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Autor y Origen */}
                <div className="flex items-center gap-4 pt-6 border-t border-neutral-100">
                  {avatarUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-brand/30 bg-muted flex-shrink-0">
                      <Image
                        src={avatarUrl}
                        alt={t.authorName}
                        className="object-cover"
                        fill
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F5EFEB] text-[#8B5A2B] flex items-center justify-center font-serif font-semibold text-base flex-shrink-0 border border-[#8B5A2B]/20">
                      {t.authorName.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-serif font-medium text-base text-foreground truncate">
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
            )
          })}
        </div>
      </div>
    </section>
  )
}
