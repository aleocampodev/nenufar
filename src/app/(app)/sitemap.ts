import type { MetadataRoute } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Sitemap dinámico — storefront (landing + ecommerce).
 * Solo se indexan: home, shop y productos publicados.
 * Blog, eventos y páginas estáticas quedan fuera del alcance actual.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL()
  const payload = await getPayload({ config: configPromise })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
  ]

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: 'published' } },
    select: { slug: true, updatedAt: true },
  })

  const productRoutes: MetadataRoute.Sitemap = products.docs
    .filter((doc) => 'slug' in doc && doc.slug)
    .map((doc) => ({
      url: `${baseUrl}/products/${(doc as unknown as { slug: string }).slug}`,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  return [...staticRoutes, ...productRoutes]
}
