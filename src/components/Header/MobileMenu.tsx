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

export function MobileMenu({ menu }: Props) {
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

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-foreground hover:border-brand hover:text-brand transition-colors">
        <MenuIcon className="h-4 w-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>Nenúfar</SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2" key={item.id}>
                  <CMSLink {...item.link} appearance="link" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">Mi cuenta</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders">Mis pedidos</Link>
              </li>
              <li>
                <Link href="/account/addresses">Direcciones</Link>
              </li>
              <li>
                <Link href="/account">Mi cuenta</Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/logout">Cerrar sesión</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">Mi cuenta</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">o</span>
              <Button asChild className="w-full sm:flex-1">
                <Link href="/create-account">Crear cuenta</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
