import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Galería de Creaciones (Lookbook)',
    plural: 'Bloques de Galería / Lookbook',
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      label: 'Subtítulo / Tagline superior',
      defaultValue: 'MUESTRARIO VISUAL & LOOKBOOK',
      admin: {
        description: 'Texto pequeño en mayúsculas sobre el título principal.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título de la Sección',
      defaultValue: 'Nénufar en la Piel: Arte y Color Caribeño',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción de la Galería',
      defaultValue:
        'Explora nuestras piezas tejidas a mano en Cartagena de Indias, el brillo de la micro-mostacilla checa calibrada y la fuerza del diseño ancestral lucido por mujeres reales.',
    },
    {
      name: 'tabs',
      type: 'array',
      label: 'Colecciones / Pestañas de la Galería',
      labels: {
        singular: 'Colección / Pestaña',
        plural: 'Colecciones / Pestañas',
      },
      minRows: 1,
      maxRows: 6,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'tabTitle',
          type: 'text',
          label: 'Nombre de la Colección (Pestaña)',
          required: true,
          admin: {
            description: 'Ej: Collares Ceremoniales, Aretes de Autor, El Taller, Momentos en Cartagena',
          },
        },
        {
          name: 'tabSubtitle',
          type: 'text',
          label: 'Subtítulo / Breve descripción del tab',
          admin: {
            description: 'Ej: Okamas y Otapas de tejido continuo Emberá',
          },
        },
        {
          name: 'images',
          type: 'array',
          label: 'Fotografías de esta Colección',
          labels: {
            singular: 'Fotografía',
            plural: 'Fotografías',
          },
          minRows: 1,
          maxRows: 10,
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              label: 'Archivo de Imagen (Media)',
              relationTo: 'media',
            },
            {
              name: 'imageUrl',
              type: 'text',
              label: 'URL directa de Imagen (opcional o de reserva)',
            },
            {
              name: 'title',
              type: 'text',
              label: 'Título de la Pieza o Momento',
              required: true,
            },
            {
              name: 'category',
              type: 'text',
              label: 'Categoría o Etiqueta',
              admin: {
                description: 'Ej: Okama Ceremonial, Pieza Única, Taller Shirley',
              },
            },
            {
              name: 'description',
              type: 'text',
              label: 'Detalle o descripción de la fotografía',
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              label: '¿Imagen destacada (más grande en la grilla)?',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}
