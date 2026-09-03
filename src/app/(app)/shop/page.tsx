import { KraftiProductTile } from '@/components/ProductCard/KraftiProductTile'
import { NenufarPagination } from '@/components/Pagination/NenufarPagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Sparkles, Gift, Gem, HeartHandshake } from 'lucide-react'
import { ShopFilterBar } from './ShopFilterBar'

export const metadata = {
  description:
    'Explora el catálogo de joyas artesanales colombianas en mostacilla y filigrana. Piezas únicas hechas a mano en Cartagena, perfectas para regalar en Amor y Amistad, cumpleaños o Navidad.',
  title: 'Catálogo de Joyería Artesanal & Regalos de Autor | Nenúfar Cartagena',
}

const PAGE_SIZE = 20

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
      {/* 1. Header Editorial de Catálogo con Neuromarketing & Paleta Canónica */}
      <div className="w-full bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/60 to-background border-b border-neutral-200/60 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            ALTA JOYERÍA ARTESANAL · CARTAGENA DE INDIAS
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] dark:text-neutral-100 font-normal tracking-tight">
            Piezas que Enamoran & Cuentan Historias
          </h1>

          <div className="w-12 h-0.5 bg-brand mx-auto my-3 rounded-full opacity-70" />

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed max-w-2xl mx-auto">
            Cada collar, arete y pulsera es hilado pacientemente a mano por Shirley durante 10 a 30 horas
            con micro-mostacillas checas calibradas y herrajes hipoalergénicos.
          </p>

          {/* 2. Tríada de Confianza / Neuromarketing: Reduce fricción y aumenta deseo de regalo */}
          <div className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left sm:text-center">
            <div className="flex items-center sm:flex-col justify-start sm:justify-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-brand/15 shadow-sm">
              <Gift className="w-4 h-4 text-brand shrink-0" />
              <div className="text-xs">
                <strong className="block font-medium text-[#1C1917] dark:text-neutral-200">Empaque de Regalo</strong>
                <span className="text-[11px] text-neutral-500">Listo para fechas especiales</span>
              </div>
            </div>

            <div className="flex items-center sm:flex-col justify-start sm:justify-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-brand/15 shadow-sm">
              <Gem className="w-4 h-4 text-brand shrink-0" />
              <div className="text-xs">
                <strong className="block font-medium text-[#1C1917] dark:text-neutral-200">Cuentas Calibradas</strong>
                <span className="text-[11px] text-neutral-500">Brillo y textura inalterable</span>
              </div>
            </div>

            <div className="flex items-center sm:flex-col justify-start sm:justify-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-brand/15 shadow-sm">
              <HeartHandshake className="w-4 h-4 text-brand shrink-0" />
              <div className="text-xs">
                <strong className="block font-medium text-[#1C1917] dark:text-neutral-200">Atención Personal</strong>
                <span className="text-[11px] text-neutral-500">Shirley coordina tu pedido</span>
              </div>
            </div>
          </div>
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

      {/* Grilla Impecable y Uniforme de Catálogo (Misma medida en todas las joyas) */}
      {docs.length > 0 && (
        <div className="w-full border-t border-l border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
            {docs.map((product, index) => (
              <KraftiProductTile
                key={product.id}
                product={product}
                index={index}
              />
            ))}
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
      />
    </div>
  )
}
