import type { MetadataRoute } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Sitemap dinámico: rutas estáticas + productos y artículos publicados.
 * Se regenera en cada request (o según revalidación de Next).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL()
  const payload = await getPayload({ config: configPromise })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/sobre-nenufar`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/eventos`, changeFrequency: 'weekly', priority: 0.5 },
  ]

  const [products, posts] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const productRoutes: MetadataRoute.Sitemap = products.docs
    .filter((doc) => 'slug' in doc && doc.slug)
    .map((doc) => ({
      url: `${baseUrl}/products/${(doc as unknown as { slug: string }).slug}`,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const postRoutes: MetadataRoute.Sitemap = posts.docs
    .filter((doc) => 'slug' in doc && doc.slug)
    .map((doc) => ({
      url: `${baseUrl}/blog/${(doc as unknown as { slug: string }).slug}`,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...staticRoutes, ...productRoutes, ...postRoutes]
}
