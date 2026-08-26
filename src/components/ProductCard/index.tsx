import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Sparkles } from 'lucide-react'

type Props = {
  product: Partial<Product>
}

/**
 * Card de producto estilo Krafti (masonry artesanal).
 *
 * Preserva la proporción natural de la imagen subida por Shirley
 * para crear el efecto masonry armonioso.
 */
export const ProductCard: React.FC<Props> = ({ product }) => {
  const { gallery, priceInCOP, title, featured, inventory } = product

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

  const isOutOfStock = typeof inventory === 'number' && inventory <= 0

  return (
    <Link
      className="group block h-full w-full focus-visible:outline-2 focus-visible:outline-brand"
      href={`/products/${productSlug}`}
    >
      <div className="relative overflow-hidden rounded-lg bg-muted/20 border border-border/40 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        {image ? (
          <Media
            className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            resource={image}
            priority={false}
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center bg-muted/30">
            <span className="text-6xl text-muted-foreground/30 font-serif">✦</span>
          </div>
        )}

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {featured ? (
            <span className="inline-flex items-center gap-1 bg-brand text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3" />
              Destacado
            </span>
          ) : (
            <span />
          )}

          {isOutOfStock && (
            <span className="bg-neutral-900/90 text-white text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-full">
              Agotado
            </span>
          )}
        </div>

        {/* Overlay hover suave estilo Krafti */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
          <span className="bg-background/95 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Ver Pieza
          </span>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="mt-3.5 flex flex-col gap-1 px-1">
        {categoryTitle ? (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            {categoryTitle}
          </span>
        ) : null}
        <span className="font-serif text-base md:text-lg leading-snug text-foreground transition-colors duration-300 group-hover:text-brand font-normal">
          {title}
        </span>
        {typeof price === 'number' && (
          <span className="font-mono text-sm text-foreground/85 font-medium mt-0.5">
            <Price amount={price} currencyCode="COP" />
          </span>
        )}
      </div>
    </Link>
  )
}

