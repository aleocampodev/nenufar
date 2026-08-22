/* eslint-disable no-restricted-exports */
import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerSideURL()

  return {
    host: baseUrl,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/pedidos',
          '/find-order',
          '/account',
          '/orders',
          // Fuera del storefront actual (landing + ecommerce)
          '/blog',
          '/eventos',
          '/sobre-nenufar',
          '/contacto',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
