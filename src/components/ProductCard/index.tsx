import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

type Props = {
  product: Partial<Product>
}

/**
 * Card de producto estilo Krafti (masonry).
 *
 * La imagen se sirve a ratio NATURAL (sin `sizeName`): los tamaños WebP que
 * genera Payload (thumbnail 400×500, card 800×1000) son ratio fijo 4:5 y
 * aplanarían el masonry. La imagen original preserva la proporción de la foto
 * que sube Shirley, que es justo el efecto galería que buscamos.
 */
export const ProductCard: React.FC<Props> = ({ product }) => {
  const { gallery, priceInCOP, title } = product

  let price = priceInCOP

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInCOP &&
      typeof variant.priceInCOP === 'number'
    ) {
      price = variant.priceInCOP
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  const productSlug = product.slug || String(product.id)

  // Categoría: llega como objeto con .title cuando depth >= 1
  const firstCategory = product.categories?.[0]
  const categoryTitle =
    firstCategory && typeof firstCategory === 'object' && 'title' in firstCategory
      ? firstCategory.title
      : null

  return (
    <Link
      className="group block h-full w-full focus-visible:outline-2 focus-visible:outline-brand"
      href={`/products/${productSlug}`}
    >
      <div className="relative overflow-hidden rounded-sm bg-muted/30">
        {image ? (
          <Media
            className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            resource={image}
            priority={false}
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-muted/30">
            <span className="text-6xl text-muted-foreground/50">✦</span>
          </div>
        )}

        {/* Overlay hover — en touch la card entera navega */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="bg-background/90 px-4 py-2 text-xs font-medium uppercase tracking-widest text-foreground">
            Ver pieza
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {categoryTitle ? (
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {categoryTitle}
          </span>
        ) : null}
        <span className="font-serif text-lg leading-tight text-foreground transition-colors duration-300 group-hover:text-brand">
          {title}
        </span>
        {typeof price === 'number' && (
          <span className="font-mono text-sm text-muted-foreground">
            <Price amount={price} />
          </span>
        )}
      </div>
    </Link>
  )
}
