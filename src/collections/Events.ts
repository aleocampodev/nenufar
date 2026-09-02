import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Evento / Feria',
    plural: 'Eventos y Ferias',
  },
  admin: {
    hidden: true,
    group: 'Contenido Web',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'location', '_status'],
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Tipo',
      required: true,
      defaultValue: 'feria',
      options: [
        { label: 'Taller', value: 'taller' },
        { label: 'Feria', value: 'feria' },
        { label: 'Pop-up', value: 'pop-up' },
      ],
      admin: {
        description: 'Taller artesanal o feria',
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Nombre del evento',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      label: 'Fecha',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy — HH:mm',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Fecha de cierre (opcional)',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy — HH:mm',
        },
        position: 'sidebar',
        description: 'Solo si el evento dura más de un día.',
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Lugar',
      admin: {
        description: 'Ej: Cartagena — Centro Histórico, Feria Artesanal Medellín, Online',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Foto del evento',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
      admin: {
        description: 'Breve descripción del evento para el sitio.',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link externo (opcional)',
      admin: {
        description: 'Si hay una página o registro externo del evento.',
      },
    },
  ],
}
