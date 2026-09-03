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
                  text: 'Nenúfar — Joyería Artesanal',
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
                  text: 'Piezas de autor tejidas a mano en Cartagena de Indias. Geometría sagrada Emberá y micro-mostacilla checa calibrada elaboradas con dedicación por Shirley.',
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
          badge: 'COLECCIÓN DESTACADA',
          heading: 'Mostacilla con Alma Caribeña',
          metaText: 'CARTAGENA DE INDIAS • TEJIDO EMBERÁ • PIEZAS DE AUTOR',
          subheading: 'Piezas únicas tejidas a mano en Cartagena, con la dedicación y maestría de Shirley.',
          tabTitle: 'Mostacilla Caribeña',
          linkLabel: 'Explorar Catálogo',
          linkUrl: '/shop',
          imagePosition: 'top',
          image: {
            url: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg',
            alt: 'Mostacilla con Alma Caribeña - Collar Ancestral',
          } as any,
        },
        {
          badge: 'EXPERIENCIAS Y APRENDIZAJE',
          heading: 'Talleres que Tejen Comunidad',
          metaText: 'CARTAGENA • TÉCNICA ANCESTRAL • GRUPOS REDUCIDOS',
          subheading: 'Aprende la técnica ancestral de la mostacilla en nuestros talleres presenciales guiados por Shirley.',
          tabTitle: 'Talleres & Comunidad',
          linkLabel: 'Ver Talleres',
          linkUrl: '/eventos',
          imagePosition: 'top',
          image: {
            url: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/talleres-comunidad.jpeg',
            alt: 'Talleres que Tejen Comunidad - Shirley Nénufar',
          } as any,
        },
        {
          badge: 'ENCUENTROS PRESENCIALES',
          heading: 'Ferias y Pop-ups en Cartagena',
          metaText: 'CENTRO HISTÓRICO • GETSEMANÍ • EDICIONES DE TEMPORADA',
          subheading: 'Encuéntranos en ferias artesanales y mercados locales de diseño. ¡Ven a conocer nuestras piezas en vivo!',
          tabTitle: 'Ferias & Pop-ups',
          linkLabel: 'Próximas Ferias',
          linkUrl: '/eventos',
          imagePosition: 'top',
          image: {
            url: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/feria-y-talleres.jpg',
            alt: 'Ferias y Pop-ups en Cartagena',
          } as any,
        },
      ] as any,
    },
    layout: [
      {
        blockType: 'nenufarStory',
        tagline: 'Hecho a mano en Cartagena',
        heading: 'Nénufar — Manos que tejen historias',
        image: {
          url: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/shirley-creadora.jpeg',
          alt: 'Shirley tejiendo joyería en mostacilla en su taller',
        } as any,
        linkLabel: 'Explorar Catálogo',
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
                    text: 'Nénufar nace en Cartagena de Indias de las manos de Shirley, artesana que teje mostacilla con la paciencia y el color del Caribe. Cada collar ceremonial, okama y otapa es una historia tejida a mano, con hilos de alta resistencia y micro-mostacilla checa calibrada que garantiza brillo y duración.',
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
                    text: 'Inspirada en los tejidos sagrados del pueblo Emberá y en la luminosidad del Caribe, Shirley crea collares pectorales majestuosos, livianos e hipoalergénicos — piezas que conectan la memoria ancestral con la mujer contemporánea.',
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
        blockType: 'imageStrip',
        tagline: 'LEGADO VIVO · COSMOVISIÓN EMBERÁ',
        heading: 'El Universo Ancestral de los Okamas & Otapas',
        description:
          'Cada collar es un lienzo sagrado donde miles de micro-mostacillas tejidas a mano por Shirley narran la dignidad de la mujer, los ríos y los senderos sagrados de nuestra tierra.',
        images: [
          {
            category: 'TRADICIÓN FEMENINA EMBERÁ',
            title: 'El Okama Ceremonial',
            excerpt: 'El camino sagrado que viste y abraza el cuello de la mujer.',
            imageUrl:
              'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg',
            storyMeaning:
              'En lengua Emberá, Okama significa literalmente "camino que recorre el cuello". Es el collar más sagrado de la mujer indígena: comunica su madurez, dignidad y conexión profunda con las aguas de los ríos y los ciclos de la luna.',
            storyCraft:
              'Más de 3.200 micro-mostacillas checas calibradas, hiladas a mano una por una durante 20 a 30 horas de concentración absoluta.',
            storyFeel:
              'Caída anatómica flexible que se amolda al pecho como una segunda piel. Colores vivos que no pierden su brillo con el tiempo.',
          },
          {
            category: 'COSMOVISIÓN & PODER',
            title: 'La Otapa Ancestral',
            excerpt: 'Estructura geométrica que custodia el espíritu y narra los senderos de la selva.',
            imageUrl:
              'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-narana.jpg',
            storyMeaning:
              'La Otapa es la expresión geométrica del linaje ancestral. Sus patrones en zigzag y rombos representan los senderos de la montaña, la piel protectora de la serpiente sagrada y un escudo contra las malas energías.',
            storyCraft:
              'Tejida con hilo encerado técnico de alta resistencia que mantiene una estructura firme e imponente que no se deforma ni se dobla al vestirla.',
            storyFeel:
              'Una joya majestuosa con presencia imponente que convierte cualquier atuendo en una declaración de arte e identidad cultural.',
          },
          {
            category: 'ELEGANCIA CONTEMPORÁNEA',
            title: 'El Okama Contemporáneo',
            excerpt: 'La magia del tejido Emberá adaptada a un formato liviano para cada día.',
            imageUrl:
              'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg',
            storyMeaning:
              'Creado para la mujer que desea portar la fuerza del tejido indígena en su rutina diaria (reuniones, salidas casuales o eventos formales) sin recurrir a formatos ceremoniales gigantes.',
            storyCraft:
              'Diseños depurados que condensan la geometría sagrada en cuellos delgados, cómodos y de alta definición estética.',
            storyFeel:
              'Ultraliviano (se siente como un pañuelo de seda sobre la piel). Cierres hipoalergénicos que no irritan el cuello ni enredan el cabello.',
          },
          {
            category: 'ALTA COSTURA ARTESANAL',
            title: 'La Otapa de Autor',
            excerpt: 'Obras de arte textil irrepetibles: nacen una sola vez y no vuelven a existir igual.',
            imageUrl:
              'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/colombia-aretes.jpeg',
            storyMeaning:
              'Piezas nacidas de la inspiración pura de Shirley en Cartagena, fusionando la técnica milenaria Emberá con paletas de color inspiradas en los atardeceres y la arquitectura caribeña.',
            storyCraft:
              'Creaciones únicas sin réplica. Cuando una pieza encuentra dueña, su patrón queda cerrado para siempre como una obra de autor exclusiva.',
            storyFeel:
              'La certeza de llevar una obra de arte textil de colección que nadie más en el mundo tendrá igual. Ideal para celebrar momentos trascendentales.',
          },
        ] as any,
      },
      {
        blockType: 'features',
        tagline: 'Tradición y Delicadeza',
        heading: 'El Rigor y la Paciencia de Nuestro Oficio',
        centerImage: {
          url: 'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/colombia-aretes.jpeg',
          alt: 'Joyería artesanal en mostacilla tejida a mano - Nénufar',
        } as any,
        items: [
          {
            icon: 'handmade',
            title: 'HECHO A MANO',
            description:
              'Cada pieza es elaborada a mano por Shirley, hilando cada micro-mostacilla con paciencia y técnicas tradicionales.',
          },
          {
            icon: 'ancestral',
            title: 'DISEÑO ANCESTRAL',
            description:
              'Inspirados en la geometría sagrada y los Okamas del pueblo Emberá, cada diseño porta un significado sagrado.',
          },
          {
            icon: 'colors',
            title: 'MOSTACILLA CALIBRADA',
            description:
              'Micro-mostacilla checa de máxima calidad e hilos de alta resistencia pensados para durar toda la vida.',
          },
          {
            icon: 'unique',
            title: 'PIEZAS DE COLECCIÓN',
            description:
              'Ninguna pieza es igual a otra: cada collar ceremonial o gargantilla es una obra original e irrepetible.',
          },
        ],
      },
      {
        blockType: 'gallery' as any,
        tagline: 'MUESTRARIO VISUAL & LOOKBOOK',
        heading: 'Nénufar en la Piel: Arte y Color Caribeño',
        description:
          'Explora nuestras piezas tejidas a mano en Cartagena de Indias, el brillo de la micro-mostacilla checa calibrada y la fuerza del diseño ancestral lucido por mujeres reales.',
        tabs: [
          {
            tabTitle: 'Collares Ceremoniales',
            tabSubtitle: 'Okamas y Otapas de tejido continuo Emberá',
            images: [
              {
                title: 'El Okama Ceremonial',
                category: 'Pieza Ancestral',
                description:
                  'Más de 3.200 micro-mostacillas checas hiladas a mano en Cartagena. Caída anatómica sobre el pecho.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg',
                isFeatured: true,
              },
              {
                title: 'La Otapa Ancestral Naranja',
                category: 'Geometría Sagrada',
                description:
                  'Patrones en rombo que representan los senderos de la montaña y la protección del linaje.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-narana.jpg',
              },
              {
                title: 'Okama Contemporáneo Flor',
                category: 'Diseño de Autor',
                description:
                  'Elegancia liviana adaptada al uso diario con motivos florales de la naturaleza caribeña.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg',
              },
              {
                title: 'Collar Ancestral Macro',
                category: 'Detalle de Oficio',
                description:
                  'Micro-mostacilla checa calibrada que garantiza un brillo homogéneo y una textura inalterable.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg',
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
                description:
                  'Inspiradas en los colores vivos de Cartagena. Caída suave que no pesa ni maltrata el lóbulo.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/colombia-aretes.jpeg',
                isFeatured: true,
              },
              {
                title: 'Gargantilla & Aretes Geométricos',
                category: 'Juego de Gala',
                description:
                  'Conjunto simétrico en mostacilla tejida con herrajes hipoalergénicos.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg',
              },
              {
                title: 'Detalle de Hilado en Mostacilla',
                category: 'Textura & Brillo',
                description:
                  'Hilo encerado de alta tenacidad que evita deformaciones con el tiempo.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg',
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
                description:
                  'Concentración y maestría en cada puntada. Shirley elabora cada joya de forma individual en Cartagena.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/shirley-creadora.jpeg',
                isFeatured: true,
              },
              {
                title: 'Talleres Presenciales',
                category: 'Comunidad & Oficio',
                description:
                  'Transmitiendo el conocimiento ancestral a mujeres que desean aprender este arte tradicional.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/talleres-comunidad.jpeg',
              },
              {
                title: 'Mesa de Trabajo & Calibración',
                category: 'Herramientas',
                description:
                  'Miles de cuentas checas seleccionadas por tono y calibre milimétrico.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-narana.jpg',
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
                description:
                  'Exhibiciones en el Centro Histórico y Getsemaní donde visitantes conocen las piezas en persona.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/feria-y-talleres.jpg',
                isFeatured: true,
              },
              {
                title: 'Piezas que Visten la Ciudad',
                category: 'Estilo Caribeño',
                description:
                  'Joyas que complementan atuendos de lino y celebraciones junto al mar.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg',
              },
              {
                title: 'Comunidad Tejedora',
                category: 'Cultura Viva',
                description:
                  'Encuentros donde la memoria ancestral se entrelaza con la mujer moderna.',
                imageUrl:
                  'https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/talleres-comunidad.jpeg',
              },
            ],
          },
        ] as any,
      },
      {
        blockType: 'testimonials',
        tagline: 'Voces de Nuestra Comunidad',
        heading: 'Lo que dicen quienes lucen Nenúfar',
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
              url: 'https://wa.me/?text=Hola%20Shirley%2C%20me%20gustar%C3%ADa%20encargar%20una%20joya%20personalizada%20a%20mi%20medida%20%E2%9C%A8',
              label: 'Personalizar mi Joya',
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
