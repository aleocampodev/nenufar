import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight, Camera } from 'lucide-react'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-static'
export const revalidate = 3600

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

export default function GaleriaPage() {
  return (
    <main className="w-full pb-20">
      {/* 1. Header Editorial de la Galería */}
      <section className="w-full bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/60 to-background border-b border-neutral-200/60 pt-10 sm:pt-14 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          {/* Breadcrumbs sutiles */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-2">
            <Link href="/" className="hover:text-brand transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-neutral-800 font-medium">Galería</span>
          </nav>

          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            MUESTRARIO VISUAL & COMUNIDAD · CARTAGENA DE INDIAS
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] dark:text-neutral-100 font-normal tracking-tight">
            Nénufar en la Piel: Historias & Momentos Reales
          </h1>

          <p className="font-sans text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Fotografías auténticas de nuestras piezas en la vida cotidiana de mujeres reales,
            encuentros en ferias locales de Cartagena y la magia de nuestros talleres de tejido en comunidad.
          </p>
        </div>
      </section>

      {/* 2. Bloque Interactivo de Galería con pestañas, categorías y lightbox */}
      <GalleryBlock
        blockType="gallery"
        id="galeria-principal"
        tagline="MOMENTOS & CREACIONES"
        heading="Colección Visual de Oficio & Piel"
        description="Selecciona una de las categorías para ver detalles fotográficos, el trabajo de Shirley y cómo lucen nuestras piezas en personas reales."
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
