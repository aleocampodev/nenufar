import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Providers } from '@/providers'
import type { Metadata } from 'next'

const storeJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['JewelryStore', 'Store', 'Organization'],
  name: 'Nenúfar — Joyería Artesanal Colombiana',
  alternateName: ['Nenúfar', 'Nenúfar Joyería'],
  description:
    'Joyería artesanal colombiana hecha a mano por Shirley en Cartagena. Piezas de autor en mostacilla y filigrana: el regalo perfecto para Amor y Amistad, cumpleaños, mamá y Navidad.',
  url: getServerSideURL(),
  logo: `${getServerSideURL()}/favicon.svg`,
  image: `${getServerSideURL()}/og-default.jpg`,
  priceRange: '$$',
  currenciesAccepted: 'COP',
  paymentAccepted: 'Nequi, Daviplata, Transferencia Bancaria',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cartagena de Indias',
    addressRegion: 'Bolívar',
    addressCountry: 'CO',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.39972',
    longitude: '-75.51444',
  },
  sameAs: [
    'https://www.facebook.com/Nenufar.co',
    'https://www.instagram.com/nenufar.co/',
  ],
}
import { InitTheme } from '@/providers/Theme/InitTheme'
import { Inter, Playfair_Display } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import React from 'react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'Nenúfar — Joyería Artesanal Colombiana | Regalos Únicos de Autor',
    template: '%s | Nenúfar Joyería',
  },
  description:
    'Joyería artesanal colombiana hecha a mano en Cartagena. Aretes, collares y pulseras en mostacilla calibrada. El regalo perfecto para Amor y Amistad, cumpleaños, mamá y Navidad.',
  keywords: [
    'Nenúfar',
    'nenufar',
    'nenufar joyeria',
    'joyería artesanal',
    'joyería artesanal colombiana',
    'joyas en Cartagena',
    'regalo de amor y amistad',
    'regalos de amor y amistad',
    'regalo amor y amistad colombia',
    'regalo de cumpleanos',
    'regalo de cumpleaños',
    'regalos de cumpleaños para mujer',
    'regalo para mama',
    'regalo para mamá',
    'regalos dia de la madre',
    'regalo de navidad',
    'regalo de navidad colombia',
    'regalos de navidad',
    'regalos artesanales colombia',
    'aretes en mostacilla',
    'collares tejidos a mano',
    'pulseras artesanales',
    'joyas de autor cartagena',
    'regalos unicos para mujer',
    'joyas hechas a mano cartagena',
  ],
  robots: {
    follow: true,
    index: true,
  },
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    title: 'Nenúfar — Joyería Artesanal Colombiana | Regalos de Autor',
    description:
      'Joyería artesanal colombiana hecha a mano en Cartagena. Piezas únicas de autor ideales para regalar en Amor y Amistad, cumpleaños y fechas especiales.',
  },
}

import { HashScrollHandler } from '@/components/Navigation/HashScrollHandler'
import { ScrollProgress } from '@/components/Navigation/ScrollProgress'
import { ScrollToTop } from '@/components/Navigation/ScrollToTop'

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={['scroll-smooth', inter.variable, playfair.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang="es"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <script
          id="store-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <Providers>
          <ScrollProgress />
          <HashScrollHandler />
          <AdminBar />
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
