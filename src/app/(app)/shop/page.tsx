import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Busca productos en la tienda.',
  title: 'Tienda',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 2,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInCOP: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    ...(searchValue || category
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              ...(searchValue
                ? [
                    {
                      or: [
                        {
                          title: {
                            like: searchValue,
                          },
                        },
                        {
                          description: {
                            like: searchValue,
                          },
                        },
                      ],
                    },
                  ]
                : []),
              ...(category
                ? [
                    {
                      categories: {
                        contains: category,
                      },
                    },
                  ]
                : []),
            ],
          },
        }
      : {}),
  })

  const resultsText = products.docs.length > 1 ? 'resultados' : 'resultado'

  return (
    <div className="container py-12">
      {searchValue ? (
        <p className="mb-8 font-serif text-lg text-muted-foreground">
          {products.docs?.length === 0
            ? 'No hay productos que coincidan con '
            : `Mostrando ${products.docs.length} ${resultsText} para `}
          <span className="text-foreground">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products.docs?.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">✦</div>
          <p className="font-serif text-xl text-muted-foreground">
            No se encontraron productos.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Por favor intenta con otros filtros.
          </p>
        </div>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.docs.map((product, index) => {
            return (
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
            )
          })}
        </Grid>
      ) : null}
    </div>
  )
}
