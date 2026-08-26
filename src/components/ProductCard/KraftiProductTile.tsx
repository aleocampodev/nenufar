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

// Paleta pastel artesanal exacta de Krafti (según referencia: peach, blanco, crema almendra)
const KRAFTI_BG_COLORS = [
  'bg-[#F7EBE1] dark:bg-zinc-900/60', // 1. Peach / Rosa empolvado suave (Top left)
  'bg-[#FFFFFF] dark:bg-zinc-900/20', // 2. Blanco puro (Top right)
  'bg-[#FFFFFF] dark:bg-zinc-900/20', // 3. Blanco puro (Bottom left)
  'bg-[#FAF5ED] dark:bg-zinc-900/80', // 4. Crema almendra cálido (Bottom right)
  'bg-[#F5EFE8] dark:bg-zinc-900/50', // 5. Arena suave
  'bg-[#F6F1F8] dark:bg-zinc-900/70', // 6. Lavanda empolvada
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
          : 'col-span-1 row-span-1 min-h-[380px] sm:min-h-[440px]'
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
          <span className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-3.5 py-1 rounded-full shadow-sm">
            Agotado
          </span>
        )}
      </div>

      {/* Contenedor de la Imagen con efecto Krafti */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <Link
          href={`/products/${productSlug}`}
          className="relative w-full h-full flex items-center justify-center min-h-[220px] z-10 focus:outline-none"
        >
          {image ? (
            <Media
              className="max-h-[90%] max-w-[90%] w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.07] drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
              resource={image}
              priority={index === 0}
            />
          ) : (
            <div className="flex aspect-square w-28 items-center justify-center rounded-full bg-background/40 text-muted-foreground/30 text-4xl font-serif">
              ✦
            </div>
          )}
        </Link>

        {/* Botón flotante estilo Píldora redondeada consistente con los Filtros */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[1px] z-30 pointer-events-none group-hover:pointer-events-auto">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs uppercase tracking-wider font-bold bg-red-600 text-white shadow-md border border-white/20 cursor-not-allowed flex items-center gap-2"
            >
              Agotado
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading || isPending}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs uppercase tracking-wider font-medium bg-brand hover:bg-brand-dark text-white shadow-md border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 cursor-pointer pointer-events-auto"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Agregar al Carrito
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Información del Producto Centrada al Pie estilo Krafti */}
      <Link
        href={`/products/${productSlug}`}
        className="pb-8 sm:pb-10 px-6 text-center flex flex-col items-center justify-center gap-1.5 z-10 focus:outline-none"
      >
        <h3
          className={`font-serif uppercase tracking-[0.25em] text-[#9A6038] dark:text-[#E2AB80] transition-colors duration-300 group-hover:text-brand font-medium leading-snug ${
            isHero ? 'text-base sm:text-lg md:text-xl' : 'text-xs sm:text-sm'
          }`}
        >
          {title}
        </h3>

        <span className="text-[11px] font-light tracking-wide text-neutral-500 dark:text-neutral-400">
          {categoryTitle || 'Joyería Artesanal'}
        </span>

        {typeof price === 'number' && (
          <span
            className={`font-serif text-[#9A6038] dark:text-amber-200/90 font-light tracking-wider mt-0.5 ${
              isHero ? 'text-base' : 'text-xs sm:text-sm'
            }`}
          >
            <Price amount={price} currencyCode="COP" />
          </span>
        )}
      </Link>
    </div>
  )
}
