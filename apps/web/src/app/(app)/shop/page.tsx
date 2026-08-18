import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Busca productos en la tienda.',
  title: 'Tienda',
}

const PAGE_SIZE = 24

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(String(pageParam ?? '1'), 10) || 1)
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 2,
    limit: PAGE_SIZE,
    page,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInCOP: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(searchValue
          ? [{ or: [{ title: { like: searchValue } }, { description: { like: searchValue } }] }]
          : []),
        ...(category ? [{ categories: { contains: category } }] : []),
      ],
    },
  })

  const { docs, totalPages, hasPrevPage, hasNextPage } = products
  const resultsText = docs.length > 1 ? 'resultados' : 'resultado'

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('q', String(searchValue))
    if (sort) params.set('sort', String(sort))
    if (category) params.set('category', String(category))
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/shop${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="container py-12">
      {searchValue ? (
        <p className="mb-8 font-serif text-lg text-muted-foreground">
          {docs.length === 0
            ? 'No hay productos que coincidan con '
            : `Mostrando ${docs.length} ${resultsText} para `}
          <span className="text-foreground">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && docs.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">✦</div>
          <p className="font-serif text-xl text-muted-foreground">No se encontraron productos.</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Por favor intenta con otros filtros.
          </p>
        </div>
      )}

      {docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {docs.map((product, index) => (
            <div
              key={product.id}
              className="opacity-0 animate-in"
              style={{
                animationName: 'fadeInUp',
                animationDuration: '0.6s',
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards',
              }}
            >
              <ProductGridItem product={product} />
            </div>
          ))}
        </Grid>
      ) : null}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Paginación">
          {hasPrevPage && (
            <a
              href={buildPageUrl(page - 1)}
              className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition"
            >
              ← Anterior
            </a>
          )}
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {hasNextPage && (
            <a
              href={buildPageUrl(page + 1)}
              className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition"
            >
              Siguiente →
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
