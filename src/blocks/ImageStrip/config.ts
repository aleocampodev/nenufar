import type { Block } from "payload"

export const ImageStrip: Block = {
  slug: "imageStrip",
  interfaceName: "ImageStripBlock",
  labels: {
    singular: "Galería Ancestral de Okamas & Otapas",
    plural: "Galerías de Okamas & Otapas",
  },
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
    {
      name: "images",
      type: "array",
      label: "Tarjetas de Okamas & Otapas (4 recomendadas)",
      labels: {
        singular: "Tarjeta de Collar Ancestral",
        plural: "Tarjetas de Collares Ancestrales",
      },
      minRows: 1,
      maxRows: 8,
      defaultValue: [
        {
          category: "TRADICIÓN FEMENINA EMBERÁ",
          title: "El Okama Ceremonial",
          excerpt: "El camino sagrado que viste y abraza el cuello de la mujer.",
          imageUrl:
            "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop&q=80",
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
          excerpt: "Estructura geométrica que custodia el espíritu y narra los senderos de la selva.",
          imageUrl:
            "https://images.unsplash.com/photo-1611591475102-4a00832049d5?w=800&auto=format&fit=crop&q=80",
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
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80",
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
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
          storyMeaning:
            "Piezas nacidas de la inspiración pura de Shirley en Cartagena, fusionando la técnica milenaria Emberá con paletas de color inspiradas en los atardeceres y la arquitectura caribeña.",
          storyCraft:
            "Creaciones únicas sin réplica. Cuando una pieza encuentra dueña, su patrón queda cerrado para siempre como una obra de autor exclusiva.",
          storyFeel:
            "La certeza de llevar una obra de arte textil de colección que nadie más en el mundo tendrá igual. Ideal para celebrar momentos trascendentales.",
        },
      ],
      admin: {
        description:
          "Personaliza cada una de las 4 tarjetas. Puedes subir una foto propia o mantener la imagen por defecto.",
      },
      fields: [
        {
          name: "category",
          type: "text",
          label: "Etiqueta superior / Técnica (ej: TRADICIÓN FEMENINA EMBERÁ)",
        },
        {
          name: "title",
          type: "text",
          label: "Título de la pieza (ej: El Okama Ceremonial)",
        },
        {
          name: "excerpt",
          type: "text",
          label: "Frase gancho visible en la tarjeta",
        },
        {
          name: "image",
          type: "upload",
          label: "Foto de la pieza (subir archivo)",
          relationTo: "media",
          required: false,
          admin: {
            description: "Sube la foto del collar o pechera. Tiene prioridad sobre la URL.",
          },
        },
        {
          name: "imageUrl",
          type: "text",
          label: "O URL externa de foto (opcional)",
          admin: {
            description: "URL directa de la imagen (ej: Unsplash, CDN o enlace externo).",
          },
        },
        {
          name: "storyMeaning",
          type: "textarea",
          label: "1. Significado Sagrado & Tradición (Al expandir)",
        },
        {
          name: "storyCraft",
          type: "textarea",
          label: "2. El Arte del Tejido & Horas de Trabajo (Al expandir)",
        },
        {
          name: "storyFeel",
          type: "textarea",
          label: "3. Sensación al Lucirlo & Comodidad en Piel (Al expandir)",
        },
        {
          name: "alt",
          type: "text",
          label: "Texto alternativo para accesibilidad (opcional)",
        },
      ],
    },
  ],
}
