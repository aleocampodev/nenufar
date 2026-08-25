'use client'

import type { Product } from '@/payload-types'
import Link from 'next/link'
import React, { useTransition } from 'react'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Sparkles, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

type Props = {
  product: Partial<Product>
  index: number
  isHero?: boolean
}

// Paleta pastel artesanal exacta de Krafti
const KRAFTI_BG_COLORS = [
  'bg-[#E9ECEF] dark:bg-zinc-900/50', // cool mist / light stone (Hero item in Krafti)
  'bg-[#FAEDE4] dark:bg-zinc-900/80', // soft blush peach (Top middle in Krafti)
  'bg-[#FDFBF7] dark:bg-zinc-900/40', // ivory cream (Top right in Krafti)
  'bg-[#FDFBF7] dark:bg-zinc-900/70', // ivory cream (Bottom middle in Krafti)
  'bg-[#FAF5EE] dark:bg-zinc-900/60', // soft warm sand (Bottom right in Krafti)
  'bg-[#F3EFF8] dark:bg-zinc-900/75', // gentle lavender mist
]

export const KraftiProductTile: React.FC<Props> = ({ product, index, isHero = false }) => {
  const { addItem, isLoading } = useCart()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = React.useState(false)

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

  const firstCategory = product.categories?.[0]
  const categoryTitle =
    firstCategory && typeof firstCategory === 'object' && 'title' in firstCategory
      ? firstCategory.title
      : null

  const isOutOfStock = typeof inventory === 'number' && inventory <= 0
  const bgClass = KRAFTI_BG_COLORS[index % KRAFTI_BG_COLORS.length]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || !product.id) return

    startTransition(async () => {
      try {
        const variants = product.variants?.docs
        const firstVariant = variants && variants.length > 0 ? variants[0] : null
        const variantId = firstVariant && typeof firstVariant === 'object' ? firstVariant.id : undefined

        await addItem({
          product: product.id as number,
          ...(variantId ? { variant: variantId } : {}),
        })
        setAdded(true)
        toast.success(`¡${title} agregado al carrito!`)
        setTimeout(() => setAdded(false), 2000)
      } catch (err) {
        console.error('Error adding item:', err)
        toast.error('No se pudo agregar al carrito')
      }
    })
  }

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden border-r border-b border-border/40 transition-all duration-300 ${bgClass} ${
        isHero
          ? 'col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[500px] md:min-h-[700px]'
          : 'col-span-1 row-span-1 min-h-[280px] md:min-h-[350px]'
      }`}
    >
      {/* Badges superiores (Destacado / Agotado) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {featured ? (
          <span className="inline-flex items-center gap-1.5 bg-brand text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3" />
            Destacado
          </span>
        ) : (
          <span />
        )}

        {isOutOfStock && (
          <span className="bg-neutral-900/90 text-white text-[10px] uppercase font-semibold tracking-wider px-3 py-1 rounded-full">
            Agotado
          </span>
        )}
      </div>

      {/* Contenedor de la Imagen con efecto Krafti */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-14 relative overflow-hidden">
        <Link
          href={`/products/${productSlug}`}
          className="relative w-full h-full flex items-center justify-center min-h-[200px] z-10 focus:outline-none"
        >
          {image ? (
            <Media
              className="max-h-[90%] max-w-[90%] w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              resource={image}
              priority={index === 0}
            />
          ) : (
            <div className="flex aspect-square w-28 items-center justify-center rounded-full bg-background/40 text-muted-foreground/30 text-4xl font-serif">
              ✦
            </div>
          )}
        </Link>

        {/* Botón flotante AGREGAR AL CARRITO al hacer hover estilo Krafti */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px] z-30 pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading || isPending}
              className="bg-brand hover:bg-brand-dark text-white text-[11px] uppercase font-semibold tracking-[0.25em] px-8 py-3.5 shadow-2xl border border-white/20 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 cursor-pointer pointer-events-auto"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Agregar al Carrito
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Información del Producto Centrada al Pie estilo Krafti */}
      <Link
        href={`/products/${productSlug}`}
        className="pb-7 sm:pb-9 px-6 text-center flex flex-col items-center justify-center gap-1.5 z-10 focus:outline-none"
      >
        <h3
          className={`font-serif uppercase tracking-[0.2em] text-foreground transition-colors duration-300 group-hover:text-brand font-bold leading-snug ${
            isHero ? 'text-base sm:text-lg md:text-xl' : 'text-xs sm:text-sm'
          }`}
        >
          {title}
        </h3>

        <span className="text-[11px] italic font-serif text-muted-foreground">
          {categoryTitle || 'Joyas de Mostacilla'}
        </span>

        {typeof price === 'number' && (
          <span
            className={`font-serif text-foreground/80 font-medium tracking-wide mt-0.5 ${
              isHero ? 'text-base' : 'text-sm'
            }`}
          >
            <Price amount={price} currencyCode="COP" />
          </span>
        )}
      </Link>
    </div>
  )
}
