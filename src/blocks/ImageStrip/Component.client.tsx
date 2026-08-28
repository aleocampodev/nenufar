"use client"

import React, { useState } from "react"
import { Media as PayloadMedia } from "@/components/Media"
import type { Media } from "@/payload-types"
import { Sparkles, X, ChevronDown, ChevronUp, Feather, ShieldCheck } from "lucide-react"

interface CardItem {
  id?: string
  category?: string | null
  title?: string | null
  excerpt?: string | null
  image?: Media | string | null
  imageUrl?: string | null
  storyMeaning?: string | null
  storyCraft?: string | null
  storyFeel?: string | null
  alt?: string | null
}

interface ImageStripProps {
  id?: string
  tagline?: string | null
  heading?: string | null
  description?: string | null
  images?: CardItem[] | null
}

const DEFAULT_ITEMS: CardItem[] = [
  {
    category: "TRADICIÓN FEMENINA EMBERÁ",
    title: "El Okama Ceremonial",
    excerpt: "El camino sagrado que viste y abraza el cuello de la mujer con la dignidad del pueblo Emberá.",
    imageUrl:
      "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg",
    storyMeaning:
      "En lengua Emberá, Okama significa literalmente \"camino que recorre el cuello\". Es el collar más sagrado de la mujer indígena: comunica su madurez, dignidad y conexión profunda con las aguas de los ríos y los ciclos de la luna.",
    storyCraft:
      "Más de 3.200 micro-mostacillas checas calibradas, hiladas a mano una por una durante 20 a 30 horas de concentración absoluta.",
    storyFeel:
      "Caída anatómica flexible que se amolda al pecho como una segunda piel. Colores vivos que no pierden su brillo con el tiempo.",
  },
  {
    category: "COSMOVISIÓN & PODER",
    title: "La Otapa Ancestral",
    excerpt: "Estructura geométrica de rombos y senderos de selva que custodia el espíritu.",
    imageUrl:
      "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg",
    storyMeaning:
      "La Otapa es la expresión geométrica del linaje ancestral. Sus patrones en zigzag y rombos representan los senderos de la montaña, la piel protectora de la serpiente sagrada y un escudo contra las malas energías.",
    storyCraft:
      "Tejida con hilo encerado técnico de alta resistencia que mantiene una estructura firme e imponente que no se deforma ni se dobla al vestirla.",
    storyFeel:
      "Una joya majestuosa con presencia imponente que convierte cualquier atuendo en una declaración de arte e identidad cultural.",
  },
  {
    category: "ELEGANCIA CONTEMPORÁNEA",
    title: "El Okama Contemporáneo",
    excerpt: "La magia del tejido Emberá adaptada a un formato liviano para cada día.",
    imageUrl:
      "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg",
    storyMeaning:
      "Creado para la mujer que desea portar la fuerza del tejido indígena en su rutina diaria (reuniones, salidas casuales o eventos formales) sin recurrir a formatos ceremoniales gigantes.",
    storyCraft:
      "Diseños depurados que condensan la geometría sagrada en cuellos delgados, cómodos y de alta definición estética.",
    storyFeel:
      "Ultraliviano (se siente como un pañuelo de seda sobre la piel). Cierres hipoalergénicos que no irritan el cuello ni enredan el cabello.",
  },
  {
    category: "ALTA COSTURA ARTESANAL",
    title: "La Otapa de Autor",
    excerpt: "Obras de arte textil irrepetibles: nacen una sola vez y no vuelven a existir igual.",
    imageUrl:
      "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/colombia-aretes.jpeg",
    storyMeaning:
      "Piezas nacidas de la inspiración pura de Shirley en Cartagena, fusionando la técnica milenaria Emberá con paletas de color inspiradas en los atardeceres y la arquitectura caribeña.",
    storyCraft:
      "Creaciones únicas sin réplica. Cuando una pieza encuentra dueña, su patrón queda cerrado para siempre como una obra de autor exclusiva.",
    storyFeel:
      "La certeza de llevar una obra de arte textil de colección que nadie más en el mundo tendrá igual. Ideal para celebrar momentos trascendentales.",
  },
]

export const ImageStripClient: React.FC<ImageStripProps> = ({
  id,
  tagline = "LEGADO VIVO · COSMOVISIÓN EMBERÁ",
  heading = "El Universo Ancestral de los Okamas & Otapas",
  description = "Cada collar es un lienzo sagrado donde miles de micro-mostacillas tejidas a mano por Shirley narran la dignidad de la mujer, los ríos y los senderos sagrados de nuestra tierra.",
  images,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const items = images && images.length > 0 ? images : DEFAULT_ITEMS

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }

  const activeItem = expandedIndex !== null ? items[expandedIndex] || DEFAULT_ITEMS[expandedIndex % 4] : null

  return (
    <section id={id || "tradicion"} className="w-full bg-[#FAF8F5] pt-16 sm:pt-20">
      {/* Encabezado Editorial Superior */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center mb-12">
        {tagline && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[11px] font-sans font-semibold uppercase tracking-[0.25em] mb-3">
            <Sparkles className="w-3 h-3" />
            {tagline}
          </span>
        )}
        {heading && (
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight mb-4">
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* TIRA DE 4 FOTOS CONTINUA ESTILO KRAFTI (Borde a borde 100% ancho, sin separaciones ni margenes) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 overflow-hidden">
        {items.map((item, i) => {
          const fallback = DEFAULT_ITEMS[i % DEFAULT_ITEMS.length]
          const media = item.image as Media
          const hasMedia = media && typeof media === "object" && media.url
          const title = item.title || fallback.title
          const category = item.category || fallback.category
          const excerpt = item.excerpt || fallback.excerpt
          const isExpanded = expandedIndex === i
          const imgSrc = hasMedia ? media.url : item.imageUrl || fallback.imageUrl

          return (
            <div
              key={item.id || i}
              onClick={() => toggleExpand(i)}
              className={`group relative aspect-[4/5] sm:aspect-square lg:aspect-[3/4] overflow-hidden cursor-pointer bg-stone-900 select-none transition-all duration-300 ${
                isExpanded ? "ring-4 ring-inset ring-amber-400 z-10" : ""
              }`}
            >
              {/* Foto de fondo */}
              {hasMedia ? (
                <PayloadMedia
                  resource={media}
                  sizeName="card"
                  fill
                  imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <img
                  src={imgSrc || ""}
                  alt={title || ""}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}

              {/* Degradado Krafti inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-300 mb-1.5">
                  {category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-2 leading-snug">
                  {title}
                </h3>
                {excerpt && (
                  <p className="text-xs text-stone-200 line-clamp-2 mb-3 font-light leading-relaxed">
                    {excerpt}
                  </p>
                )}

                {/* Indicador de lectura (Puro texto) */}
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-medium text-amber-300 group-hover:text-amber-200">
                  <span>{isExpanded ? "Cerrar historia" : "Leer historia y técnica"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* PANEL EXPANDIBLE DE HISTORIA ANCESTRAL (Aparece abajo de la tira al tocar cualquiera) */}
      {activeItem && expandedIndex !== null && (
        <div className="bg-stone-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800 animate-in fade-in duration-400">
          <div className="container mx-auto max-w-5xl relative">
            {/* Botón de cerrar */}
            <button
              onClick={() => setExpandedIndex(null)}
              className="absolute top-0 right-0 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera del ítem activo */}
            <div className="mb-8 max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                {activeItem.category || DEFAULT_ITEMS[expandedIndex % 4].category}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white mt-1 mb-2 font-normal">
                {activeItem.title || DEFAULT_ITEMS[expandedIndex % 4].title}
              </h3>
              {activeItem.excerpt && (
                <p className="text-sm sm:text-base text-amber-200/90 italic font-serif">
                  \"{activeItem.excerpt || DEFAULT_ITEMS[expandedIndex % 4].excerpt}\"
                </p>
              )}
            </div>

            {/* 3 Pilares Narrativos en Puro Texto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
              {/* Pilar 1: Simbología */}
              <div className="bg-stone-950/70 rounded-2xl p-6 border border-stone-800/80">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base font-medium text-stone-100">
                    Simbología Sagrada
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {activeItem.storyMeaning || DEFAULT_ITEMS[expandedIndex % 4].storyMeaning}
                </p>
              </div>

              {/* Pilar 2: Arte del Tejido */}
              <div className="bg-stone-950/70 rounded-2xl p-6 border border-stone-800/80">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Feather className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base font-medium text-stone-100">
                    El Arte del Tejido
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {activeItem.storyCraft || DEFAULT_ITEMS[expandedIndex % 4].storyCraft}
                </p>
              </div>

              {/* Pilar 3: Confort en Cuerpo */}
              <div className="bg-stone-950/70 rounded-2xl p-6 border border-stone-800/80">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base font-medium text-stone-100">
                    Confort & En Cuerpo
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {activeItem.storyFeel || DEFAULT_ITEMS[expandedIndex % 4].storyFeel}
                </p>
              </div>
            </div>

            {/* Pie Editorial */}
            <div className="mt-8 pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-400 font-light">
                Cada pieza es tejida pacientemente por Shirley en su taller de Cartagena de Indias.
              </span>
              <button
                onClick={() => setExpandedIndex(null)}
                className="text-xs uppercase tracking-wider text-amber-300 hover:text-amber-200 font-medium py-2 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
              >
                Cerrar historia ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
