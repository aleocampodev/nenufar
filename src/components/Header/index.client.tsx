'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
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
    <header className="relative z-30 bg-background border-b border-border/40 transition-colors">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Menú Móvil */}
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={header.navItems} categories={categories} />
          </Suspense>
        </div>

        {/* Logo Nenúfar & Navegación */}
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2.5 group" href="/">
            <LogoIcon className="w-7 h-7 text-brand transition-transform duration-300 group-hover:scale-105" />
            <span className="font-serif text-2xl tracking-wide text-foreground group-hover:text-brand transition-colors">
              Nenúfar
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.2em] font-medium font-sans">
            {/* Dropdown Catálogo */}
            <li className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-label="Catálogo"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
                className={cn(
                  'flex items-center gap-1.5 py-1 transition-colors hover:text-brand relative cursor-pointer',
                  isCatalogActive ? 'text-brand font-semibold' : 'text-muted-foreground',
                )}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span>Catálogo</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200 text-brand/80',
                    dropdownOpen && 'rotate-180',
                  )}
                />
                {isCatalogActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full" />
                )}
              </button>

              {/* Menú Desplegable de Categorías */}
              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-card border border-brand/20 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <Link
                    href="/shop"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-xs uppercase tracking-wider text-foreground hover:bg-brand/10 hover:text-brand transition-colors font-medium"
                  >
                    <span>✦ Ver todo el catálogo</span>
                  </Link>

                  <Link
                    href="/shop?featured=true"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider text-foreground hover:bg-brand/10 hover:text-brand transition-colors font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                    <span>Joyas destacadas</span>
                  </Link>

                  {categories.length > 0 && (
                    <>
                      <div className="my-1.5 border-t border-border/40" />
                      <div className="px-4 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-semibold">
                        Categorías
                      </div>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.slug}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors"
                        >
                          <span>{cat.title}</span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </li>
          </ul>
        </div>

        {/* Acciones Derecha: Switcher + Carrito */}
        <div className="flex items-center gap-3.5">
          <ThemeSelector />
          <Suspense fallback={<OpenCartButton />}>
            <Cart />
          </Suspense>
        </div>
      </nav>

      {/* Separador Zigzag Sutil y Elegante en el Menú de Navegación */}
      <div className="absolute -bottom-[5px] left-0 right-0 h-[6px] md:h-[8px] overflow-hidden leading-none z-20 pointer-events-none text-brand/60 dark:text-brand/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full fill-none stroke-current"
          viewBox="0 0 2560 15.292"
          preserveAspectRatio="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="0,7 16.695,13.999 34.905,7 53.999,13.999 71.704,7 89.946,13.999 107.998,7 126.745,13.999 144.86,7 163.102,13.999 181.123,7 199.964,13.843 218.048,7 236.384,13.999 254.783,7 273.656,13.999 291.835,7 310.076,13.999 328.287,7 346.812,13.999 365.085,7 383.201,13.999 400.938,7 420.41,13.999 438.21,7 456.388,13.999 474.851,7 493.25,13.999 510.956,7 530.175,13.999 548.322,7 566.469,13.999 584.301,7 603.047,13.999 620.973,7 639.436,13.999 657.898,7 676.487,13.999 694.76,7 713.002,13.999 731.118,7 749.643,13.999 767.917,7 786.158,13.999 804.147,7 822.515,13.999 841.167,7 859.314,13.999 878.061,7 896.681,13.999 914.386,7 932.533,13.999 951.216,7 970.026,13.999 988.079,7 1006.194,13.999 1024.436,7 1043.15,13.999 1061.329,7 1079.476,13.999 1097.623,7 1115.77,13.999 1134.043,7 1152.758,13.999 1170.306,7 1189.431,13.999 1207.672,7 1225.819,13.999 1244.503,7 1261.798,13.999 1279.913,7 1298.565,13.843 1316.712,7 1334.985,13.999 1353.101,7 1371.753,13.999 1389.868,7 1408.299,13.999 1425.783,7 1444.94,13.999 1463.276,7 1481.329,13.999 1499.57,7 1518.885,13.999 1537.032,7 1555.147,13.999 1573.326,7 1591.946,13.999 1609.651,7 1628.24,13.999 1645.883,7 1664.724,13.999 1682.808,7 1701.08,13.999 1719.67,7 1738.006,13.999 1755.963,7 1775.152,13.999 1792.825,7 1811.099,13.999 1828.867,7 1847.961,13.999 1865.949,7 1884.317,13.999 1902.938,7 1921.021,13.999 1939.043,7 1955.738,13.999 1973.947,7 1993.041,13.999 2010.746,7 2028.988,13.999 2047.041,7 2065.787,13.999 2083.902,7 2102.145,13.999 2120.165,7 2139.006,13.843 2157.09,7 2175.427,13.999 2193.826,7 2212.699,13.999 2230.877,7 2249.119,13.999 2267.329,7 2285.854,13.999 2304.128,7 2322.243,13.999 2339.98,7 2359.452,13.999 2377.252,7 2395.431,13.999 2413.894,7 2432.293,13.999 2449.998,7 2469.218,13.999 2487.365,7 2505.512,13.999 2523.344,7 2542.09,13.999 2560,7.006" />
        </svg>
      </div>
    </header>
  )
}
