import type { ImageStripBlock as Props, Media } from '@/payload-types'
import { Media as PayloadMedia } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

export const ImageStripBlock: React.FC<Props & { id?: string }> = ({ images, id }) => {
  if (!images || images.length === 0) {
    // Placeholder Krafti 4 imágenes
    const placeholders = [
      'https://images.unsplash.com/photo-1582738411706-bfc8e691d1e2?w=600&auto=format&fit=crop&q=60', // drill
      'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&auto=format&fit=crop&q=60', // blue bowl
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=60', // brushes
      'https://images.unsplash.com/photo-1590794056226-017905317107?w=600&auto=format&fit=crop&q=60', // spoons
    ]
    return (
      <section id={id} className="w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {placeholders.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden bg-neutral-100">
              <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
        {images.map((item: any, i: number) => {
          const media = item.image as Media
          const hasMedia = media && typeof media === 'object'
          const content = hasMedia ? (
            <PayloadMedia resource={media} sizeName="card" fill imgClassName="object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-neutral-100" />
          )

          const wrapperClass = 'relative aspect-square overflow-hidden bg-neutral-100 block'

          if (item.linkUrl) {
            return (
              <Link key={item.id || i} href={item.linkUrl} className={wrapperClass}>
                {hasMedia ? (
                  <PayloadMedia resource={media} sizeName="card" fill imgClassName="object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-neutral-100" />
                )}
              </Link>
            )
          }

          return (
            <div key={item.id || i} className={wrapperClass}>
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}
