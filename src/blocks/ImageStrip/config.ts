import type { Block } from "payload"

export const ImageStrip: Block = {
  slug: "imageStrip",
  interfaceName: "ImageStripBlock",
  labels: {
    singular: "Galería Ancestral de Okamas & Otapas",
    plural: "Galerías de Okamas & Otapas",
  },
  admin: {
    description:
      "Tira continua Krafti de 4 imágenes de borde a borde con panel desplegable de historias sagradas y técnicas de tejido.",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Encabezado de la Sección",
          fields: [
            {
              name: "tagline",
              type: "text",
              label: "Subtítulo / Tagline superior",
              defaultValue: "LEGADO VIVO · COSMOVISIÓN EMBERÁ",
              admin: {
                description: "Texto pequeño en mayúsculas sobre el título principal.",
              },
            },
            {
              name: "heading",
              type: "text",
              label: "Título de la Sección",
              defaultValue: "El Universo Ancestral de los Okamas & Otapas",
            },
            {
              name: "description",
              type: "textarea",
              label: "Descripción de la Sección (opcional)",
              defaultValue:
                "Cada collar es un lienzo sagrado donde miles de micro-mostacillas tejidas a mano por Shirley narran la dignidad de la mujer, los ríos y los senderos sagrados de nuestra tierra.",
            },
          ],
        },
        {
          label: "Tarjetas Ancestrales (4 Piezas)",
          fields: [
            {
              name: "images",
              type: "array",
              label: "Colección de 4 Piezas",
              labels: {
                singular: "Pieza Ancestral",
                plural: "Piezas Ancestrales",
              },
              minRows: 1,
              maxRows: 8,
              admin: {
                initCollapsed: true,
                description:
                  "Gestiona cada una de las 4 imágenes continuas. Al tocarlas en la tienda, revelarán su historia sagrada y técnica.",
              },
              defaultValue: [
                {
                  category: "TRADICIÓN FEMENINA EMBERÁ",
                  title: "El Okama Ceremonial",
                  excerpt: "El camino sagrado que viste y abraza el cuello de la mujer con la dignidad del pueblo Emberá.",
                  imageUrl:
                    "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Embera.jpeg",
                  storyMeaning:
                    "En lengua Emberá, Okama significa literalmente \"camino que recorre el cuello\". Es el collar más sagrado de la mujer indígena: comunica su madurez, dignidad y conexión profunda con las aguas de los ríos y los ciclos de la luna.",
                  storyCraft:
                    "Más de 3.200 micro-mostacillas checas calibradas, hiladas a mano una por una durante 20 a 30 horas de concentración absoluta.",
                  storyFeel:
                    "Caída anatómica flexible que se amolda al pecho como una segunda piel. Colores vivos que no pierden su brillo con el tiempo.",
                },
                {
                  category: "COSMOVISIÓN & PODER",
                  title: "La Otapa Ancestral",
                  excerpt: "Estructura geométrica de rombos y senderos de selva que custodia el espíritu.",
                  imageUrl:
                    "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/collar-ancestral.jpg",
                  storyMeaning:
                    "La Otapa es la expresión geométrica del linaje ancestral. Sus patrones en zigzag y rombos representan los senderos de la montaña, la piel protectora de la serpiente sagrada y un escudo contra las malas energías.",
                  storyCraft:
                    "Tejida con hilo encerado técnico de alta resistencia que mantiene una estructura firme e imponente que no se deforma ni se dobla al vestirla.",
                  storyFeel:
                    "Una joya majestuosa con presencia imponente que convierte cualquier atuendo en una declaración de arte e identidad cultural.",
                },
                {
                  category: "ELEGANCIA CONTEMPORÁNEA",
                  title: "El Okama Contemporáneo",
                  excerpt: "La magia del tejido Emberá adaptada a un formato liviano para cada día.",
                  imageUrl:
                    "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/Collar-flor.jpeg",
                  storyMeaning:
                    "Creado para la mujer que desea portar la fuerza del tejido indígena en su rutina diaria (reuniones, salidas casuales o eventos formales) sin recurrir a formatos ceremoniales gigantes.",
                  storyCraft:
                    "Diseños depurados que condensan la geometría sagrada en cuellos delgados, cómodos y de alta definición estética.",
                  storyFeel:
                    "Ultraliviano (se siente como un pañuelo de seda sobre la piel). Cierres hipoalergénicos que no irritan el cuello ni enredan el cabello.",
                },
                {
                  category: "ALTA COSTURA ARTESANAL",
                  title: "La Otapa de Autor",
                  excerpt: "Obras de arte textil irrepetibles: nacen una sola vez y no vuelven a existir igual.",
                  imageUrl:
                    "https://kbzfhqmagzmtlgtolioa.supabase.co/storage/v1/object/public/media/colombia-aretes.jpeg",
                  storyMeaning:
                    "Piezas nacidas de la inspiración pura de Shirley en Cartagena, fusionando la técnica milenaria Emberá con paletas de color inspiradas en los atardeceres y la arquitectura caribeña.",
                  storyCraft:
                    "Creaciones únicas sin réplica. Cuando una pieza encuentra dueña, su patrón queda cerrado para siempre como una obra de autor exclusiva.",
                  storyFeel:
                    "La certeza de llevar una obra de arte textil de colección que nadie más en el mundo tendrá igual. Ideal para celebrar momentos trascendentales.",
                },
              ],
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "title",
                      type: "text",
                      label: "Nombre de la joya (ej: El Okama Ceremonial)",
                      required: true,
                      admin: { width: "50%" },
                    },
                    {
                      name: "category",
                      type: "text",
                      label: "Técnica / Categoría (ej: TRADICIÓN FEMENINA EMBERÁ)",
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  name: "excerpt",
                  type: "text",
                  label: "Frase gancho visible sobre la foto",
                  admin: {
                    description: "Texto breve visible en la tarjeta antes de expandir.",
                  },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "image",
                      type: "upload",
                      label: "Foto de la joya (Subir archivo)",
                      relationTo: "media",
                      admin: { width: "50%" },
                    },
                    {
                      name: "imageUrl",
                      type: "text",
                      label: "O URL de imagen externa",
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  type: "collapsible",
                  label: "Narrativa Sagrada & Técnica (Contenido al expandir)",
                  admin: {
                    initCollapsed: false,
                  },
                  fields: [
                    {
                      name: "storyMeaning",
                      type: "textarea",
                      label: "1. Simbología Sagrada & Tradición",
                      admin: {
                        description: "Significado cultural según la cosmovisión indígena.",
                      },
                    },
                    {
                      name: "storyCraft",
                      type: "textarea",
                      label: "2. El Arte del Tejido & Horas de Trabajo",
                      admin: {
                        description: "Horas de hilado, cantidad de mostacillas y paciencia.",
                      },
                    },
                    {
                      name: "storyFeel",
                      type: "textarea",
                      label: "3. Sensación al Lucirlo & Comodidad en Piel",
                      admin: {
                        description: "Cómo cae en el cuerpo, peso pluma y cierres hipoalergénicos.",
                      },
                    },
                  ],
                },
                {
                  name: "alt",
                  type: "text",
                  label: "Texto alternativo de la imagen (SEO / Accesibilidad)",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
