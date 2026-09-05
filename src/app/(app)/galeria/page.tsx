import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight, Camera } from 'lucide-react'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Page } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Galería de Creaciones & Momentos Reales | Nénufar',
  description:
    'Explora nuestra galería de joyas artesanales en mostacilla tejidas a mano en Cartagena: clientas reales, ferias locales, talleres de tejido y el espacio de Shirley.',
  openGraph: mergeOpenGraph({
    title: 'Galería de Creaciones | Nénufar Cartagena',
    description:
      'Muestrario fotográfico de joyería artesanal tejida a mano: clientas felices, ferias de diseño y talleres de comunidad en Cartagena.',
    url: '/galeria',
  }),
}

async function queryGalleryData() {
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'pages',
      depth: 2,
      limit: 1,
      overrideAccess: true,
      where: {
        or: [{ slug: { equals: 'home' } }, { slug: { equals: 'inicio' } }],
      },
    })

    const page = res.docs[0] as Page | undefined
    const galleryBlock = page?.layout?.find((b) => b.blockType === 'gallery') as any
    return galleryBlock || null
  } catch {
    return null
  }
}

export default async function GaleriaPage() {
  const galleryData = await queryGalleryData()

  return (
    <main className="w-full pb-20">
      {/* 1. Header Editorial de la Galería */}
      <section className="w-full bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/60 to-background border-b border-neutral-200/60 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          {/* Breadcrumbs sutiles */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-2">
            <Link href="/" className="hover:text-brand transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-neutral-800 font-medium">Galería</span>
          </nav>

          <span className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] text-[#8B5A2B] font-semibold font-sans text-center">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B] shrink-0" />
            GALERÍA DE AUTOR · CARTAGENA DE INDIAS
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] dark:text-neutral-100 font-normal tracking-tight">
            Historias y Momentos <span className="italic font-light text-brand">Tejidos en la Piel</span>
          </h1>
        </div>
      </section>

      {/* 2. Bloque Interactivo de Galería con pestañas a la izquierda, cuadrícula y paginado */}
      <GalleryBlock
        {...(galleryData || {})}
        blockType="gallery"
        id="galeria-principal"
      />

      {/* 3. Banner CTA inferior hacia el Catálogo y Personalización */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="rounded-3xl bg-[#FAF8F5] border border-neutral-200/80 p-8 sm:p-12 text-center relative overflow-hidden shadow-xs">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold font-sans">
              <Camera className="w-4 h-4 text-[#8B5A2B]" />
              ¿TE ENAMORASTE DE ALGUNA PIEZA?
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-normal">
              Lleva una Joya de Autor Hecha Especialmente para Ti
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
              Explora las piezas listas para entrega inmediata en nuestro catálogo o habla directamente con Shirley para coordinar un diseño exclusivo a tu medida.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs uppercase tracking-[0.2em] font-medium bg-brand hover:bg-brand-dark text-white shadow-[0_4px_20px_rgba(106,27,154,0.25)] transition-all duration-300 w-full sm:w-auto"
              >
                Ver Catálogo Disponible
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs uppercase tracking-[0.2em] font-medium bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 transition-all duration-200 w-full sm:w-auto"
              >
                Personalizar con Shirley
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
