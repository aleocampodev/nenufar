import type { Media, NenufarStoryBlock as Props } from '@/payload-types'
import { Media as PayloadMedia } from '@/components/Media'
import { RichText } from '@/components/RichText'
import Link from 'next/link'
import React from 'react'

export const NenufarStoryBlock: React.FC<Props & { id?: string }> = ({
  image,
  tagline,
  heading,
  description,
  linkUrl,
  linkLabel,
  id,
}) => {
  const hasImage = image && typeof image === 'object'

  return (
    <section
      id={id}
      className="py-12 md:py-20 bg-background border-y border-border/30"
    >
      <div className="container">
        {/* Krafti style: split 50/50, imagen izquierda grande, texto derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Imagen Shirley - mitad izquierda, estilo Krafti h5-img1 */}
          <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[4/5] lg:aspect-[4/3.5]">
            {hasImage ? (
              <PayloadMedia
                resource={image as Media}
                sizeName="card"
                fill
                imgClassName="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand/10 via-muted to-brand/5 p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center text-2xl mb-4">
                  🌸
                </div>
                <p className="text-sm tracking-[0.2em] uppercase text-brand font-semibold">Foto de Shirley</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-[260px]">
                  Sube la foto de Shirley en el medio desde el admin → Medios. Mientras, se ve este placeholder.
                </p>
              </div>
            )}
          </div>

          {/* Texto - mitad derecha, alusivo a Nenúfar */}
          <div className="space-y-5 lg:pl-2">
            {tagline && (
              <span className="inline-block text-xs tracking-[0.25em] uppercase text-brand font-semibold">
                {tagline}
              </span>
            )}
            {heading && (
              <h2 className="font-serif text-3xl sm:text-4xl leading-tight font-bold text-foreground">
                {heading}
              </h2>
            )}
            <div className="w-12 h-0.5 bg-brand rounded-full" />

            {description ? (
              <RichText data={description} enableGutter={false} className="prose prose-sm sm:prose-base max-w-none text-muted-foreground" />
            ) : (
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">Nenúfar</strong> nace en Cartagena de Indias de las manos de <strong className="text-foreground">Shirley</strong>, artesana que teje mostacilla con la paciencia y el color del Caribe. Cada collar, pulsera y arete es una historia hecha a mano, con hilos de alta resistencia y mostacilla calibrada que garantiza brillo y duración.
                </p>
                <p>
                  Inspirada en la filigrana momposina y en los patios de Cartagena, Shirley crea piezas livianas, hipoalergénicas y llenas de significado — perfectas para regalar o para llevar un pedacito del Caribe contigo.
                </p>
              </div>
            )}

            {linkUrl && linkLabel && (
              <Link
                href={linkUrl}
                className="inline-flex items-center justify-center mt-2 px-7 py-3 rounded-full bg-brand text-white text-xs tracking-widest uppercase font-medium hover:bg-brand/90 transition-colors shadow-sm"
              >
                {linkLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
