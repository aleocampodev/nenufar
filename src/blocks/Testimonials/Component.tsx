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

  let docs = testimonialsRes.docs as any[]

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
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {tagline && (
            <span className="text-xs uppercase tracking-[0.25em] text-brand font-semibold font-sans mb-2 block">
              {tagline}
            </span>
          )}
          {heading && (
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-bold tracking-tight">
              {heading}
            </h2>
          )}
          <div className="w-12 h-0.5 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Grilla de Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {docs.map((t) => {
            const avatar = t.avatar && typeof t.avatar === 'object' ? (t.avatar as any) : null
            const avatarUrl = avatar?.url || null
            const rating = t.rating || 5

            return (
              <div
                key={t.id}
                className="relative flex flex-col justify-between p-8 rounded-3xl bg-card border border-border/60 hover:border-brand/30 transition-all duration-300 shadow-sm"
              >
                <div>
                  {/* Estrellas */}
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Cita */}
                  <p className="font-serif italic text-foreground text-sm sm:text-base leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Autor */}
                <div className="flex items-center gap-3 pt-6 border-t border-border/40">
                  {avatarUrl ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-brand/30 bg-muted flex-shrink-0">
                      <Image
                        src={avatarUrl}
                        alt={t.authorName}
                        className="object-cover"
                        fill
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 border border-brand/20">
                      {t.authorName.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-serif font-semibold text-sm text-foreground truncate">
                      {t.authorName}
                    </span>
                    {t.authorRole && (
                      <span className="text-[11px] text-muted-foreground truncate">
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
