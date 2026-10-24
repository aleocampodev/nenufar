import type { Media, NenufarStoryBlock as Props } from '@/payload-types'
import { Media as PayloadMedia } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getSupabasePublicUrl } from '@/lib/supabaseStorage'

export const NenufarStoryBlock: React.FC<Props & { id?: string }> = ({
  image,
  tagline = 'Hecho a mano en Cartagena',
  heading = 'Nenúfar — Manos que tejen historias',
  description,
  linkUrl = '/shop',
  linkLabel = 'Conocer la colección',
  id,
}) => {
  const hasImage = Boolean(image && (typeof image === 'object' ? (image as Media)?.url || (image as Media)?.id : image))

  return (
    <section
      id={id || 'historia'}
      className="py-16 md:py-24 bg-[#FAF8F5] border-y border-neutral-100 scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Krafti editorial split: 2 columnas desde pantallas medianas (md: 768px) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Imagen Taller / Shirley */}
          <div className="md:col-span-5 flex justify-center">
            <ScrollReveal variant="fade-right" duration={900} className="w-full">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-100 aspect-[4/3] sm:aspect-[4/5] shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5 group w-full">
                {hasImage ? (
                  <PayloadMedia
                    resource={image as Media}
                    sizeName="card"
                    fill
                    imgClassName="object-cover object-[center_38%] transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={getSupabasePublicUrl('shirley-creadora.jpeg')}
                    alt="Shirley tejiendo joyería en mostacilla en su taller"
                    className="w-full h-full object-cover object-[center_38%] transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Contenido Narrativo */}
          <div className="md:col-span-7">
            <ScrollReveal variant="fade-left" delay={150} duration={900}>
              <div className="space-y-6 lg:pl-2">
                {tagline && (
                  <span className="inline-block text-xs tracking-[0.3em] uppercase text-[#8B5A2B] font-semibold font-sans">
                    {tagline}
                  </span>
                )}
                {heading && (
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] font-normal text-foreground">
                    {heading}
                  </h2>
                )}
                <div className="w-12 h-0.5 bg-brand rounded-full opacity-60" />

                {description ? (
                  <RichText data={description} enableGutter={false} className="prose prose-sm sm:prose-base max-w-none text-neutral-600 font-light leading-relaxed" />
                ) : (
                  <div className="space-y-4 text-sm sm:text-base leading-relaxed text-neutral-600 font-light">
                    <p>
                      <strong className="text-neutral-900 font-medium">Nenúfar</strong> nace en Cartagena de Indias de las manos de <strong className="text-neutral-900 font-medium">Shirley</strong>, artesana que teje mostacilla con la paciencia y el color del Caribe. Cada collar, pulsera y arete es una historia hecha a mano, con hilos de alta resistencia y mostacilla calibrada que garantiza brillo y duración.
                    </p>
                    <p>
                      Inspirada en los tejidos ancestrales de los Emberá y en los colores de Cartagena, Shirley crea piezas livianas, hipoalergénicas y llenas de significado — perfectas para regalar o para llevar un pedacito del Caribe contigo. En la mitad de esta historia estás tú, luciendo una pieza única.
                    </p>
                  </div>
                )}

                {linkUrl && (
                  <div className="pt-2">
                    <Link
                      href={linkUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(233,30,140,0.25)] hover:shadow-[0_6px_25px_rgba(233,30,140,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {linkLabel || 'Conocer la colección'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
