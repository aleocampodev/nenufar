import type { Media as MediaType, GalleryBlock as GalleryBlockType } from '@/payload-types'
import { GalleryClient, type GalleryTabItem, type GalleryImageItem } from './GalleryClient'

export type GalleryBlockProps = GalleryBlockType & {
  id?: string
}

// Datos fotográficos auténticos de Nénufar (Clientas, Ferias, Talleres y Proceso)
const DEFAULT_GALLERY_TABS: GalleryTabItem[] = [
  {
    tabTitle: 'Nuestras Clientas',
    tabSubtitle: 'Mujeres reales que visten y dan vida a cada diseño',
    images: [
      {
        title: 'Clienta luciendo Okama Ceremonial',
        category: 'Clientas Felices',
        description: 'Una pieza tejida con más de 3.200 micro-mostacillas checas sobre atuendo de lino en Cartagena.',
        src: '/api/media/file/Embera-800x1000.webp',
        alt: 'Clienta de Nénufar luciendo collar Okama en Cartagena',
        isFeatured: true,
      },
      {
        title: 'Aretes Tricolor en Celebración',
        category: 'Momentos Especiales',
        description: 'Candongas livianas tejidas a mano complementando una ocasión inolvidable.',
        src: '/api/media/file/colombia-aretes-800x1000.webp',
        alt: 'Clienta luciendo aretes artesanales tricolor de Nénufar',
      },
      {
        title: 'Joya de Autor en la Piel',
        category: 'Diseño Vivo',
        description: 'La textura y el brillo de la mostacilla calibrada acompañando el día a día.',
        src: '/api/media/file/joya-1788320703397-800x1000.webp',
        alt: 'Clienta con pieza exclusiva de Shirley - Nénufar',
      },
      {
        title: 'Aretes Inspiración Café',
        category: 'Estilo Caribeño',
        description: 'Joyas con identidad de nuestra tierra colombiana.',
        src: '/api/media/file/cafe-aretes-1-800x1000.webp',
        alt: 'Clienta con aretes de café Nénufar',
      },
    ],
  },
  {
    tabTitle: 'Ferias en Cartagena',
    tabSubtitle: 'Encuentros presenciales en ferias de diseño y pop-ups',
    images: [
      {
        title: 'Stand de Nénufar en Feria Artesanal',
        category: 'Ferias & Pop-Ups',
        description: 'Encuentro con cartageneras y visitantes en el Parque de la Independencia.',
        src: '/api/media/file/Feria%20y%20talleres-800x1000.webp',
        alt: 'Puesto de Nénufar en feria de diseño de Cartagena',
        isFeatured: true,
      },
      {
        title: 'Shirley Compartiendo su Oficio',
        category: 'Encuentros Locales',
        description: 'Conversaciones cercanas con quienes aprecian la joyería tejida a mano.',
        src: '/api/media/file/shirley-nenufar-1-800x1000.webp',
        alt: 'Shirley en feria artesanal en Cartagena',
      },
      {
        title: 'Muestra de Piezas en Vivo',
        category: 'Mercados de Autor',
        description: 'Exhibición de nuevas combinaciones de color y diseños de temporada.',
        src: '/api/media/file/joya-1788385407531-800x1000.webp',
        alt: 'Muestra de joyas en mostacilla en feria local',
      },
    ],
  },
  {
    tabTitle: 'Talleres de Tejido',
    tabSubtitle: 'Aprender juntas el arte ancestral de la mostacilla',
    images: [
      {
        title: 'Taller Vivencial de Comunidad',
        category: 'Talleres Presenciales',
        description: 'Mujeres reunidas en Getsemaní aprendiendo puntadas tradicionales de hilado.',
        src: '/api/media/file/talleres-comunidad-800x1000.webp',
        alt: 'Taller presencial de tejido de mostacilla con Shirley en Cartagena',
        isFeatured: true,
      },
      {
        title: 'Primeras Creaciones',
        category: 'Comunidad Creadora',
        description: 'La emoción de tejer una joya con tus propias manos y paciencia.',
        src: '/api/media/file/WhatsApp%20Image%202026-07-29%20at%2011.35.55%20PM%20(2)-800x1000.webp',
        alt: 'Piezas terminadas en el taller de tejido de Nénufar',
      },
      {
        title: 'Herramientas & Hilos Calibrados',
        category: 'Oficio Tradicional',
        description: 'Compartiendo los secretos de la tensión del hilo y la selección de tonos.',
        src: '/api/media/file/Collar%20Naranja-800x1000.webp',
        alt: 'Detalle de hilado en clase práctica de mostacilla',
      },
    ],
  },
  {
    tabTitle: 'El Taller & Shirley',
    tabSubtitle: 'El rincón íntimo donde nacen las ideas en Getsemaní',
    images: [
      {
        title: 'Shirley en su Espacio Creador',
        category: 'Manos Creadoras',
        description: 'Dedicación y concentración en cada collar, elaborado de principio a fin por Shirley.',
        src: '/api/media/file/shirley-creadora-800x1000.webp',
        alt: 'Shirley tejiendo joyería artesanal en su taller de Cartagena',
        isFeatured: true,
      },
      {
        title: 'Mesa de Hilado y Texturas',
        category: 'Detalle de Oficio',
        description: 'Cuentas checas seleccionadas una a una con aguja fina.',
        src: '/api/media/file/Collar%20ancestral-800x1000.webp',
        alt: 'Mesa de trabajo y mostacillas en el taller Nénufar',
      },
      {
        title: 'Prototipos y Flores Tejidas',
        category: 'Inspiración Caribe',
        description: 'Explorando nuevos patrones botánicos antes de cada feria.',
        src: '/api/media/file/Collar-flor-800x1000.webp',
        alt: 'Creación botánica en mostacilla en el taller de Shirley',
      },
    ],
  },
]

function resolveImageUrl(imageField?: number | string | MediaType | null, fallbackUrl?: string | null): string {
  if (imageField && typeof imageField === 'object') {
    const media = imageField as MediaType
    const url = media.url || (media as any).sizes?.card?.url || (media as any).sizes?.thumbnail?.url
    if (url) return url
  }
  if (typeof imageField === 'string' && imageField.trim().length > 0) {
    return imageField
  }
  if (fallbackUrl && fallbackUrl.trim().length > 0) {
    return fallbackUrl
  }
  return 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg'
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  tagline,
  heading,
  description,
  tabs,
  id,
}) => {
  // Procesar las pestañas recibidas de Payload o usar el fallback de alta calidad
  const processedTabs: GalleryTabItem[] =
    tabs && Array.isArray(tabs) && tabs.length > 0
      ? tabs.map((tab, tIdx) => {
          const fallbackTab = DEFAULT_GALLERY_TABS[tIdx % DEFAULT_GALLERY_TABS.length]
          const tabImages: GalleryImageItem[] =
            tab.images && Array.isArray(tab.images) && tab.images.length > 0
              ? tab.images.map((img, iIdx) => {
                  const src = resolveImageUrl(img.image, img.imageUrl)
                  return {
                    id: img.id || `${tIdx}-${iIdx}`,
                    title: img.title || `Pieza ${iIdx + 1}`,
                    category: img.category || tab.tabTitle,
                    description: img.description || undefined,
                    src,
                    alt: img.title || 'Joyería artesanal Nénufar',
                    isFeatured: Boolean(img.isFeatured),
                  }
                })
              : fallbackTab.images

          return {
            tabTitle: tab.tabTitle || fallbackTab.tabTitle,
            tabSubtitle: tab.tabSubtitle || fallbackTab.tabSubtitle,
            images: tabImages,
          }
        })
      : DEFAULT_GALLERY_TABS

  return (
    <GalleryClient
      tagline={tagline ?? 'MUESTRARIO VISUAL & LOOKBOOK'}
      heading={heading ?? 'Nénufar en la Piel: Arte y Color Caribeño'}
      description={
        description ??
        'Explora nuestras piezas tejidas a mano en Cartagena de Indias, el brillo de la micro-mostacilla checa calibrada y la fuerza del diseño ancestral lucido por mujeres reales.'
      }
      tabs={processedTabs}
      id={id || 'galeria'}
    />
  )
}
