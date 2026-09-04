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
  // Header styling state:
  // In the home page at the top, it is transparent over the hero image.
  const isTransparent = isHomePage && !isScrolled

  const linkBaseClass = isTransparent
    ? 'text-[#1A0E2E]/90 hover:text-[#E91E8C]'
    : 'text-white/90 hover:text-[#FF4FA3]'

  const linkActiveClass = isTransparent
    ? 'text-[#E91E8C] font-semibold'
    : 'text-[#FF4FA3] font-semibold'

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isTransparent
          ? 'bg-[#FAF8F5]/90 dark:bg-[#120A1E]/80 backdrop-blur-md text-[#1A0E2E] dark:text-white border-b border-[#EADCCF]/60'
          : 'bg-[#3D1A5B]/95 dark:bg-[#2E1346]/95 backdrop-blur-md text-white shadow-[0_8px_30px_rgba(61,26,91,0.35)] border-b border-[#4D2472]/40'
      }`}
    >
        <nav className="flex items-center justify-between max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] sm:h-[78px]">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <LogoIcon
              className={`w-8 h-8 transition-transform duration-300 group-hover:scale-105 ${
                isTransparent ? 'text-[#3D1A5B] dark:text-white' : 'text-white'
              }`}
            />
            <span
              className={`font-serif text-2xl sm:text-3xl tracking-wide font-medium transition-colors ${
                isTransparent
                  ? 'text-[#1A0E2E] dark:text-white group-hover:text-[#E91E8C]'
                  : 'text-white group-hover:text-[#FF4FA3]'
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
                  pathname?.startsWith('/shop') ? linkActiveClass : linkBaseClass
                }`}
              >
                Catálogo
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    catOpen ? 'rotate-180' : ''
                  } ${isTransparent ? 'text-[#1A0E2E]/70' : 'text-white/80'}`}
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
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${linkBaseClass}`}
            >
              Tradición
            </Link>

            {/* Galería (Sección en Landing) */}
            <Link
              href="/#galeria"
              onClick={(e) => handleAnchorClick(e, '/#galeria')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${linkBaseClass}`}
            >
              Galería
            </Link>

            {/* Nuestra Historia (Sección en Landing) */}
            <Link
              href="/#historia"
              onClick={(e) => handleAnchorClick(e, '/#historia')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${linkBaseClass}`}
            >
              Historia
            </Link>

            {/* Talleres & Ferias (Sección en Landing) */}
            <Link
              href="/#talleres"
              onClick={(e) => handleAnchorClick(e, '/#talleres')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${linkBaseClass}`}
            >
              Talleres & Ferias
            </Link>

            {/* Contacto (Sección en Landing) */}
            <Link
              href="/#contacto"
              onClick={(e) => handleAnchorClick(e, '/#contacto')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${linkBaseClass}`}
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
