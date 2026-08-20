import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    group: 'Contenido',
    // Fuera del storefront actual (landing + ecommerce) — oculto, no eliminado
    hidden: true,
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
