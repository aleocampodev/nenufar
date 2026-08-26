import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: {
    singular: 'Bloque de Testimonios',
    plural: 'Bloques de Testimonios',
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      label: 'Subtítulo / Tagline',
      defaultValue: 'Voces de Nuestra Comunidad',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título Principal',
      defaultValue: 'Lo que dicen quienes lucen Nenúfar',
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Límite de testimonios a mostrar',
      defaultValue: 3,
      min: 1,
      max: 12,
    },
  ],
}
