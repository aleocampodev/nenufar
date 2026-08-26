'use client'

import { Price } from '@/components/Price'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Button } from '@/components/ui/button'
import { Product } from '@/payload-types'

export function CartModal() {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Mi Carrito</SheetTitle>

          <SheetDescription>Administra tu carrito aquí, agrega productos para ver el total.</SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">Tu carrito está vacío.</p>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4 divide-y divide-border/40">
                {cart?.items?.map((item, i) => {
                  if (!item) return null

                  const rawProduct = item.product
                  const product = typeof rawProduct === 'object' && rawProduct !== null ? (rawProduct as Product) : null
                  const productId = product?.id || (typeof rawProduct === 'number' || typeof rawProduct === 'string' ? rawProduct : i)
                  const productTitle = product?.title || `Joya artesanal #${productId}`
                  const productSlug = product?.slug || String(productId)
                  const variant = item.variant

                  const metaImage =
                    product?.meta?.image && typeof product.meta.image === 'object'
                      ? product.meta.image
                      : undefined

                  const firstGalleryImage =
                    product?.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
                      ? (product.gallery[0].image as any)
                      : undefined

                  let imageObj = firstGalleryImage || metaImage
                  let price = product?.priceInCOP

                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  if (isVariant) {
                    price = (variant as any)?.priceInCOP

                    const imageVariant = product?.gallery?.find((gItem) => {
                      if (!gItem.variantOption) return false
                      const variantOptionID =
                        typeof gItem.variantOption === 'object'
                          ? gItem.variantOption.id
                          : gItem.variantOption

                      const hasMatch = (variant as any)?.options?.some((option: any) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })

                      return hasMatch
                    })

                    if (imageVariant && typeof imageVariant.image === 'object') {
                      imageObj = imageVariant.image as any
                    }
                  }

                  const imageUrl = imageObj?.url || null

                  return (
                    <li className="flex w-full flex-col py-3" key={item.id || i}>
                      <div className="relative flex w-full items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Miniatura de la Joya */}
                          <Link
                            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30"
                            href={`/products/${productSlug}`}
                          >
                            {imageUrl ? (
                              <Image
                                alt={imageObj?.alt || productTitle}
                                className="h-full w-full object-cover"
                                height={80}
                                src={imageUrl}
                                width={80}
                                unoptimized
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 text-xl font-serif">
                                ✦
                              </div>
                            )}
                          </Link>

                          {/* Título y detalles */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <Link
                              href={`/products/${productSlug}`}
                              className="font-serif text-sm font-medium leading-tight text-foreground hover:text-brand transition-colors truncate"
                            >
                              {productTitle}
                            </Link>

                            {isVariant && variant ? (
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                {(variant as any).options
                                  ?.map((option: any) => (typeof option === 'object' ? option.label : null))
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            ) : (
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                                Joya en mostacilla
                              </span>
                            )}

                            {typeof price === 'number' && (
                              <div className="mt-1 font-mono text-xs text-foreground/80 font-medium">
                                <Price amount={price} currencyCode="COP" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controles de Cantidad y Eliminar */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex h-8 items-center rounded-lg border border-border/80 bg-background">
                            <EditItemQuantityButton item={item} type="minus" />
                            <span className="w-6 text-center text-xs font-mono font-medium">
                              {item.quantity}
                            </span>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>

                          <DeleteItemButton item={item} />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="px-4">
                <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {typeof cart?.subtotal === 'number' && (
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Total</p>
                      <Price
                        amount={cart?.subtotal}
                        className="text-right text-base text-black dark:text-white"
                      />
                    </div>
                  )}

                  <Button asChild>
                    <Link className="w-full" href="/pedidos/enviar">
                      Confirmar pedido
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
