import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

interface NenufarPaginationProps {
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  buildPageUrl?: (page: number) => string
  onPageChange?: (page: number) => void
  categoryLabel?: string
  itemCountLabel?: string
  showAlways?: boolean
  className?: string
}

export function NenufarPagination({
  page,
  totalPages,
  totalDocs,
  limit,
  buildPageUrl,
  onPageChange,
  categoryLabel = 'Colección Artesanal',
  itemCountLabel = 'joyas',
  showAlways = false,
  className = 'w-full max-w-4xl mx-auto mt-20 px-4 flex flex-col items-center gap-6 select-none',
}: NenufarPaginationProps) {
  if (totalPages <= 1 && !showAlways) return null

  const startDoc = totalDocs === 0 ? 0 : Math.min((page - 1) * limit + 1, totalDocs)
  const endDoc = Math.min(page * limit, totalDocs)
  const progressPercent = totalDocs > 0 ? Math.round((endDoc / totalDocs) * 100) : 100

  // Genera el rango inteligente de páginas (ej: 1, 2, 3, '...', 10)
  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={className}>
      {/* Barra de Progreso y Contador de Elementos */}
      <div className="w-full max-w-md flex flex-col items-center gap-2">
        <div className="flex items-center justify-between w-full text-xs uppercase tracking-wider text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5 text-brand">
            <Sparkles className="w-3.5 h-3.5" />
            {categoryLabel}
          </span>
          <span>
            {startDoc}–{endDoc} de <strong className="text-foreground">{totalDocs}</strong> {itemCountLabel}
          </span>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controles de Navegación de Páginas Innovadores */}
      <nav
        className="flex items-center gap-1.5 p-1.5 bg-muted/30 dark:bg-zinc-900/60 border border-brand/20 rounded-full shadow-sm backdrop-blur-sm"
        aria-label="Paginación"
      >
        {/* Botón Anterior */}
        {page > 1 ? (
          onPageChange ? (
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-brand hover:bg-brand hover:text-white rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          ) : (
            <Link
              href={buildPageUrl ? buildPageUrl(page - 1) : '#'}
              className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-brand hover:bg-brand hover:text-white rounded-full transition-all duration-200"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Link>
          )
        ) : (
          <span className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground/40 rounded-full cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </span>
        )}

        {/* Números de Página Interactivos */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 text-center text-xs text-muted-foreground font-mono"
                >
                  …
                </span>
              )
            }

            const isCurrent = p === page

            if (isCurrent) {
              return (
                <span
                  key={p}
                  aria-current="page"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-brand text-white text-xs font-bold font-mono shadow-sm scale-105 transition-transform"
                >
                  {p}
                </span>
              )
            }

            return onPageChange ? (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium font-mono text-muted-foreground hover:text-brand hover:bg-brand/10 transition-all duration-150 cursor-pointer"
                aria-label={`Ir a la página ${p}`}
              >
                {p}
              </button>
            ) : (
              <Link
                key={p}
                href={buildPageUrl ? buildPageUrl(p as number) : '#'}
                className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium font-mono text-muted-foreground hover:text-brand hover:bg-brand/10 transition-all duration-150"
                aria-label={`Ir a la página ${p}`}
              >
                {p}
              </Link>
            )
          })}
        </div>

        {/* Botón Siguiente */}
        {page < totalPages ? (
          onPageChange ? (
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-brand hover:bg-brand hover:text-white rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={buildPageUrl ? buildPageUrl(page + 1) : '#'}
              className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-brand hover:bg-brand hover:text-white rounded-full transition-all duration-200"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )
        ) : (
          <span className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground/40 rounded-full cursor-not-allowed">
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </nav>
    </div>
  )
}
