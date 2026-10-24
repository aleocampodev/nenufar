import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  unstable_cache(async () => getGlobal<T>(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })

const FORBIDDEN_CATEGORIES = new Set([
  't-shirts',
  't-shirt',
  'tshirts',
  'accessories',
  'hats',
  'hat',
])

const CATEGORY_ORDER: Record<string, number> = {
  collares: 1,
  aretes: 2,
  conjuntos: 3,
  accesorios: 4,
}

export const getCachedCategories = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config: configPromise })
      const res = await payload.find({
        collection: 'categories',
        sort: 'title',
        limit: 50,
        overrideAccess: true,
      })

      return res.docs
        .map((c) => ({
          id: c.id,
          title: c.title,
          slug: (c as any).slug || String(c.id),
        }))
        .filter((c) => {
          const lowerTitle = c.title.toLowerCase().trim()
          const lowerSlug = c.slug.toLowerCase().trim()
          return !FORBIDDEN_CATEGORIES.has(lowerTitle) && !FORBIDDEN_CATEGORIES.has(lowerSlug)
        })
        .sort((a, b) => {
          const orderA = CATEGORY_ORDER[a.title.toLowerCase()] ?? 99
          const orderB = CATEGORY_ORDER[b.title.toLowerCase()] ?? 99
          if (orderA !== orderB) return orderA - orderB
          return a.title.localeCompare(b.title)
        })
    } catch {
      return []
    }
  },
  ['all_categories_nav'],
  { tags: ['categories_nav'], revalidate: 60 },
)
