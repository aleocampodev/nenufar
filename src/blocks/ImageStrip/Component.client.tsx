'use client'

import type { ImageStripBlock as Props, Media } from '@/payload-types'
import { Media as PayloadMedia } from '@/components/Media'
import Link from 'next/link'
import React, { useState } from 'react'
import { Sparkles, X, ChevronRight, Clock, ShieldCheck, Heart } from 'lucide-react'

const DEFAULT_ITEMS = [
  {
    category: 'TRADICIÓN FEMENINA EMBERÁ',
    title: 'El Okama Ceremonial',
    excerpt: 'El camino sagrado que viste y abraza el cuello de la mujer.',
    imageUrl:
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop&q=80',
    storyMeaning:
      'En lengua Emberá, Okama significa literalmente "camino que recorre el cuello". Es el collar más sagrado de la mujer indígena: comunica su madurez, dignidad y conexión profunda con las aguas de los ríos y los ciclos de la luna.',
    storyCraft:
      'Más de 3.200 micro-mostacillas checas calibradas, hiladas a mano una por una durante 20 a 30 horas de concentración absoluta.',
    storyFeel:
      'Caída anatómica flexible que se amolda al pecho como una segunda piel. Colores vivos que no pierden su brillo con el tiempo.',
  },
  {
    category: 'COSMOVISIÓN & PODER',
    title: 'La Otapa Ancestral',
    excerpt: 'Estructura geométrica que custodia el espíritu y narra los senderos de la selva.',
    imageUrl:
      'https://images.unsplash.com/photo-1611591475102-4a00832049d5?w=800&auto=format&fit=crop&q=80',
    storyMeaning:
      'La Otapa es la expresión geométrica del linaje ancestral. Sus patrones en zigzag y rombos representan los senderos de la montaña, la piel protectora de la serpiente sagrada y un escudo contra las malas energías.',
    storyCraft:
      'Tejida con hilo encerado técnico de alta resistencia que mantiene una estructura firme e imponente que no se deforma ni se dobla al vestirla.',
    storyFeel:
      'Una joya majestuosa con presencia imponente que convierte cualquier atuendo en una declaración de arte e identidad cultural.',
  },
  {
    category: 'ELEGANCIA CONTEMPORÁNEA',
    title: 'El Okama Contemporáneo',
    excerpt: 'La magia del tejido Emberá adaptada a un formato liviano para cada día.',
    imageUrl:
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    storyMeaning:
      'Creado para la mujer que desea portar la fuerza del tejido indígena en su rutina diaria sin recurrir a formatos ceremoniales gigantes.',
    storyCraft:
      'Diseños depurados que condensan la geometría sagrada en cuellos delgados, cómodos y de alta definición estética.',
    storyFeel:
      'Ultraliviano (se siente como un pañuelo de seda sobre la piel). Cierres hipoalergénicos que no irritan el cuello ni enredan el cabello.',
  },
  {
    category: 'ALTA COSTURA ARTESANAL',
    title: 'La Otapa de Autor',
    excerpt: 'Obras de arte textil irrepetibles: nacen una sola vez y no vuelven a existir igual.',
    imageUrl:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    storyMeaning:
      'Piezas nacidas de la inspiración pura de Shirley en Cartagena, fusionando la técnica milenaria Emberá con paletas de color inspiradas en los atardeceres caribeños.',
    storyCraft:
      'Creaciones únicas sin réplica. Cuando una pieza encuentra dueña, su patrón queda cerrado para siempre como una obra de autor exclusiva.',
    storyFeel:
      'La certeza de llevar una obra de arte textil de colección que nadie más en el mundo tendrá igual.',
  },
]

export const ImageStripClient: React.FC<Props & { id?: string }> = ({
  tagline,
  heading,
  description,
  images,
  id,
}) => {
  const [selectedStory, setSelectedStory] = useState<(typeof DEFAULT_ITEMS)[0] | null>(null)

  const items = images && images.length > 0 ? images : DEFAULT_ITEMS

  return (
    <section id={id || 'tradicion'} className="py-20 bg-[#FAF8F5] dark:bg-zinc-950 border-y border-brand/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[11px] font-sans font-semibold uppercase tracking-[0.25em]">
            <Sparkles className="w-3 h-3" />
            {tagline || 'LEGADO VIVO · COSMOVISIÓN EMBERÁ'}
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
            {heading || 'El Universo Ancestral de los Okamas & Otapas'}
          </h2>

          {description && (
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Grilla de 4 Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, i: number) => {
            const defaultItem = DEFAULT_ITEMS[i % DEFAULT_ITEMS.length]
            const category = item.category || defaultItem.category
            const title = item.title || defaultItem.title
            const excerpt = item.excerpt || defaultItem.excerpt
            const imageMedia = item.image as Media
            const hasMedia = imageMedia && typeof imageMedia === 'object'
            const imgSrc = item.imageUrl || defaultItem.imageUrl

            const storyData = {
              category,
              title,
              excerpt,
              imageUrl: hasMedia ? imageMedia.url || imgSrc : imgSrc,
              storyMeaning: item.storyMeaning || defaultItem.storyMeaning,
              storyCraft: item.storyCraft || defaultItem.storyCraft,
              storyFeel: item.storyFeel || defaultItem.storyFeel,
            }

            return (
              <div
                key={i}
                onClick={() => setSelectedStory(storyData)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
              >
                {/* Contenedor de la Imagen */}
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  {hasMedia ? (
                    <PayloadMedia
                      resource={imageMedia}
                      sizeName="card"
                      fill
                      imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imgSrc}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}

                  {/* Badge de Categoría flotante */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-medium">
                      {category}
                    </span>
                  </div>

                  {/* Gradiente inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Texto dentro de la foto */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal leading-snug mb-1 group-hover:text-amber-200 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 font-light leading-relaxed mb-3">
                      {excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-white group-hover:translate-x-1 transition-transform">
                      Conocer Historia <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pie Editorial */}
        <div className="text-center mt-10">
          <p className="text-xs text-stone-500 font-light tracking-wide">
            Toca cualquiera de las 4 piezas para conocer su significado sagrado, técnica de hilado y confort en cuerpo.
          </p>
        </div>
      </div>

      {/* Modal Interactivo de Cosmovisión y Detalles */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 sm:p-10 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-600 hover:text-foreground transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold block mb-1">
                {selectedStory.category}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
                {selectedStory.title}
              </h3>
              <p className="text-sm text-neutral-500 mt-1 italic">
                &ldquo;{selectedStory.excerpt}&rdquo;
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-zinc-800">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
                    Significado Ancestral
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                    {selectedStory.storyMeaning}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
                    El Arte del Tejido
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                    {selectedStory.storyCraft}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
                    Sensación en Piel & Comodidad
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                    {selectedStory.storyFeel}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                onClick={() => setSelectedStory(null)}
                className="flex-1 py-3 px-6 text-center rounded-full bg-brand hover:bg-brand-dark text-white text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Ver Diseños Disponibles en el Catálogo
              </Link>
              <button
                onClick={() => setSelectedStory(null)}
                className="py-3 px-6 text-center rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
