'use client'

import React, { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Search } from '@/components/Search'

interface CategoryOption {
  id: number | string
  title: string
  slug?: string
}

interface ShopFilterBarProps {
  categories: CategoryOption[]
  totalProducts: number
  activeCategory?: string
  activeSort?: string
  activeSearch?: string
  activeFeatured?: boolean
}

export function ShopFilterBar({
  categories,
  totalProducts,
  activeCategory,
  activeSort = '-createdAt',
  activeSearch = '',
  activeFeatured = false,
}: ShopFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page') // Reset pagination on filter change

    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    }

    const qs = params.toString()
    startTransition(() => {
      router.push(`/shop${qs ? `?${qs}` : ''}`)
    })
  }

  return (
    <div className="w-full mb-4">
      {/* Barra Principal de Controles sin rayita divisoria */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        
        {/* Pills de Categorías Rápidas con Paleta de Marca Nenúfar */}
        <nav
          aria-label="Filtros de categoría del catálogo"
          className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none"
        >
          <button
            aria-pressed={!activeCategory && !activeFeatured}
            onClick={() => updateFilters({ category: null, featured: null })}
            className={`px-5 py-2 min-h-[38px] rounded-full text-xs uppercase tracking-wider font-medium active:scale-[0.96] transition-[transform,background-color,border-color,color,box-shadow] whitespace-nowrap cursor-pointer ${
              !activeCategory && !activeFeatured
                ? 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark scale-[1.02]'
                : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200/90 dark:border-zinc-800 hover:border-brand/50 hover:text-brand shadow-sm'
            }`}
          >
            Todos
          </button>

          <button
            aria-pressed={activeFeatured}
            onClick={() =>
              updateFilters({
                featured: activeFeatured ? null : 'true',
                category: null,
              })
            }
            className={`px-5 py-2 min-h-[38px] rounded-full text-xs uppercase tracking-wider font-medium active:scale-[0.96] transition-[transform,background-color,border-color,color,box-shadow] whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeFeatured
                ? 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark scale-[1.02]'
                : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200/90 dark:border-zinc-800 hover:border-brand/50 hover:text-brand shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            Destacados
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === (cat.slug || String(cat.id))
            return (
              <button
                key={cat.id}
                aria-pressed={isSelected}
                onClick={() =>
                  updateFilters({
                    category: isSelected ? null : (cat.slug || String(cat.id)),
                    featured: null,
                  })
                }
                className={`px-5 py-2 min-h-[38px] rounded-full text-xs uppercase tracking-wider font-medium active:scale-[0.96] transition-[transform,background-color,border-color,color,box-shadow] whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark scale-[1.02]'
                    : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200/90 dark:border-zinc-800 hover:border-brand/50 hover:text-brand shadow-sm'
                }`}
              >
                {cat.title}
              </button>
            )
          })}
        </nav>

        {/* Buscador y selector de orden con estilo Nenúfar */}
        <div className="flex items-center justify-end w-full md:w-auto gap-3 self-end md:self-auto">
          <Search className="min-w-0 flex-1 md:w-52 md:flex-none" />
          {/* Ordenar por */}
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              aria-label="Ordenar joyas por"
              className="appearance-none bg-white dark:bg-zinc-900 border border-neutral-200/90 dark:border-zinc-800 rounded-full px-4 py-2 pr-8 text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-200 font-medium hover:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-sm cursor-pointer"
            >
              <option value="-createdAt" className="bg-background text-foreground">Más Recientes</option>
              <option value="priceInCOP" className="bg-background text-foreground">Precio: Menor a Mayor</option>
              <option value="-priceInCOP" className="bg-background text-foreground">Precio: Mayor a Menor</option>
              <option value="title" className="bg-background text-foreground">Nombre: A-Z</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Conteo de resultados */}
      <p aria-live="polite" className="pt-1 text-right text-[11px] uppercase tracking-widest text-neutral-400">
        {totalProducts === 1 ? '1 joya' : `${totalProducts} joyas`}
      </p>

      {/* Indicador de carga sutil */}
      {isPending && (
        <div className="h-0.5 w-full bg-brand/20 overflow-hidden my-2">
          <div className="h-full bg-brand animate-pulse" />
        </div>
      )}
    </div>
  )
}
