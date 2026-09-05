import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Galería de Momentos & Eventos (Clientas, Ferias y Talleres)',
    plural: 'Bloques de Galería y Comunidad',
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      label: 'Subtítulo / Tagline superior',
      admin: {
        description: 'Texto opcional en mayúsculas sobre el título principal.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título de la Sección',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción de la Galería',
    },
    {
      name: 'tabs',
      type: 'array',
      label: 'Pestañas de Momentos & Eventos',
      labels: {
        singular: 'Categoría de Momentos',
        plural: 'Categorías de Momentos',
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
          label: 'Título de la Pestaña',
          required: true,
          admin: {
            description: 'Ej: Nuestras Clientas, Ferias en Cartagena, Talleres de Tejido, El Taller & Shirley',
          },
        },
        {
          name: 'tabSubtitle',
          type: 'text',
          label: 'Subtítulo / Breve descripción del tab',
          admin: {
            description: 'Ej: Mujeres reales que visten y dan vida a cada diseño',
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
