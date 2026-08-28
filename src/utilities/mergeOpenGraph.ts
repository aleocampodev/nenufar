import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'es_CO',
  description:
    'Joyería artesanal colombiana hecha a mano en Cartagena. Piezas únicas de Nenúfar.',
  images: [
    {
      url: '/og-default.jpg',
    },
  ],
  siteName: 'Nenúfar',
  title: 'Nenúfar — Joyería Artesanal Colombiana',
}

export const mergeOpenGraph = (og?: Partial<Metadata['openGraph']>): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
