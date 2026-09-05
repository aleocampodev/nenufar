import { KraftiProductTile } from '@/components/ProductCard/KraftiProductTile'
import { NenufarPagination } from '@/components/Pagination/NenufarPagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ShopFilterBar } from './ShopFilterBar'

export const metadata = {
  description:
    'Explora el catálogo de joyas artesanales colombianas en mostacilla y filigrana. Piezas únicas hechas a mano en Cartagena, perfectas para regalar en Amor y Amistad, cumpleaños o Navidad.',
  title: 'Catálogo de Joyería Artesanal & Regalos de Autor | Nenúfar Cartagena',
}

const PAGE_SIZE = 8

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category, featured, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(String(pageParam ?? '1'), 10) || 1)
  const payload = await getPayload({ config: configPromise })

  // 1. Obtener todas las categorías para los filtros
  const categoriesRes = await payload.find({
    collection: 'categories',
    sort: 'title',
    limit: 50,
    overrideAccess: true,
  })

  const categories = categoriesRes.docs.map((c) => ({
    id: c.id,
    title: c.title,
    slug: (c as any).slug || String(c.id),
  }))

  // 2. Construir filtros de consulta
  const whereConditions: any[] = [{ _status: { equals: 'published' } }]

  if (searchValue && typeof searchValue === 'string') {
    whereConditions.push({
      or: [
        { title: { like: searchValue.trim() } },
        { description: { like: searchValue.trim() } },
      ],
    })
  }

  if (category && typeof category === 'string') {
    const matchedCat = categoriesRes.docs.find(
      (c) => (c as any).slug === category || String(c.id) === category,
    )
    if (matchedCat) {
      whereConditions.push({ categories: { contains: matchedCat.id } })
    }
  }

  if (featured === 'true') {
    whereConditions.push({ featured: { equals: true } })
  }

  // 3. Consultar productos con Payload
  const sortOption = typeof sort === 'string' ? sort : '-createdAt'

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: true,
    depth: 2,
    limit: PAGE_SIZE,
    page,
    sort: sortOption,
    select: {
      title: true,
      slug: true,
      description: true,
      gallery: true,
      categories: true,
      variants: true,
      priceInCOP: true,
      inventory: true,
      featured: true,
    },
    where: {
      and: whereConditions,
    },
  })

  const { docs, totalDocs, totalPages, hasPrevPage, hasNextPage } = products

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('q', String(searchValue))
    if (sort) params.set('sort', String(sort))
    if (category) params.set('category', String(category))
    if (featured) params.set('featured', String(featured))
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/shop${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="w-full pb-20">
      {/* Encabezado Editorial del Catálogo */}
      <div className="w-full bg-[#FAF8F5] border-b border-neutral-200/60 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1C1917] font-normal tracking-tight">
            Alta Joyería Artesanal · Cartagena de Indias
          </h1>
        </div>
      </div>

      {/* Barra de Filtros Minimalista en el Encabezado de Shop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <ShopFilterBar
          categories={categories}
          totalProducts={totalDocs}
          activeCategory={typeof category === 'string' ? category : undefined}
          activeSort={sortOption}
          activeSearch={typeof searchValue === 'string' ? searchValue : undefined}
          activeFeatured={featured === 'true'}
        />
      </div>

      {/* Estado Vacío */}
      {docs.length === 0 && (
        <div className="text-center py-24 px-6 border border-dashed border-border/80 rounded-2xl max-w-md mx-auto my-12">
          <div className="text-5xl mb-4 opacity-40 text-brand">✦</div>
          <h3 className="font-serif text-xl text-foreground mb-2">No encontramos joyas</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Prueba ajustando los filtros o buscando otra joya en mostacilla.
          </p>
          <a
            href="/shop"
            className="inline-block px-6 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest font-medium rounded-full hover:bg-brand transition-colors"
          >
            Ver todo el catálogo
          </a>
        </div>
      )}

      {/* Grilla Irregular Masonry Estilo Krafti con Tile Oscura Footer (#3B032F) */}
      {docs.length > 0 && (
        <div className="w-full border-t border-l border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {docs.map((product, index) => (
              <KraftiProductTile
                key={product.id}
                product={product}
                index={index}
                layoutMode="masonry"
              />
            ))}

            {/* Tarjeta Editorial de Taller Shirley para completar armónicamente la grilla de 3 columnas */}
            {docs.length === 8 && (
              <div className="group relative flex flex-col justify-between overflow-hidden border-r border-b border-border/40 p-8 sm:p-10 bg-[#F5F2EC] text-center col-span-1 row-span-1 min-h-[380px] h-full justify-center items-center">
                <div className="flex flex-col items-center justify-center my-auto space-y-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-sans font-semibold tracking-[0.25em] uppercase text-[#8B5A2B]">
                    ✦ Taller Shirley · Cartagena
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal tracking-tight leading-snug">
                    ¿Buscas una Joya Personalizada?
                  </h3>
                  <p className="text-xs text-neutral-600 font-light leading-relaxed max-w-[240px] mx-auto">
                    Tejemos diseños exclusivos con los colores, formas y medidas que elijas.
                  </p>
                  <div className="pt-2">
                    <a
                      href="/#contacto"
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold bg-brand text-white hover:bg-brand-dark transition-all duration-300 shadow-sm"
                    >
                      Hablar con Shirley
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paginación Innovadora de Nenúfar */}
      <NenufarPagination
        page={page}
        totalPages={totalPages}
        totalDocs={totalDocs}
        limit={PAGE_SIZE}
        buildPageUrl={buildPageUrl}
        showAlways={true}
      />
    </div>
  )
}
