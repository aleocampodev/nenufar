import { RequiredDataFromCollectionSlug } from 'payload'

export const homeStaticData: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      // @ts-ignore - slider type with slides is valid after migration, fallback to lowImpact if DB not yet migrated
      type: 'slider' as any,
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Nénufar — Joyería Artesanal',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Piezas únicas hechas a mano en Cartagena de Indias. Filigrana, plata y piedras naturales elaboradas con dedicación por Shirley.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      links: [
        {
          link: {
            type: 'custom',
            url: '/shop',
            label: 'Explorar Catálogo',
            appearance: 'default',
          },
        },
      ],
      // Slider slides - Krafti 3 editorial slides with high-res jewelry photography
      slides: [
        {
          heading: 'Joyas Tejidas con Alma Caribeña',
          subheading: 'Piezas únicas de mostacilla y filigrana tejidas pacientemente a mano en Cartagena de Indias.',
          linkLabel: 'Explorar Colección',
          linkUrl: '/shop',
          image: {
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&auto=format&fit=crop&q=85',
            alt: 'Joyería artesanal tejida a mano',
          } as any,
        },
        {
          heading: 'Filigrana y Mostacilla de Autor',
          subheading: 'Inspiración tradicional momposina con un diseño contemporáneo, liviano e hipoalergénico.',
          linkLabel: 'Ver Catálogo',
          linkUrl: '/shop',
          image: {
            url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&auto=format&fit=crop&q=85',
            alt: 'Piezas exclusivas de joyería artesanal',
          } as any,
        },
        {
          heading: 'Talleres que Tejen Comunidad',
          subheading: 'Aprende las técnicas ancestrales de tejido en nuestros talleres y experiencias presenciales.',
          linkLabel: 'Próximos Talleres',
          linkUrl: '/eventos',
          image: {
            url: 'https://images.unsplash.com/photo-1611591475102-4a00832049d5?w=1920&auto=format&fit=crop&q=85',
            alt: 'Talleres artesanales en Cartagena',
          } as any,
        },
      ] as any,
    },
    layout: [
      {
        blockType: 'features',
        tagline: 'Tradición y Delicadeza',
        heading: 'Por qué elegir Nenúfar Joyería',
        items: [
          {
            icon: 'handmade',
            title: 'HECHO A MANO',
            description: 'Cada pieza es elaborada a mano, hilo por hilo, siguiendo técnicas tradicionales de tejido en mostacilla.',
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
            description: 'Ninguna pieza es igual a otra: cada collar, arete o pulsera es una obra original, hecha para ti.',
          },
        ],
      },
      {
        blockType: 'imageStrip',
        images: [],
      },
      {
        blockType: 'testimonials',
        tagline: 'Voces de Nuestra Comunidad',
        heading: 'Lo que dicen quienes lucen Nenúfar',
        limit: 3,
      },
      {
        blockType: 'nenufarStory',
        tagline: 'Hecho a mano en Cartagena',
        heading: 'Nenúfar — Manos que tejen historias',
        image: null as any,
        linkLabel: 'Conocer la colección',
        linkUrl: '/shop',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Nenúfar nace en Cartagena de Indias de las manos de Shirley, artesana que teje mostacilla con la paciencia y el color del Caribe. Cada collar, pulsera y arete es una historia hecha a mano, con hilos de alta resistencia y mostacilla calibrada que garantiza brillo y duración.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Inspirada en la filigrana momposina y en los patios de Cartagena, Shirley crea piezas livianas, hipoalergénicas y llenas de significado — perfectas para regalar o para llevar un pedacito del Caribe contigo. En la mitad de esta historia estás tú, luciendo una pieza única.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        blockType: 'upcomingEvents',
        title: 'Próximas Ferias y Talleres en Cartagena',
        filterByType: 'todos',
        limit: 3,
      },
      {
        blockType: 'cta',
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '¿Buscas una joya personalizada?',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h2',
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Shirley confecciona joyas a tu medida con colores, piedras o grabados especiales. Escríbenos y coordinaremos directamente contigo.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        links: [
          {
            link: {
              type: 'custom',
              url: '/contacto',
              label: 'Personalizar mi Joya',
              appearance: 'default',
            },
          },
        ],
      },
    ],
    meta: {
      description: 'Joyería artesanal colombiana hecha a mano en Cartagena. Cada pieza cuenta una historia.',
      title: 'Nenúfar — Joyería Artesanal Colombiana',
    },
    title: 'Inicio',
  }
}
