import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'es_CO',
  description:
    'Joyería artesanal colombiana hecha a mano en Cartagena. Piezas de autor en mostacilla y filigrana: el regalo perfecto para Amor y Amistad, cumpleaños, mamá y ocasiones especiales.',
  images: [
    {
      url: '/og-default.jpg',
    },
  ],
  siteName: 'Nenúfar Joyería Artesanal',
  title: 'Nenúfar — Joyería Artesanal Colombiana | Regalos Únicos de Autor',
}

export const mergeOpenGraph = (og?: Partial<Metadata['openGraph']>): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
