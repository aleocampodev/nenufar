import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: {
    singular: '4. Testimonios de Clientas',
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
    {
      name: 'items',
      type: 'array',
      label: 'Lista de Testimonios',
      labels: {
        singular: 'Testimonio',
        plural: 'Testimonios',
      },
      minRows: 1,
      maxRows: 12,
      defaultValue: [
        {
          authorName: 'María José',
          authorRole: 'CARTAGENA',
          quote: '“Mi collar de mostacilla es una obra de arte. Se nota el amor y la dedicación en cada detalle. ¡Shirley es una artista!”',
          rating: 5,
        },
        {
          authorName: 'Laura V.',
          authorRole: 'BOGOTÁ',
          quote: '“El empaque es hermoso y el envío llegó perfecto. Mis aretes son cómodos y brillan muchísimo.”',
          rating: 5,
        },
        {
          authorName: 'Camila R.',
          authorRole: 'MEDELLÍN — TALLER',
          quote: '“Tomé el taller de mostacilla y fue una experiencia hermosa. Aprendí mucho y me llevé mi primera pulsera.”',
          rating: 5,
        },
      ],
      fields: [
        {
          name: 'authorName',
          type: 'text',
          label: 'Nombre del Cliente',
          required: true,
        },
        {
          name: 'authorRole',
          type: 'text',
          label: 'Ciudad / Rol (ej: CARTAGENA)',
        },
        {
          name: 'quote',
          type: 'textarea',
          label: 'Testimonio / Opinión',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Calificación (1 a 5 estrellas)',
          defaultValue: 5,
          min: 1,
          max: 5,
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto de perfil (opcional)',
        },
      ],
    },
  ],
}
