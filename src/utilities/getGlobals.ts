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
      return res.docs.map((c) => ({
        id: c.id,
        title: c.title,
        slug: (c as any).slug || String(c.id),
      }))
    } catch {
      return []
    }
  },
  ['all_categories_nav'],
  { tags: ['categories_nav'], revalidate: 60 },
)
