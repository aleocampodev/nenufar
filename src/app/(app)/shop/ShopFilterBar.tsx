'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, Search, Sparkles } from 'lucide-react'

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
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(activeSearch)

  const activeFiltersCount = [
    activeCategory,
    activeSearch,
    activeFeatured,
    activeSort && activeSort !== '-createdAt' ? activeSort : null,
  ].filter(Boolean).length

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchInput.trim() || null })
  }

  const handleClearAll = () => {
    setSearchInput('')
    startTransition(() => {
      router.push('/shop')
    })
  }

  return (
    <div className="w-full mb-4">
      {/* Barra Principal de Controles sin rayita divisoria */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        
        {/* Pills de Categorías Rápidas con Paleta de Marca Nenúfar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => updateFilters({ category: null, featured: null })}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap cursor-pointer ${
              !activeCategory && !activeFeatured
                ? 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark scale-[1.02]'
                : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200/90 dark:border-zinc-800 hover:border-brand/50 hover:text-brand shadow-sm'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() =>
              updateFilters({
                featured: activeFeatured ? null : 'true',
                category: null,
              })
            }
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
                onClick={() =>
                  updateFilters({
                    category: isSelected ? null : (cat.slug || String(cat.id)),
                    featured: null,
                  })
                }
                className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark scale-[1.02]'
                    : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200/90 dark:border-zinc-800 hover:border-brand/50 hover:text-brand shadow-sm'
                }`}
              >
                {cat.title}
              </button>
            )
          })}
        </div>

        {/* Botón Filtros y Selector de Orden con Estilo Nenúfar */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 self-end md:self-auto">
          {/* Botón Filtros */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium border transition-all flex items-center gap-2 cursor-pointer ${
              isOpen || activeFiltersCount > 0
                ? 'border-brand bg-brand text-white shadow-sm'
                : 'border-neutral-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand shadow-sm'
            }`}
            aria-expanded={isOpen}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-brand text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Ordenar por */}
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
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

      {/* Panel Desplegable de Filtros Adicionales */}
      {isOpen && (
        <div className="p-6 bg-muted/20 border border-border/60 rounded-xl my-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Buscador Integrado */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar joya o material..."
                className="w-full bg-background border border-border rounded-full pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    updateFilters({ q: null })
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Contador y Limpiar */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                {totalProducts} {totalProducts === 1 ? 'pieza disponible' : 'piezas disponibles'}
              </span>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-brand hover:text-brand-dark underline uppercase tracking-wider font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carga sutil */}
      {isPending && (
        <div className="h-0.5 w-full bg-brand/20 overflow-hidden my-2">
          <div className="h-full bg-brand animate-pulse" />
        </div>
      )}
    </div>
  )
}
