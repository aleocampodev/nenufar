import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Providers } from '@/providers'
import type { Metadata } from 'next'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'JewelryStore'],
  name: 'Nenúfar',
  description:
    'Joyería artesanal colombiana hecha a mano en Cartagena por Shirley Cogollo. Diseños de autor en mostacilla calibrada y regalos de alta gama para Amor y Amistad, Navidad, Día de la Mujer y Madres.',
  url: getServerSideURL(),
  logo: `${getServerSideURL()}/favicon.svg`,
  image: `${getServerSideURL()}/media/landing-image1.jpeg`,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cartagena de Indias',
    addressRegion: 'Bolívar',
    addressCountry: 'CO',
  },
  knowsAbout: [
    'Joyería artesanal colombiana',
    'Mostacilla checa calibrada',
    'Cosmología Émbera',
    'Regalos de Amor y Amistad en Cartagena',
    'Regalos de Navidad y Aguinaldos en Colombia',
    'Regalos para el Día de la Mujer',
    'Regalos para el Día de la Madre',
    'Joyería para Bodas en Cartagena',
  ],
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
    default: 'Nenúfar — Joyería Artesanal Colombiana',
    template: '%s | Nenúfar',
  },
  description:
    'Joyería artesanal colombiana hecha a mano en Cartagena por Shirley Cogollo. Piezas únicas en mostacilla calibrada y técnicas ancestrales con aval RUAC y Marca Bolívar.',
  keywords: [
    'joyería artesanal Cartagena',
    'joyería colombiana hecha a mano',
    'aretes en mostacilla Cartagena',
    'collares tejidos a mano Colombia',
    'joyería de autor Cartagena',
    'mostacilla checa calibrada',
    'joyas cosmología Émbera',
    'artesanías de lujo Cartagena',
    'regalos de amor y amistad cartagena',
    'regalos para navidad cartagena',
    'aguinaldos artesanales colombia',
    'regalos día de la mujer cartagena',
    'regalos día de la madre hechos a mano',
    'regalos típicos colombianos de alta gama',
    'joyería para bodas Cartagena',
    'detalles personalizados para aniversarios',
    'Shirley Cogollo joyería',
    'artesanas María La Baja Bolívar',
    'certificado RUAC Artesanías de Colombia',
    'Marca Bolívar joyería',
  ],
  robots: {
    follow: true,
    index: true,
  },
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
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
        <link href="/nenufar-icon.png" rel="apple-touch-icon" />
      </head>
      <body>
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
