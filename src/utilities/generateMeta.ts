import type { Metadata } from 'next'

import type { Page, Product } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'

export const generateMeta = async (args: { doc: Page | Product }): Promise<Metadata> => {
  const { doc } = args || {}

  const ogImage =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image &&
    `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.meta.image.url}`

  const isProduct = Boolean(doc && 'priceInCOP' in doc)
  const defaultTitle = doc?.title
    ? `${doc.title} — Joyería Artesanal | Nenúfar Cartagena`
    : 'Nenúfar — Joyería Artesanal Colombiana | Regalos Únicos de Autor'

  const defaultDescription = isProduct
    ? `${doc?.title || 'Joya artesanal'} hecha a mano por Shirley en Cartagena de Indias. El regalo perfecto de autor para Amor y Amistad, cumpleaños o sorprender a alguien especial.`
    : 'Joyería artesanal colombiana hecha a mano en Cartagena. Piezas de autor en mostacilla y filigrana: el regalo perfecto para Amor y Amistad, cumpleaños y fechas especiales.'

  const metaTitle = doc?.meta?.title || defaultTitle
  const metaDescription = doc?.meta?.description || defaultDescription

  return {
    description: metaDescription,
    openGraph: mergeOpenGraph({
      description: metaDescription,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title: metaTitle,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title: metaTitle,
  }
}
