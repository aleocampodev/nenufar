import type { ImageStripBlock as Props, Media } from '@/payload-types'
import { Media as PayloadMedia } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

export const ImageStripBlock: React.FC<Props & { id?: string }> = ({ images, id }) => {
  const defaultItems = [
    {
      title: 'Collares & Gargantillas',
      category: 'Tejido Mostacilla',
      linkUrl: '/shop?category=collares',
      imageSrc: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pulseras & Manillas',
      category: 'Hilos del Caribe',
      linkUrl: '/shop?category=pulseras',
      imageSrc: 'https://images.unsplash.com/photo-1611591475102-4a00832049d5?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Aretes & Candongas',
      category: 'Filigrana & Color',
      linkUrl: '/shop?category=aretes',
      imageSrc: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Ediciones Especiales',
      category: 'Piezas de Autor',
      linkUrl: '/shop?category=ediciones-especiales',
      imageSrc: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    },
  ]

  if (!images || images.length === 0) {
    return (
      <section id={id} className="w-full overflow-hidden bg-neutral-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {defaultItems.map((item, i) => (
            <Link
              key={i}
              href={item.linkUrl}
              className="group relative aspect-[4/5] sm:aspect-square lg:aspect-[3/4] overflow-hidden block bg-neutral-900"
            >
              <img
                src={item.imageSrc}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Krafti Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-purple-200 mb-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-white mb-3">
                  {item.title}
                </h3>
                <span className="text-xs uppercase tracking-widest font-medium text-white/90 underline underline-offset-4 decoration-purple-300/80 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Ver Colección →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="w-full overflow-hidden bg-neutral-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
        {images.map((item: any, i: number) => {
          const media = item.image as Media
          const hasMedia = media && typeof media === 'object'
          const title = item.title || defaultItems[i % 4].title
          const category = item.category || defaultItems[i % 4].category
          const href = item.linkUrl || defaultItems[i % 4].linkUrl

          return (
            <Link
              key={item.id || i}
              href={href}
              className="group relative aspect-[4/5] sm:aspect-square lg:aspect-[3/4] overflow-hidden block bg-neutral-900"
            >
              {hasMedia ? (
                <PayloadMedia
                  resource={media}
                  sizeName="card"
                  fill
                  imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <img
                  src={defaultItems[i % 4].imageSrc}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}

              {/* Krafti Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-purple-200 mb-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-white mb-3">
                  {title}
                </h3>
                <span className="text-xs uppercase tracking-widest font-medium text-white/90 underline underline-offset-4 decoration-purple-300/80 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Ver Colección →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
