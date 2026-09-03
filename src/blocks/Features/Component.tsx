import React from 'react'
import { Sparkles, Truck, HeartHandshake, Gift, ShieldCheck, Gem } from 'lucide-react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'

type FeatureItem = {
  icon?: string | null
  title: string
  description: string
  id?: string | null
}

type Props = {
  tagline?: string | null
  heading?: string | null
  centerImage?: number | string | MediaType | null
  items?: FeatureItem[] | null
  id?: string
}

// 1. HECHO A MANO: Aguja / gancho artesanal de tejer con lazo superior
const HookNeedleIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="16.5" y1="7.5" x2="9" y2="15" />
    <circle cx="18" cy="6" r="1.5" />
    <path d="M9 15C8 16 6.5 17.5 6 18.5C5.5 19.5 7 20 8 19" />
  </svg>
)

// 2. DISEÑO ANCESTRAL: Dos rombos geométricos entrelazados (patrón indígena)
const AncestralPatternIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="10,5 13.5,12 10,19 6.5,12" />
    <polygon points="14,5 17.5,12 14,19 10.5,12" />
  </svg>
)

// 3. COLORES AUTÉNTICOS: Hilo colgante con mostacilla checa central
const HangingBeadIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="3" x2="12" y2="11" />
    <circle cx="12" cy="15" r="3.5" />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
  </svg>
)

// 4. PIEZAS ÚNICAS: Estrella lineal minimalista
const MinimalStarIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 3 14.8 8.8 21.2 9.7 16.6 14.2 17.7 20.6 12 17.6 6.3 20.6 7.4 14.2 2.8 9.7 9.2 8.8 12 3" />
  </svg>
)

const getIconComponent = (icon?: string | null) => {
  switch (icon) {
    case 'ancestral':
    case 'pattern':
      return <AncestralPatternIcon className="w-5 h-5" />
    case 'colors':
    case 'bead':
      return <HangingBeadIcon className="w-5 h-5" />
    case 'unique':
    case 'star':
      return <MinimalStarIcon className="w-5 h-5" />
    case 'design':
    case 'gem':
      return <Gem className="w-5 h-5" />
    case 'quality':
    case 'materials':
      return <ShieldCheck className="w-5 h-5" />
    case 'gift':
      return <Gift className="w-5 h-5" />
    case 'shipping':
    case 'truck':
      return <Truck className="w-5 h-5" />
    case 'support':
    case 'heart':
      return <HeartHandshake className="w-5 h-5" />
    case 'sparkles':
      return <Sparkles className="w-5 h-5" />
    case 'handmade':
    case 'needle':
    default:
      return <HookNeedleIcon className="w-5 h-5" />
  }
}

export const FeaturesBlock: React.FC<Props> = ({
  tagline = 'Tradición y Delicadeza',
  heading = 'El Rigor y la Paciencia de Nuestro Oficio',
  centerImage,
  items,
  id,
}) => {
  const defaultItems: FeatureItem[] = [
    {
      icon: 'handmade',
      title: 'HECHO A MANO',
      description: 'Cada pieza es tejida pacientemente por Shirley en Cartagena con mostacilla calibrada de alta calidad.',
    },
    {
      icon: 'ancestral',
      title: 'DISEÑO ANCESTRAL',
      description: 'Inspirados en los patrones y colores de las comunidades indígenas colombianas, cada diseño cuenta una historia.',
    },
    {
      icon: 'colors',
      title: 'COLORES AUTÉNTICOS',
      description: 'Combinaciones vibrantes hechas con mostacilla checa y materiales de alta calidad, pensadas para durar.',
    },
    {
      icon: 'unique',
      title: 'PIEZAS ÚNICAS',
      description: 'Todas nuestras joyas se envían en una presentación artesanal lista para sorprender a alguien especial.',
    },
  ]

  const featureItems = items && Array.isArray(items) && items.length > 0 ? items.filter((it) => it != null && typeof it === 'object') : defaultItems
  const half = Math.ceil(featureItems.length / 2)
  const leftItems = featureItems.slice(0, half)
  const rightItems = featureItems.slice(half)

  // Resuelve la URL de la imagen central de manera infalible (con fallback a foto real de la colección)
  const resolveCenterImageUrl = (): { src: string; alt: string } => {
    if (centerImage && typeof centerImage === 'object') {
      const media = centerImage as MediaType
      const url = media.url || (media as any).sizes?.card?.url || (media as any).sizes?.thumbnail?.url
      if (url) {
        return { src: url, alt: media.alt || 'Joyería artesanal Nénufar' }
      }
    }
    if (typeof centerImage === 'string' && centerImage.trim().length > 0) {
      return { src: centerImage, alt: 'Joyería artesanal Nénufar' }
    }
    // Fallback fotográfico real de alta resolución de la tienda
    return {
      src: '/media/colombia-aretes-6.jpeg',
      alt: 'Joyería artesanal en mostacilla tejida a mano - Nénufar',
    }
  }

  const { src: centerImgSrc, alt: centerImgAlt } = resolveCenterImageUrl()

  const FeatureCard = ({ item, align = 'center' }: { item: FeatureItem; align?: 'left' | 'right' | 'center' }) => {
    const alignmentClasses =
      align === 'left'
        ? 'items-start text-left'
        : align === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'

    return (
      <div className={`group flex flex-col ${alignmentClasses} max-w-[320px] mx-auto`}>
        <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/15 mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          {getIconComponent(item.icon)}
        </div>
        <h3 className="font-serif text-sm tracking-[0.25em] text-[#9A6038] font-semibold uppercase mb-2">
          {item.title}
        </h3>
        <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-600 font-light">
          {item.description}
        </p>
      </div>
    )
  }

  return (
    <section id={id || 'tradicion'} className="py-14 sm:py-16 md:py-20 bg-[#FAF8F5]/60 overflow-hidden scroll-mt-24">
      <div className="max-w-[1060px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial Krafti */}
        {(tagline || heading) && (
          <ScrollReveal variant="fade-up" duration={800}>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2.5">
              {tagline && (
                <span className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans block">
                  {tagline}
                </span>
              )}
              {heading && (
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
                  {heading}
                </h2>
              )}
              <div className="w-12 h-0.5 bg-brand mx-auto mt-3.5 rounded-full opacity-60" />
            </div>
          </ScrollReveal>
        )}

        {/* Krafti Item Showcase: Feature cards around a framed artisan jewelry piece */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column - Features (Right-aligned on Desktop) */}
          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-16 order-2 lg:order-1">
            {leftItems.map((item, idx) => (
              <ScrollReveal key={item.id || idx} variant="fade-right" delay={idx * 120} duration={800}>
                <div className="hidden lg:block">
                  <FeatureCard item={item} align="right" />
                </div>
                <div className="lg:hidden">
                  <FeatureCard item={item} align="center" />
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Center Column - Featured Artisan Piece in Luxury Arch Frame */}
          <div className="flex justify-center order-1 lg:order-2 py-2 lg:py-0">
            <ScrollReveal variant="scale-up" delay={150} duration={900}>
              <div className="relative group">
                {/* Outer decorative ring border */}
                <div className="absolute -inset-3 rounded-t-[154px] rounded-b-[2rem] border border-brand/15 pointer-events-none group-hover:border-brand/30 transition-colors duration-500" />
                
                {/* Main arch framed image */}
                <div className="relative w-[260px] h-[340px] sm:w-[300px] sm:h-[390px] lg:w-[320px] lg:h-[420px] rounded-t-[140px] rounded-b-3xl overflow-hidden border-2 border-[#EADCCF] shadow-[0_15px_35px_rgba(0,0,0,0.06)] bg-[#FAF5ED] p-1.5">
                  <div className="w-full h-full rounded-t-[132px] rounded-b-[1.25rem] overflow-hidden">
                    <img
                      src={centerImgSrc}
                      alt={centerImgAlt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column - Features (Left-aligned on Desktop) */}
          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-16 order-3">
            {rightItems.map((item, idx) => (
              <ScrollReveal key={item.id || idx} variant="fade-left" delay={idx * 120 + 150} duration={800}>
                <div className="hidden lg:block">
                  <FeatureCard item={item} align="left" />
                </div>
                <div className="lg:hidden">
                  <FeatureCard item={item} align="center" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


