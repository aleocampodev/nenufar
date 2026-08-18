import type { Block } from 'payload'

export const UpcomingEventsBlock: Block = {
  slug: 'upcomingEvents',
  labels: {
    singular: 'Próximos Eventos',
    plural: 'Bloques de Eventos',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título de la sección',
      defaultValue: 'Próximos Eventos',
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Cantidad de eventos a mostrar',
      defaultValue: 3,
      min: 1,
      max: 6,
      admin: {
        description: 'Máximo 6 eventos en el home.',
      },
    },
  ],
}
