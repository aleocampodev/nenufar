import React from 'react'
import { Sparkles, Truck, HeartHandshake, Gift, ShieldCheck } from 'lucide-react'

type FeatureItem = {
  icon?: 'handmade' | 'shipping' | 'quality' | 'gift' | 'support' | null
  title: string
  description: string
  id?: string | null
}

type Props = {
  tagline?: string | null
  heading?: string | null
  items?: FeatureItem[] | null
}

const getIconComponent = (icon?: string | null) => {
  switch (icon) {
    case 'shipping':
      return <Truck className="w-6 h-6 text-brand" />
    case 'quality':
      return <ShieldCheck className="w-6 h-6 text-brand" />
    case 'gift':
      return <Gift className="w-6 h-6 text-brand" />
    case 'support':
      return <HeartHandshake className="w-6 h-6 text-brand" />
    case 'handmade':
    default:
      return <Sparkles className="w-6 h-6 text-brand" />
  }
}

export const FeaturesBlock: React.FC<Props> = ({
  tagline = 'Tradición y Delicadeza',
  heading = 'Por qué elegir Nenúfar Joyería',
  items,
}) => {
  const defaultItems: FeatureItem[] = [
    {
      icon: 'handmade',
      title: '100% Hecho a Mano',
      description: 'Cada pieza es tejida pacientemente por Shirley en Cartagena con mostacilla de alta calidad.',
    },
    {
      icon: 'shipping',
      title: 'Envíos a Toda Colombia',
      description: 'Llegamos a tu ciudad con empaque seguro y coordinación personalizada vía Telegram y WhatsApp.',
    },
    {
      icon: 'quality',
      title: 'Materiales Duraderos',
      description: 'Hilos de alta tenacidad e insumos hipoalergénicos diseñados para conservar su brillo caribeño.',
    },
    {
      icon: 'gift',
      title: 'Lista para Regalar',
      description: 'Cada joya se entrega en un empaque artesanal elegante, lista para sorprender a quien amas.',
    },
  ]

  const featureItems = items && items.length > 0 ? items : defaultItems

  return (
    <section className="py-20 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado de la Sección */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {tagline && (
            <span className="text-xs uppercase tracking-[0.25em] text-brand font-semibold font-sans mb-2 block">
              {tagline}
            </span>
          )}
          {heading && (
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-bold tracking-tight">
              {heading}
            </h2>
          )}
          <div className="w-12 h-0.5 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Grilla de Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/60 hover:border-brand/40 transition-all duration-300 hover:shadow-sm group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand/5 dark:bg-brand/15 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-brand/10 transition-transform">
                {getIconComponent(item.icon)}
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
