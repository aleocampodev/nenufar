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
      // Slider slides - placeholders (images added later by Shirley via /admin)
      slides: [
        {
          heading: 'Mostacilla con Alma Caribeña',
          subheading: 'Piezas únicas tejidas a mano en Cartagena, con la dedicación de Shirley.',
          linkLabel: 'Explorar Catálogo',
          linkUrl: '/shop',
          image: null as any,
        },
        {
          heading: 'Talleres que Tejen Comunidad',
          subheading: 'Aprende la técnica ancestral de la mostacilla en nuestros talleres presenciales.',
          linkLabel: 'Ver Talleres',
          linkUrl: '/eventos',
          image: null as any,
        },
        {
          heading: 'Ferias y Pop-ups en Cartagena',
          subheading: 'Encuéntranos en ferias artesanales y mercados locales. ¡Te esperamos!',
          linkLabel: 'Próximas Ferias',
          linkUrl: '/eventos',
          image: null as any,
        },
      ] as any,
    },
    layout: [
      {
        blockType: 'features',
        tagline: 'Tradición y Delicadeza',
        heading: 'Por qué elegir Nénufar Joyería',
        items: [
          {
            icon: 'handmade',
            title: '100% Hecho a Mano',
            description: 'Cada pieza es tejida pacientemente por Shirley en Cartagena con mostacilla calibrada de alta calidad.',
          },
          {
            icon: 'shipping',
            title: 'Envíos a Toda Colombia',
            description: 'Llegamos a tu ciudad con empaque seguro y seguimiento en tiempo real vía Telegram/WhatsApp.',
          },
          {
            icon: 'quality',
            title: 'Materiales Duraderos',
            description: 'Hilos de alta resistencia e insumos hipoalergénicos diseñados para durar y mantener su brillo.',
          },
          {
            icon: 'gift',
            title: 'Lista para Regalar',
            description: 'Todas nuestras joyas se envían en una presentación artesanal lista para sorprender a alguien especial.',
          },
        ],
      },
      {
        blockType: 'imageStrip',
        images: [],
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
        blockType: 'testimonials',
        tagline: 'Voces de Nuestra Comunidad',
        heading: 'Lo que dicen quienes lucen Nénufar',
        limit: 3,
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
                    text: '¿Buscas una pieza personalizada?',
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
                    text: 'Shirley confecciona joyas a tu medida con colores, grabados o piedras especiales. Arma tu pedido y te contactará directamente por WhatsApp.',
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
              label: 'Ver Catálogo Completo',
              appearance: 'default',
            },
          },
        ],
      },
    ],
    meta: {
      description: 'Joyería artesanal colombiana hecha a mano en Cartagena. Cada pieza cuenta una historia.',
      title: 'Nénufar — Joyería Artesanal Colombiana',
    },
    title: 'Inicio',
  }
}
