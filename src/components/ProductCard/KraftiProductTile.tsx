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

// Dos únicos colores de fondo estrictamente intercalados en damero 2D
const BG_ARENA = 'bg-[#FAF5ED] dark:bg-zinc-900/60'
const BG_BLANCO = 'bg-[#FFFFFF] dark:bg-zinc-900/20'

const getKraftiBg = (index: number, isHero: boolean): string => {
  if (isHero) return BG_ARENA
  if (index === 1) return BG_BLANCO // Fila 1, Col 3
  if (index === 2) return BG_ARENA  // Fila 1, Col 4
  if (index === 3) return BG_ARENA  // Fila 2, Col 3
  if (index === 4) return BG_BLANCO // Fila 2, Col 4

  // Damero continuo 4 columnas para index >= 5
  const rel = index - 5
  const row = Math.floor(rel / 4)
  const col = rel % 4
  const isArena = (row + col) % 2 === 0
  return isArena ? BG_ARENA : BG_BLANCO
}

const extractShortDescription = (desc: any, max = 80): string => {
  if (!desc) return ''
  if (typeof desc === 'string') {
    const clean = desc.replace(/<[^>]*>/g, '').trim()
    return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
  }
  if (typeof desc === 'object' && desc.root?.children) {
    try {
      const extractText = (node: any): string => {
        if (!node) return ''
        if (node.text) return node.text
        if (Array.isArray(node.children)) {
          return node.children.map(extractText).join(' ')
        }
        return ''
      }
      const text = extractText(desc.root).replace(/\s+/g, ' ').trim()
      return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
    } catch {
      return ''
    }
  }
  return ''
}

export const KraftiProductTile: React.FC<Props> = ({ product, index, isHero = false }) => {
  const { addItem, isLoading } = useCart()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = React.useState(false)

  const { gallery, priceInCOP, title, featured, inventory, description } = product

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
  const bgClass = getKraftiBg(index, isHero)
  const shortDescription = extractShortDescription(description)

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
          ? 'col-span-1 md:col-span-2 row-span-1 md:row-span-2'
          : 'col-span-1 row-span-1'
      }`}
    >
      {/* Badges superiores (Destacado / Agotado) sutiles y elegantes */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
        {featured ? (
          <span className="inline-flex items-center gap-1 bg-brand text-white text-[9px] uppercase font-medium tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            Destacado
          </span>
        ) : (
          <span />
        )}

        {isOutOfStock && (
          <span className="bg-neutral-900/85 text-white text-[9px] uppercase font-medium tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
            Agotado
          </span>
        )}
      </div>

      {/* Contenedor de la Imagen: amplio, nítido y de alta visibilidad */}
      <div className={`relative w-full flex items-center justify-center p-4 sm:p-6 ${
        isHero ? 'h-[380px] sm:h-[460px]' : 'h-[250px] sm:h-[290px]'
      }`}>
        <Link
          href={`/products/${productSlug}`}
          className="relative w-full h-full flex items-center justify-center z-10 focus:outline-none"
        >
          {image ? (
            <Media
              fill
              imgClassName="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-105 drop-shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
              resource={image}
              priority={index === 0}
            />
          ) : (
            <div className="flex aspect-square w-24 items-center justify-center rounded-full bg-background/40 text-muted-foreground/30 text-3xl font-serif">
              ✦
            </div>
          )}
        </Link>

        {/* Botón flotante interactivo al hacer hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[1px] z-30 pointer-events-none group-hover:pointer-events-auto">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] uppercase tracking-wider font-medium bg-neutral-900/90 text-white shadow-md border border-white/20 cursor-not-allowed flex items-center gap-1.5"
            >
              Agotado
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading || isPending}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] uppercase tracking-wider font-medium bg-brand hover:bg-brand-dark text-white shadow-md border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 cursor-pointer pointer-events-auto"
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
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
        className="pb-6 sm:pb-7 px-5 sm:px-6 text-center flex flex-col items-center justify-center gap-1.5 z-10 focus:outline-none"
      >
        <h3
          className={`font-serif uppercase tracking-[0.2em] text-[#8B5A2B] dark:text-[#E2AB80] transition-colors duration-300 group-hover:text-brand font-medium leading-snug line-clamp-1 ${
            isHero ? 'text-base sm:text-lg md:text-xl' : 'text-xs sm:text-sm'
          }`}
        >
          {title}
        </h3>

        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
          {categoryTitle || 'Joyería en Mostacilla'}
        </span>

        {shortDescription ? (
          <p className="text-xs font-light text-neutral-600 dark:text-neutral-300 line-clamp-2 max-w-[260px] mx-auto mt-0.5 leading-relaxed">
            {shortDescription}
          </p>
        ) : null}

        {typeof price === 'number' && (
          <span
            className={`font-serif text-[#8B5A2B] dark:text-amber-200/90 font-normal tracking-wider mt-1 ${
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
