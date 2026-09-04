'use client'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { LogoIcon } from '@/components/icons/logo'
import type { Header } from '@/payload-types'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

import { MobileMenu } from './MobileMenu'

type CategoryItem = { id: number | string; title: string; slug: string }

type Props = {
  header: Header
  categories?: CategoryItem[]
}

export function HeaderClient({ header, categories = [] }: Props) {
  const pathname = usePathname()
  const isHomePage = pathname === '/' || pathname === ''
  const [catOpen, setCatOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayCategories = categories || []

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#')) {
      const hash = href.substring(href.indexOf('#'))
      if (pathname === '/' || pathname === '') {
        e.preventDefault()
        const el = document.querySelector(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          window.history.pushState(null, '', hash)
        }
      }
    }
  }

  // Header styling state
  const isTransparent = isHomePage && !isScrolled
  const isPurple = isScrolled

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 border-none ${
        isPurple
          ? 'bg-[#6A1B9A]/95 dark:bg-[#4A106E]/95 backdrop-blur-md text-white shadow-[0_8px_30px_rgba(106,27,154,0.35)]'
          : isTransparent
          ? 'bg-transparent text-white'
          : 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md text-neutral-800 dark:text-neutral-100 shadow-sm'
      }`}
    >
        <nav className="flex items-center justify-between max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] sm:h-[78px]">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <LogoIcon
              className={`w-8 h-8 transition-transform duration-300 group-hover:scale-105 ${
                isPurple || isTransparent ? 'text-white' : 'text-brand'
              }`}
            />
            <span
              className={`font-serif text-2xl sm:text-3xl tracking-wide font-medium transition-colors ${
                isPurple || isTransparent
                  ? 'text-white group-hover:text-purple-100'
                  : 'text-foreground group-hover:text-brand'
              }`}
            >
              Nenúfar
            </span>
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center gap-7 lg:gap-8">
            {/* Catálogo con Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 ${
                  isPurple || isTransparent
                    ? 'text-white/90 hover:text-white'
                    : pathname?.startsWith('/shop')
                    ? 'text-brand font-semibold'
                    : 'text-neutral-700 hover:text-brand'
                }`}
              >
                Catálogo
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    catOpen ? 'rotate-180' : ''
                  } ${isPurple || isTransparent ? 'text-white/80' : 'text-neutral-400'}`}
                />
              </Link>

              {/* Dropdown flotante editorial */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 transition-all duration-200 ${
                  catOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-neutral-100 p-3 overflow-hidden text-neutral-800">
                  <div className="text-[10px] font-semibold text-[#8B5A2B] uppercase tracking-[0.2em] px-3 py-1.5 border-b border-neutral-100 mb-1">
                    Categorías
                  </div>
                  <div className="space-y-0.5">
                    {displayCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setCatOpen(false)}
                        className="block px-3 py-2 text-xs text-neutral-700 hover:text-brand hover:bg-neutral-50 rounded-lg transition-colors font-sans"
                      >
                        {cat.title}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-neutral-100 mt-2 pt-2">
                    <Link
                      href="/shop"
                      onClick={() => setCatOpen(false)}
                      className="block px-3 py-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                    >
                      Explorar todo el catálogo →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Tradición & Delicadeza (Sección en Landing) */}
            <Link
              href="/#tradicion"
              onClick={(e) => handleAnchorClick(e, '/#tradicion')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${
                isPurple || isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-neutral-700 hover:text-brand'
              }`}
            >
              Tradición
            </Link>

            {/* Galería (Sección en Landing) */}
            <Link
              href="/#galeria"
              onClick={(e) => handleAnchorClick(e, '/#galeria')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${
                isPurple || isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-neutral-700 hover:text-brand'
              }`}
            >
              Galería
            </Link>

            {/* Nuestra Historia (Sección en Landing) */}
            <Link
              href="/#historia"
              onClick={(e) => handleAnchorClick(e, '/#historia')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${
                isPurple || isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-neutral-700 hover:text-brand'
              }`}
            >
              Historia
            </Link>

            {/* Talleres & Ferias (Sección en Landing) */}
            <Link
              href="/#talleres"
              onClick={(e) => handleAnchorClick(e, '/#talleres')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${
                isPurple || isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-neutral-700 hover:text-brand'
              }`}
            >
              Talleres & Ferias
            </Link>

            {/* Contacto (Sección en Landing) */}
            <Link
              href="/#contacto"
              onClick={(e) => handleAnchorClick(e, '/#contacto')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${
                isPurple || isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-neutral-700 hover:text-brand'
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* Right side actions: Cart + Mobile menu */}
          <div className="flex items-center gap-3">
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>

            <div className="md:hidden flex items-center">
              <Suspense fallback={null}>
                <MobileMenu menu={header.navItems} categories={displayCategories} />
              </Suspense>
            </div>
          </div>
        </nav>
    </header>
  )
}
