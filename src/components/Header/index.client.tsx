'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense, useEffect, useRef, useState } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { ChevronDown, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'

interface CategoryItem {
  id: number | string
  title: string
  slug: string
}

type Props = {
  header: Header
  categories?: CategoryItem[]
}

export function HeaderClient({ header, categories = [] }: Props) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isCatalogActive = pathname.startsWith('/shop') || pathname.startsWith('/products')

  return (
    <header className="relative z-30 bg-white">
      <nav className="flex items-center justify-between max-w-[1300px] mx-auto px-6 lg:px-8 h-[72px]">
        {/* Logo Nenúfar */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoIcon className="w-7 h-7 text-brand transition-transform duration-300 group-hover:scale-105" />
          <span className="font-serif text-2xl tracking-wide text-foreground group-hover:text-brand transition-colors">
            Nenúfar
          </span>
        </Link>

        {/* Menú no visible al cargar - solo hamburger y carrito */}
        <div className="flex items-center gap-3">
          <div className="flex">
            <Suspense fallback={null}>
              <MobileMenu menu={header.navItems} categories={categories} />
            </Suspense>
          </div>
          <Suspense fallback={<OpenCartButton />}>
            <Cart />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
