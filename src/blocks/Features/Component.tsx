import React from 'react'
import { Sparkles, Truck, HeartHandshake, Gift, ShieldCheck } from 'lucide-react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

type FeatureItem = {
  icon?: 'handmade' | 'shipping' | 'quality' | 'gift' | 'support' | null
  title: string
  description: string
  id?: string | null
}

type Props = {
  tagline?: string | null
  heading?: string | null
  centerImage?: number | MediaType | null
  items?: FeatureItem[] | null
}

const getIconComponent = (icon?: string | null) => {
  switch (icon) {
    case 'shipping':
      return <Truck className="w-6 h-6 text-[#1e3a5f]" />
    case 'quality':
      return <ShieldCheck className="w-6 h-6 text-[#1e3a5f]" />
    case 'gift':
      return <Gift className="w-6 h-6 text-[#1e3a5f]" />
    case 'support':
      return <HeartHandshake className="w-6 h-6 text-[#1e3a5f]" />
    case 'handmade':
    default:
      return <Sparkles className="w-6 h-6 text-[#1e3a5f]" />
  }
}

// Pequeño ornamento hoja como en Krafti (SVG inline)
const LeafIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 14 6 12 10C10 14 6 16 6 16C6 16 8 13 10 10C12 6 12 2 12 2Z" stroke="#1e3a5f" strokeWidth="1.2" fill="#1e3a5f" fillOpacity="0.9" />
    <path d="M12 10C12 10 15 11 17 13.5C19 16 19 19 19 19C19 19 15 18 12 15.5" stroke="#1e3a5f" strokeWidth="1" fill="#1e3a5f" fillOpacity="0.6" />
  </svg>
)

export const FeaturesBlock: React.FC<Props> = ({
  tagline = 'Tradición y Delicadeza',
  heading = 'Por qué elegir Nenúfar Joyería',
  centerImage,
  items,
}) => {
  const defaultItems: FeatureItem[] = [
    {
      icon: 'handmade',
      title: 'Estilo Único',
      description: 'Cada pieza es tejida pacientemente por Shirley en Cartagena con mostacilla calibrada de alta calidad.',
    },
    {
      icon: 'shipping',
      title: 'Diseño Moderno',
      description: 'Inspirado en la filigrana momposina con un toque contemporáneo que trasciende tendencias.',
    },
    {
      icon: 'quality',
      title: 'Nuevas Tecnologías',
      description: 'Hilos de alta resistencia e insumos hipoalergénicos que garantizan brillo y duración en el Caribe.',
    },
    {
      icon: 'gift',
      title: 'Duradero',
      description: 'Todas nuestras joyas se envían en empaque artesanal listas para regalar y atesorar por años.',
    },
  ]

  const featureItems = items && items.length === 4 ? items : defaultItems
  const leftItems = featureItems.slice(0, 2)
  const rightItems = featureItems.slice(2, 4)
  const hasCenterImage = centerImage && typeof centerImage === 'object'

  const FeatureCard = ({ item, align = 'center' }: { item: FeatureItem; align?: 'left' | 'right' | 'center' }) => (
    <div className={`flex flex-col ${align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right md:items-end md:text-right' : 'items-center text-center'} max-w-[280px] mx-auto`}>
      <div className="mb-3 text-[#1e3a5f]">
        <LeafIcon className="w-6 h-6 mx-auto" />
      </div>
      <h3 className="font-serif text-sm tracking-[0.2em] text-[#8B5A2B] font-semibold uppercase mb-2">
        {item.title}
      </h3>
      <p className="text-xs leading-relaxed text-neutral-500">
        {item.description}
      </p>
    </div>
  )

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Krafti: 4 textos alrededor de imagen central - desktop 3 cols, mobile stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">
          {/* Izquierda - 2 features */}
          <div className="flex flex-col gap-12 lg:gap-16 order-2 lg:order-1">
            {leftItems.map((item, idx) => (
              <div key={item.id || idx} className={idx === 0 ? 'lg:text-right' : 'lg:text-right'}>
                {/* En desktop, los de la izquierda van alineados a la derecha, en mobile centrados */}
                <div className="hidden lg:block">
                  <FeatureCard item={item} align="right" />
                </div>
                <div className="lg:hidden">
                  <FeatureCard item={item} align="center" />
                </div>
              </div>
            ))}
          </div>

          {/* Centro - Imagen bowl */}
          <div className="flex justify-center order-1 lg:order-2 py-4 lg:py-0">
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px]">
              {hasCenterImage ? (
                <Media
                  resource={centerImage as MediaType}
                  sizeName="card"
                  fill
                  imgClassName="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=60"
                    alt="Bowl de madera artesanal"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Derecha - 2 features */}
          <div className="flex flex-col gap-12 lg:gap-16 order-3">
            {rightItems.map((item, idx) => (
              <FeatureCard key={item.id || idx} item={item} align="center" />
            ))}
          </div>
        </div>

        {/* En mobile, mostrar los 4 en una sola columna ya está con el grid, pero ajustamos para que en mobile se vean todos centrados */}
        <style>{`@media (max-width: 1024px) { .lg\\:text-right { text-align: center; } }`}</style>
      </div>
    </section>
  )
}
