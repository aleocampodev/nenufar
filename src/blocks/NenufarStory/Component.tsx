import type { Media, NenufarStoryBlock as Props } from '@/payload-types'
import { Media as PayloadMedia } from '@/components/Media'
import { RichText } from '@/components/RichText'
import Link from 'next/link'
import React from 'react'

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
      className="py-20 md:py-28 bg-[#FAF8F5] border-y border-neutral-100 scroll-mt-24"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Krafti split: Gran foto artesanal izquierda, narrativa y firma derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Imagen Taller / Shirley */}
          <div className="relative overflow-hidden rounded-3xl bg-neutral-100 aspect-[4/5] shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            {hasImage ? (
              <PayloadMedia
                resource={image as Media}
                sizeName="card"
                fill
                imgClassName="object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&auto=format&fit=crop&q=85"
                alt="Taller artesanal de joyería en mostacilla Shirley"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            )}
          </div>

          {/* Contenido Narrativo */}
          <div className="space-y-6 lg:pl-4">
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
                  Inspirada en la filigrana momposina y en los patios cartageneros, Shirley crea piezas livianas, hipoalergénicas y llenas de significado — perfectas para regalar o para llevar un pedacito del Caribe contigo.
                </p>
              </div>
            )}

            {linkUrl && linkLabel && (
              <div className="pt-2">
                <Link
                  href={linkUrl}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-dark transition-all duration-300 shadow-[0_4px_20px_rgba(106,27,154,0.25)]"
                >
                  {linkLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
