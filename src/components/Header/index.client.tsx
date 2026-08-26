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
    <header className="sticky top-0 z-30 bg-white">
      <nav className="flex items-center justify-between max-w-[1300px] mx-auto px-6 lg:px-8 h-[72px]">
        {/* Izquierda - HOME PAGES PORTFOLIO (Krafti) */}
        <ul className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] font-medium">
          <li>
            <Link href="/" className={cn('hover:text-[#8B5A2B] transition-colors', pathname === '/' ? 'text-[#8B5A2B] border-b border-[#8B5A2B] pb-1' : 'text-neutral-500')}>
              HOME
            </Link>
          </li>
          <li>
            <Link href="/sobre-nenufar" className="text-neutral-500 hover:text-[#8B5A2B] transition-colors">
              PAGES
            </Link>
          </li>
          <li>
            <Link href="/shop" className={cn('hover:text-[#8B5A2B] transition-colors', isCatalogActive ? 'text-[#8B5A2B] border-b border-[#8B5A2B] pb-1' : 'text-neutral-500')}>
              PORTFOLIO
            </Link>
          </li>
        </ul>

        {/* Centro - Logo Krafti */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group">
          <span className="font-serif text-[28px] tracking-wide text-[#4A0D2A] group-hover:text-[#8B5A2B] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
            Krafti
          </span>
          <span className="hidden lg:inline font-serif text-[28px] tracking-wide text-[#4A0D2A]">Nenúfar</span>
        </Link>

        {/* Móvil */}
        <div className="flex md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={header.navItems} categories={categories} />
          </Suspense>
        </div>

        {/* Derecha - BLOG SHOP LANDING + Carrito */}
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] font-medium">
            <li>
              <Link href="/blog" className="text-neutral-500 hover:text-[#8B5A2B] transition-colors">
                BLOG
              </Link>
            </li>
            <li>
              <Link href="/shop" className="text-neutral-500 hover:text-[#8B5A2B] transition-colors">
                SHOP
              </Link>
            </li>
            <li>
              <Link href="/eventos" className="text-neutral-500 hover:text-[#8B5A2B] transition-colors">
                LANDING
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-3">
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </header>
  )
}
