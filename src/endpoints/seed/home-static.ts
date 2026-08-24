import { RequiredDataFromCollectionSlug } from 'payload'

export const homeStaticData: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'lowImpact',
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
    },
    layout: [
      {
        blockType: 'upcomingEvents',
        title: 'Próximas Ferias y Pop-ups en Cartagena',
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
