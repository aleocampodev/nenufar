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
      name: 'filterByType',
      type: 'select',
      label: 'Filtrar por tipo',
      defaultValue: 'todos',
      options: [
        { label: 'Todos', value: 'todos' },
        { label: 'Solo Ferias', value: 'feria' },
        { label: 'Solo Talleres', value: 'taller' },
        { label: 'Solo Pop-ups', value: 'pop-up' },
      ],
      admin: {
        description: 'Filtra qué tipo de eventos mostrar en la landing',
      },
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
