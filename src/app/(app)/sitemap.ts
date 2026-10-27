import type { MetadataRoute } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Sitemap dinámico — storefront (landing + ecommerce + páginas CMS).
 * Indexa: home, shop, páginas institucionales y productos publicados.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL()
  const payload = await getPayload({ config: configPromise })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
  ]

  // Páginas institucionales publicadas en Payload
  let pageRoutes: MetadataRoute.Sitemap = []
  try {
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 100,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    })

    pageRoutes = pages.docs
      .filter((doc) => 'slug' in doc && doc.slug && doc.slug !== 'home')
      .map((doc) => ({
        url: `${baseUrl}/${(doc as unknown as { slug: string }).slug}`,
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      }))
  } catch (error) {
    console.error('Error generando sitemap para páginas institucionales:', error)
  }

  // Productos publicados en Payload
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

  return [...staticRoutes, ...pageRoutes, ...productRoutes]
}
