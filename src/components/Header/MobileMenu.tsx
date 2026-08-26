'use client'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface CategoryItem {
  id: number | string
  title: string
  slug: string
}

interface Props {
  menu: Header['navItems']
  categories?: CategoryItem[]
}

export function MobileMenu({ menu, categories = [] }: Props) {
  const { user } = useAuth()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const closeMobileMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-foreground hover:border-brand hover:text-brand transition-colors">
        <MenuIcon className="h-4 w-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-5 w-[300px] sm:w-[360px] overflow-y-auto">
        <SheetHeader className="px-0 pt-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <SheetTitle className="font-serif text-2xl text-foreground text-left">Nenúfar</SheetTitle>
        </SheetHeader>

        <div className="py-5 space-y-4">
          <ul className="flex flex-col space-y-2">

            {/* Catálogo con categorías */}
            <li className="border-y border-neutral-100 py-2">
              <div className="flex items-center justify-between">
                <Link
                  href="/shop"
                  onClick={closeMobileMenu}
                  className="text-sm font-medium uppercase tracking-wider text-neutral-800 hover:text-brand transition-colors"
                >
                  Catálogo
                </Link>
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="p-1 text-neutral-500 hover:text-brand"
                  aria-label="Alternar categorías"
                >
                  <span className="text-xs">{categoriesExpanded ? '▲' : '▼'}</span>
                </button>
              </div>

              {categoriesExpanded && categories && categories.length > 0 && (
                <ul className="pl-3 mt-2 space-y-1.5 border-l-2 border-brand/20">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        onClick={closeMobileMenu}
                        className="block py-1 text-xs text-neutral-600 hover:text-brand transition-colors"
                      >
                        {cat.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/shop"
                      onClick={closeMobileMenu}
                      className="block py-1 text-xs font-semibold text-brand hover:underline"
                    >
                      Ver todo el catálogo →
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/#tradicion"
                onClick={closeMobileMenu}
                className="block py-2 text-sm font-medium uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-brand transition-colors"
              >
                Tradición & Delicadeza
              </Link>
            </li>

            <li>
              <Link
                href="/#historia"
                onClick={closeMobileMenu}
                className="block py-2 text-sm font-medium uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-brand transition-colors"
              >
                Nuestra Historia
              </Link>
            </li>

            <li>
              <Link
                href="/#talleres"
                onClick={closeMobileMenu}
                className="block py-2 text-sm font-medium uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-brand transition-colors"
              >
                Talleres & Ferias
              </Link>
            </li>

            <li>
              <Link
                href="/#contacto"
                onClick={closeMobileMenu}
                className="block py-2 text-sm font-medium uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-brand transition-colors"
              >
                Contacto & Pedidos
              </Link>
            </li>
          </ul>
        </div>

        {user ? (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Mi cuenta</h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/orders" onClick={closeMobileMenu} className="hover:text-brand">Mis pedidos</Link>
              </li>
              <li>
                <Link href="/account/addresses" onClick={closeMobileMenu} className="hover:text-brand">Direcciones</Link>
              </li>
              <li>
                <Link href="/account" onClick={closeMobileMenu} className="hover:text-brand">Mi perfil</Link>
              </li>
              <li className="mt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/logout" onClick={closeMobileMenu}>Cerrar sesión</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Mi cuenta</h2>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full" variant="outline" size="sm">
                <Link href="/login" onClick={closeMobileMenu}>Iniciar sesión</Link>
              </Button>
              <Button asChild className="w-full bg-brand hover:bg-brand-dark" size="sm">
                <Link href="/create-account" onClick={closeMobileMenu}>Crear cuenta</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
