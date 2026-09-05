import type { Media as MediaType, GalleryBlock as GalleryBlockType } from '@/payload-types'
import { GalleryClient, type GalleryTabItem, type GalleryImageItem } from './GalleryClient'

export type GalleryBlockProps = GalleryBlockType & {
  id?: string
}

// Fotografías auténticas organizadas por categorías temáticas de Nénufar
const CLIENTAS_IMAGES: GalleryImageItem[] = [
  {
    id: 'clienta-1',
    title: 'Okama Ceremonial en Lino',
    category: 'Clientas Felices',
    description: 'Una pieza tejida con más de 3.200 micro-mostacillas checas sobre atuendo de lino en Cartagena.',
    src: '/media/Embera-800x1000.webp',
    alt: 'Clienta de Nénufar luciendo collar Okama en Cartagena',
    isFeatured: true,
  },
  {
    id: 'clienta-2',
    title: 'Aretes Tricolor en Celebración',
    category: 'Momentos Especiales',
    description: 'Candongas livianas tejidas a mano complementando una ocasión inolvidable.',
    src: '/media/colombia-aretes-800x1000.webp',
    alt: 'Clienta luciendo aretes artesanales tricolor de Nénufar',
  },
  {
    id: 'clienta-3',
    title: 'Joya de Autor en la Piel',
    category: 'Diseño Vivo',
    description: 'La textura y el brillo de la mostacilla calibrada acompañando el día a día.',
    src: '/media/joya-1788320703397-800x1000.webp',
    alt: 'Clienta con pieza exclusiva de Shirley - Nénufar',
  },
  {
    id: 'clienta-4',
    title: 'Aretes Inspiración Café',
    category: 'Estilo Caribeño',
    description: 'Joyas con identidad de nuestra tierra colombiana.',
    src: '/media/cafe-aretes-1-800x1000.webp',
    alt: 'Clienta con aretes de café Nénufar',
  },
  {
    id: 'clienta-5',
    title: 'Candongas de Mostacilla Calibrada',
    category: 'Clientas Felices',
    description: 'Tejido circular con caída sutil y tonos tierra caribeños.',
    src: '/media/colombia-aretes-2-800x1000.webp',
    alt: 'Clienta con candongas Nénufar',
  },
  {
    id: 'clienta-6',
    title: 'Collar Colibrí en Ocasión Especial',
    category: 'Piezas Únicas',
    description: 'El colibrí de Nénufar destacando en un evento elegante.',
    src: '/media/colibri-1-800x1000.webp',
    alt: 'Clienta con collar de colibrí Nénufar',
  },
  {
    id: 'clienta-7',
    title: 'Diseño Ancestral en Celebración',
    category: 'Momentos Especiales',
    description: 'Aretes largos con flecos sutiles para una tarde en Cartagena.',
    src: '/media/joya-1788320381292-800x1000.webp',
    alt: 'Aretes de autor en clienta Nénufar',
  },
]

const FERIAS_IMAGES: GalleryImageItem[] = [
  {
    id: 'feria-1',
    title: 'Muestra en Feria de Diseño',
    category: 'Ferias & Pop-Ups',
    description: 'Stand de Nénufar en el corazón de Cartagena de Indias.',
    src: '/media/landing-1-800x1000.webp',
    alt: 'Puesto de Nénufar en feria de diseño de Cartagena',
    isFeatured: true,
  },
  {
    id: 'feria-2',
    title: 'Shirley Compartiendo su Oficio',
    category: 'Encuentros Locales',
    description: 'Conversaciones cercanas con quienes aprecian la joyería tejida a mano.',
    src: '/media/shirley-nenufar-1-800x1000.webp',
    alt: 'Shirley en feria artesanal en Cartagena',
  },
  {
    id: 'feria-3',
    title: 'Muestra de Piezas en Vivo',
    category: 'Mercados de Autor',
    description: 'Exhibición de nuevas combinaciones de color y diseños de temporada.',
    src: '/media/joya-1788385407531-800x1000.webp',
    alt: 'Muestra de joyas en mostacilla en feria local',
  },
  {
    id: 'feria-4',
    title: 'Pop-Up en el Centro Histórico',
    category: 'Ferias & Pop-Ups',
    description: 'Llevando la tradición de la mostacilla a viajeros y locales.',
    src: '/media/WhatsApp%20Image%202026-07-29%20at%2011.35.53%20PM-1-800x1000.webp',
    alt: 'Exhibición Pop-Up en Cartagena',
  },
  {
    id: 'feria-5',
    title: 'Exhibición de Collares y Aretes',
    category: 'Encuentros Locales',
    description: 'Presentación de collares ceremoniales y aretes botánicos.',
    src: '/media/image-landing1-800x1000.webp',
    alt: 'Exhibición de piezas en feria',
  },
  {
    id: 'feria-6',
    title: 'Encuentro con Amantes del Arte Textil',
    category: 'Mercados de Autor',
    description: 'Historias compartidas alrededor del telar manual.',
    src: '/media/landing-800x1000.webp',
    alt: 'Feria de diseño independiente',
  },
]

const TALLERES_IMAGES: GalleryImageItem[] = [
  {
    id: 'taller-1',
    title: 'Taller Vivencial de Comunidad',
    category: 'Talleres Presenciales',
    description: 'Mujeres reunidas en Getsemaní aprendiendo puntadas tradicionales de hilado.',
    src: '/media/talleres-comunidad-800x1000.webp',
    alt: 'Taller presencial de tejido de mostacilla con Shirley en Cartagena',
    isFeatured: true,
  },
  {
    id: 'taller-2',
    title: 'Primeras Creaciones Tejidas',
    category: 'Comunidad Creadora',
    description: 'La emoción de tejer una joya con tus propias manos y paciencia.',
    src: '/media/WhatsApp%20Image%202026-07-29%20at%2011.35.55%20PM%20(2)-800x1000.webp',
    alt: 'Piezas terminadas en el taller de tejido de Nénufar',
  },
  {
    id: 'taller-3',
    title: 'Herramientas & Hilos Calibrados',
    category: 'Oficio Tradicional',
    description: 'Compartiendo los secretos de la tensión del hilo y la selección de tonos.',
    src: '/media/Collar%20Naranja-800x1000.webp',
    alt: 'Detalle de hilado en clase práctica de mostacilla',
  },
  {
    id: 'taller-4',
    title: 'Clase Práctica de Enfilado',
    category: 'Talleres Presenciales',
    description: 'Enseñando los patrones ancestrales y la combinación cromática.',
    src: '/media/WhatsApp%20Image%202026-07-29%20at%2011.35.54%20PM-800x1000.webp',
    alt: 'Clase práctica de mostacilla en Cartagena',
  },
  {
    id: 'taller-5',
    title: 'Círculo de Tejedoras en Getsemaní',
    category: 'Comunidad Creadora',
    description: 'Un espacio de conversación, encuentro y arte ancestral.',
    src: '/media/WhatsApp%20Image%202026-07-29%20at%2011.35.53%20PM-2-800x1000.webp',
    alt: 'Círculo de tejedoras en taller',
  },
  {
    id: 'taller-6',
    title: 'Detalle de Puntadas y Paciencia',
    category: 'Oficio Tradicional',
    description: 'Hilado fino con aguja especial y micro-cuentas de vidrio checo.',
    src: '/media/WhatsApp%20Image%202026-07-29%20at%2011.35.53%20PM-800x1000.webp',
    alt: 'Detalle de tejido en taller Nénufar',
  },
]

const SHIRLEY_IMAGES: GalleryImageItem[] = [
  {
    id: 'shirley-1',
    title: 'Shirley en su Espacio Creador',
    category: 'Manos Creadoras',
    description: 'Dedicación y concentración en cada collar, elaborado de principio a fin por Shirley.',
    src: '/media/shirley-creadora-800x1000.webp',
    alt: 'Shirley tejiendo joyería artesanal en su taller de Cartagena',
    isFeatured: true,
  },
  {
    id: 'shirley-2',
    title: 'Prototipos y Flores Tejidas',
    category: 'Inspiración Caribe',
    description: 'Explorando nuevos patrones botánicos antes de cada colección.',
    src: '/media/Collar-flor-800x1000.webp',
    alt: 'Creación botánica en mostacilla en el taller de Shirley',
  },
  {
    id: 'shirley-3',
    title: 'Selección de Micro-Mostacillas',
    category: 'Detalle de Oficio',
    description: 'Cuentas checas seleccionadas una a una con aguja fina.',
    src: '/media/shirley-nenufar-800x1000.webp',
    alt: 'Shirley seleccionando mostacillas en su taller',
  },
  {
    id: 'shirley-4',
    title: 'Diseño Floral Caribeño',
    category: 'Creación Botánica',
    description: 'Aretes con motivos de piña y flores tropicales.',
    src: '/media/pinas-800x1000.webp',
    alt: 'Aretes de piña y flores',
  },
  {
    id: 'shirley-5',
    title: 'Colibrí Tejido a Mano',
    category: 'Piezas Únicas',
    description: 'Símbolo de nobleza, libertad y energía caribeña.',
    src: '/media/colibri-800x1000.webp',
    alt: 'Colibrí artesanal en mostacilla',
  },
  {
    id: 'shirley-6',
    title: 'Mesa de Hilado y Texturas',
    category: 'Rincón Íntimo',
    description: 'Tonos café, dorados y ocres listos para una nueva creación.',
    src: '/media/aretas-cafe-800x1000.webp',
    alt: 'Mesa de hilado en taller de Shirley',
  },
]

// Todas las fotos combinadas para la pestaña general
const ALL_IMAGES: GalleryImageItem[] = [
  ...CLIENTAS_IMAGES,
  ...FERIAS_IMAGES,
  ...TALLERES_IMAGES,
  ...SHIRLEY_IMAGES,
]

const DEFAULT_GALLERY_TABS: GalleryTabItem[] = [
  {
    tabTitle: 'Todas las Fotos',
    tabSubtitle: 'Colección visual completa de Nénufar',
    images: ALL_IMAGES,
  },
  {
    tabTitle: 'Nuestras Clientas',
    tabSubtitle: 'Mujeres reales vistiendo cada diseño',
    images: CLIENTAS_IMAGES,
  },
  {
    tabTitle: 'Ferias en Cartagena',
    tabSubtitle: 'Encuentros presenciales y pop-ups',
    images: FERIAS_IMAGES,
  },
  {
    tabTitle: 'Talleres de Tejido',
    tabSubtitle: 'El arte ancestral de la mostacilla',
    images: TALLERES_IMAGES,
  },
  {
    tabTitle: 'El Taller & Shirley',
    tabSubtitle: 'El espacio íntimo de creación en Getsemaní',
    images: SHIRLEY_IMAGES,
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
  return '/media/Embera-800x1000.webp'
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  tagline,
  heading,
  description,
  tabs,
  id,
}) => {
  // Procesar las pestañas recibidas de Payload o usar el catálogo enriquecido por defecto
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
      tagline={tagline ?? null}
      heading={heading ?? null}
      description={description ?? null}
      tabs={processedTabs}
      id={id || 'galeria'}
    />
  )
}
