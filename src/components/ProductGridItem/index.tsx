import type { Product, Variant } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
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

  return (
    <Link
      className="relative inline-block h-full w-full group"
      href={`/products/${productSlug}`}
    >
      {/* Image Container with better hover */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-card border border-border/50">
        {image ? (
          <Media
            className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-95"
            resource={image}
            sizeName="card"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <span className="text-muted-foreground/50 text-6xl">✦</span>
          </div>
        )}

        {/* Hover overlay with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="mt-5 flex flex-col gap-2">
        {/* Title - Serif for elegance */}
        <div className="font-serif text-lg leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </div>

        {/* Price - Mono for technical feel */}
        {typeof price === 'number' && (
          <div className="font-mono text-sm text-muted-foreground">
            <Price amount={price} />
          </div>
        )}
      </div>
    </Link>
  )
}
