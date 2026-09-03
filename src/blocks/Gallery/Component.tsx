import type { Media as MediaType, GalleryBlock as GalleryBlockType } from '@/payload-types'
import { GalleryClient, type GalleryTabItem, type GalleryImageItem } from './GalleryClient'

export type GalleryBlockProps = GalleryBlockType & {
  id?: string
}

// Datos fotográficos auténticos de Nénufar con imágenes de Supabase
const DEFAULT_GALLERY_TABS: GalleryTabItem[] = [
  {
    tabTitle: 'Collares Ceremoniales',
    tabSubtitle: 'Okamas y Otapas de tejido continuo Emberá',
    images: [
      {
        title: 'El Okama Ceremonial',
        category: 'Pieza Ancestral',
        description: 'Más de 3.200 micro-mostacillas checas hiladas a mano en Cartagena. Caída anatómica sobre el pecho.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg',
        alt: 'Okama Ceremonial en mostacilla tejida por Shirley - Nénufar',
        isFeatured: true,
      },
      {
        title: 'La Otapa Ancestral Naranja',
        category: 'Geometría Sagrada',
        description: 'Patrones en rombo que representan los senderos de la montaña y la protección del linaje.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-narana.jpg',
        alt: 'Otapa ancestral tejida a mano en mostacilla naranja - Nénufar',
      },
      {
        title: 'Okama Contemporáneo Flor',
        category: 'Diseño de Autor',
        description: 'Elegancia liviana adaptada al uso diario con motivos florales de la naturaleza caribeña.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg',
        alt: 'Okama contemporáneo flor tejido a mano - Nénufar',
      },
      {
        title: 'Collar Ancestral Macro',
        category: 'Detalle de Oficio',
        description: 'Micro-mostacilla checa calibrada que garantiza un brillo homogéneo y una textura inalterable.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg',
        alt: 'Detalle de tejido en micro-mostacilla checa - Nénufar',
      },
    ],
  },
  {
    tabTitle: 'Aretes & Candongas',
    tabSubtitle: 'Obras de arte textil livianas e hipoalergénicas',
    images: [
      {
        title: 'Candongas de Autor Tricolor',
        category: 'Piezas de Colección',
        description: 'Inspiradas en los colores vivos de Cartagena. Caída suave que no pesa ni maltrata el lóbulo.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/colombia-aretes.jpeg',
        alt: 'Aretes y candongas de autor en mostacilla tejida - Nénufar',
        isFeatured: true,
      },
      {
        title: 'Gargantilla & Aretes Geométricos',
        category: 'Juego de Gala',
        description: 'Conjunto simétrico en mostacilla tejida con herrajes hipoalergénicos.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg',
        alt: 'Juego de aretes y gargantilla artesanal - Nénufar',
      },
      {
        title: 'Detalle de Hilado en Mostacilla',
        category: 'Textura & Brillo',
        description: 'Hilo encerado de alta tenacidad que evita deformaciones con el tiempo.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg',
        alt: 'Detalle del hilado de joyas en Cartagena - Nénufar',
      },
    ],
  },
  {
    tabTitle: 'El Taller de Shirley',
    tabSubtitle: 'Manos pacientes que dan vida a cada historia',
    images: [
      {
        title: 'Shirley en su Taller',
        category: 'Manos Creadoras',
        description: 'Concentración y maestría en cada puntada. Shirley elabora cada joya de forma individual en Cartagena.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/shirley-creadora.jpeg',
        alt: 'Shirley tejiendo joyería en mostacilla en su taller de Cartagena',
        isFeatured: true,
      },
      {
        title: 'Talleres Presenciales',
        category: 'Comunidad & Oficio',
        description: 'Transmitiendo el conocimiento ancestral a mujeres que desean aprender este arte tradicional.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/talleres-comunidad.jpeg',
        alt: 'Taller presencial de tejido en mostacilla guiado por Shirley',
      },
      {
        title: 'Mesa de Trabajo & Calibración',
        category: 'Herramientas',
        description: 'Miles de cuentas checas seleccionadas por tono y calibre milimétrico.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-narana.jpg',
        alt: 'Mesa de diseño y tejido en mostacilla',
      },
    ],
  },
  {
    tabTitle: 'Nénufar en Cartagena',
    tabSubtitle: 'Ferias de diseño, pop-ups y encuentros locales',
    images: [
      {
        title: 'Ferias y Mercados de Autor',
        category: 'Encuentros',
        description: 'Exhibiciones en el Centro Histórico y Getsemaní donde visitantes conocen las piezas en persona.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/feria-y-talleres.jpg',
        alt: 'Stand de Nénufar en feria artesanal de Cartagena',
        isFeatured: true,
      },
      {
        title: 'Piezas que Visten la Ciudad',
        category: 'Estilo Caribeño',
        description: 'Joyas que complementan atuendos de lino y celebraciones junto al mar.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg',
        alt: 'Joyería Nénufar lucida en Cartagena de Indias',
      },
      {
        title: 'Comunidad Tejedora',
        category: 'Cultura Viva',
        description: 'Encuentros donde la memoria ancestral se entrelaza con la mujer moderna.',
        src: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/talleres-comunidad.jpeg',
        alt: 'Encuentro comunitario y aprendizaje artesanal',
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
