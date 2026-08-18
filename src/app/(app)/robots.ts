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
        disallow: ['/admin', '/api', '/pedidos', '/find-order', '/account', '/orders'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
