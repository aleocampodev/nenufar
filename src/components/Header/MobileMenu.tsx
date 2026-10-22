'use client'

import type { Header } from '@/payload-types'
import { ChevronDown, MessageCircle, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

interface CategoryItem {
  id: number | string
  title: string
  slug: string
}

interface Props {
  menu?: Header['navItems']
  categories?: CategoryItem[]
}

export function MobileMenu({ categories = [] }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => {
    setIsOpen(false)
    setCategoriesExpanded(false)
  }

  // Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Cerrar si se redimensiona a pantalla de escritorio
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMenu()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cerrar al cambiar de ruta
  useEffect(() => {
    closeMenu()
  }, [pathname, searchParams])

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    closeMenu()
    if (href.includes('#')) {
      const hash = href.substring(href.indexOf('#'))
      if (pathname === '/' || pathname === '') {
        e.preventDefault()
        setTimeout(() => {
          const el = document.querySelector(hash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            window.history.pushState(null, '', hash)
          }
        }, 120)
      }
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón activador del Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-current text-inherit opacity-90 hover:opacity-100 hover:bg-white/15 transition-all cursor-pointer active:scale-95"
      >
        {isOpen ? <X className="h-5 w-5 text-inherit" /> : <Menu className="h-5 w-5 text-inherit" />}
      </button>

      {/* Menú Dropdown Flotante Editorial */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] w-[min(90vw,320px)] rounded-2xl bg-[#3B032F]/98 dark:bg-[#1A0E2E]/98 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-white p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/#historia"
              onClick={(e) => handleAnchorClick(e, '/#historia')}
              className="flex items-center px-3 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Mi Historia
            </Link>

            <Link
              href="/#testimonios"
              onClick={(e) => handleAnchorClick(e, '/#testimonios')}
              className="flex items-center px-3 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Testimonios
            </Link>

            <Link
              href="/#talleres"
              onClick={(e) => handleAnchorClick(e, '/#talleres')}
              className="flex items-center px-3 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Talleres & Ferias
            </Link>

            <Link
              href="/galeria"
              onClick={closeMenu}
              className={`flex items-center px-3 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                pathname?.startsWith('/galeria')
                  ? 'text-[#FF4FA3] bg-white/10 font-semibold'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Galería
            </Link>

            {/* Catálogo con subcategorías desplegables */}
            <div className="border-t border-b border-white/10 my-1 py-1">
              <div className="flex items-center justify-between px-3 py-2">
                <Link
                  href="/shop"
                  onClick={closeMenu}
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                    pathname?.startsWith('/shop')
                      ? 'text-[#FF4FA3] font-semibold'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Catálogo
                </Link>
                {categories && categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCategoriesExpanded((prev) => !prev)}
                    className="p-1 text-white/60 hover:text-white rounded-md transition-colors cursor-pointer"
                    aria-label="Alternar categorías"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        categoriesExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {categoriesExpanded && categories && categories.length > 0 && (
                <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#E91E8C]/40 ml-3 mb-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?category=${cat.slug}`}
                      onClick={closeMenu}
                      className="block px-2 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-sans"
                    >
                      {cat.title}
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className="block px-2 py-1.5 text-xs font-semibold text-[#FF4FA3] hover:underline"
                  >
                    Ver todas las piezas →
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/#contacto"
              onClick={(e) => handleAnchorClick(e, '/#contacto')}
              className="flex items-center px-3 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Contáctame
            </Link>
          </nav>

          {/* Contacto directo con Shirley (Zero-Stripe, cierre humano por WhatsApp) */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <a
              href="https://wa.me/?text=Hola%20Shirley%2C%20quisiera%20consultar%20sobre%20tus%20joyas%20artesanales%20en%20N%C3%A9nufar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[#E91E8C] hover:bg-[#AD1457] text-white text-xs uppercase tracking-wider font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Escribir a Shirley</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
