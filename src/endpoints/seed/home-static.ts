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
      badge: 'ALTA JOYERÍA ARTESANAL',
      heading: 'La nobleza del Caribe no se hereda.',
      headingHighlight: 'Se teje.',
      linkLabel: 'Conoce la colección',
      linkUrl: '/shop',
      socialLinks: {
        instagramUrl: 'https://www.instagram.com/nenufar.co/',
        whatsappUrl:
          'https://wa.me/?text=Hola%2C%20quisiera%20consultar%20sobre%20las%20joyas%20artesanales%20de%20N%C3%A9nufar',
        telegramUrl: 'https://t.me/',
      },
      // Slider slides - Krafti 3 editorial slides with high-res jewelry photography
      slides: [
        {
          badge: 'ALTA JOYERÍA ARTESANAL',
          heading: 'La nobleza del Caribe no se hereda. Se teje.',
          metaText: 'CARTAGENA DE INDIAS • TEJIDO ANCESTRAL • PIEZAS DE AUTOR',
          subheading:
            'Micro-mostacilla checa calibrada, tejida a mano con precisión milimétrica y la vibrante herencia del Caribe. Piezas de autor exclusivas diseñadas para elevar tu estilo con una joya irrepetible que cuenta una historia viva.',
          tabTitle: 'Herencia Caribeña',
          linkLabel: '',
          linkUrl: '',
          imagePosition: 'center',
          image: {
            url: '/landing-modify-traced.svg',
            alt: 'Mujer palenquera luciendo joyería en mostacilla Nénufar',
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
        tagline: 'COMUNIDAD & MOMENTOS REALES',
        heading: 'Nénufar en la Piel: Ferias, Talleres & Nuestras Clientas',
        description:
          'Fotografías espontáneas de ferias locales en Cartagena, talleres presenciales de tejido y nuestras queridas clientas luciendo sus joyas artesanales en la vida real.',
        tabs: [
          {
            tabTitle: 'Nuestras Clientas',
            tabSubtitle: 'Mujeres reales que visten y dan vida a cada diseño',
            images: [
              {
                title: 'Clienta luciendo Okama Ceremonial',
                category: 'Clientas Felices',
                description:
                  'Una pieza tejida con más de 3.200 micro-mostacillas checas sobre atuendo de lino en Cartagena.',
                imageUrl: '/api/media/file/Embera-800x1000.webp',
                isFeatured: true,
              },
              {
                title: 'Aretes Tricolor en Celebración',
                category: 'Momentos Especiales',
                description:
                  'Candongas livianas tejidas a mano complementando una ocasión inolvidable.',
                imageUrl: '/api/media/file/colombia-aretes-800x1000.webp',
                isFeatured: true,
              },
              {
                title: 'Joya de Autor en la Piel',
                category: 'Diseño Vivo',
                description:
                  'La textura y el brillo de la mostacilla calibrada acompañando el día a día.',
                imageUrl: '/api/media/file/joya-1788320703397-800x1000.webp',
              },
              {
                title: 'Aretes Inspiración Café',
                category: 'Estilo Caribeño',
                description:
                  'Joyas con identidad de nuestra tierra colombiana.',
                imageUrl: '/api/media/file/cafe-aretes-1-800x1000.webp',
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
                description:
                  'Encuentro con cartageneras y visitantes en el Parque de la Independencia.',
                imageUrl: '/api/media/file/Feria%20y%20talleres-800x1000.webp',
                isFeatured: true,
              },
              {
                title: 'Shirley Compartiendo su Oficio',
                category: 'Encuentros Locales',
                description:
                  'Conversaciones cercanas con quienes aprecian la joyería tejida a mano.',
                imageUrl: '/api/media/file/shirley-nenufar-1-800x1000.webp',
              },
              {
                title: 'Muestra de Piezas en Vivo',
                category: 'Mercados de Autor',
                description:
                  'Exhibición de nuevas combinaciones de color y diseños de temporada.',
                imageUrl: '/api/media/file/joya-1788385407531-800x1000.webp',
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
                description:
                  'Mujeres reunidas en Getsemaní aprendiendo puntadas tradicionales de hilado.',
                imageUrl: '/api/media/file/talleres-comunidad-800x1000.webp',
                isFeatured: true,
              },
              {
                title: 'Primeras Creaciones',
                category: 'Comunidad Creadora',
                description:
                  'La emoción de tejer una joya con tus propias manos y paciencia.',
                imageUrl:
                  '/api/media/file/WhatsApp%20Image%202026-07-29%20at%2011.35.55%20PM%20(2)-800x1000.webp',
              },
              {
                title: 'Herramientas & Hilos Calibrados',
                category: 'Oficio Tradicional',
                description:
                  'Compartiendo los secretos de la tensión del hilo y la selección de tonos.',
                imageUrl: '/api/media/file/Collar%20Naranja-800x1000.webp',
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
                description:
                  'Dedicación y concentración en cada collar, elaborado de principio a fin por Shirley.',
                imageUrl: '/api/media/file/shirley-creadora-800x1000.webp',
                isFeatured: true,
              },
              {
                title: 'Mesa de Hilado y Texturas',
                category: 'Detalle de Oficio',
                description:
                  'Cuentas checas seleccionadas una a una con aguja fina.',
                imageUrl: '/api/media/file/Collar%20ancestral-800x1000.webp',
              },
              {
                title: 'Prototipos y Flores Tejidas',
                category: 'Inspiración Caribe',
                description:
                  'Explorando nuevos patrones botánicos antes de cada feria.',
                imageUrl: '/api/media/file/Collar-flor-800x1000.webp',
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
