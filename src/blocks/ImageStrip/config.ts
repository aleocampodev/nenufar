import type { Block } from 'payload'

export const ImageStrip: Block = {
  slug: 'imageStrip',
  interfaceName: 'ImageStripBlock',
  labels: {
    singular: 'Tira de Imágenes (Krafti)',
    plural: 'Tiras de Imágenes',
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Imágenes (4 en fila, estilo Krafti)',
      minRows: 1,
      maxRows: 4,
      admin: {
        description: '4 fotos en fila completa, sin separación. Ideal para mostrar taller, proceso, piezas.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: 'Foto',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Texto alternativo (opcional)',
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Enlace al hacer clic (opcional)',
          admin: { description: 'Ej: /shop, /sobre-nenufar' },
        },
      ],
    },
  ],
}
