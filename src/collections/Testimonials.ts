import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonio',
    plural: 'Testimonios',
  },
  admin: {
    hidden: true,
    group: 'Contenido Web',
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'quote', '_status', 'updatedAt'],
    description: 'Testimonios de compradoras con foto real para la landing',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      label: 'Testimonio',
      required: true,
      admin: {
        description: 'Cita textual de la compradora',
      },
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'authorRole',
      type: 'text',
      label: 'Rol / Ciudad (opcional)',
      admin: {
        description: 'Ej: Diseñadora, Cartagena — Barranquilla',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      label: 'Foto real (opcional)',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Foto de la compradora o captura (opcional)',
      },
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Calificación (1-5)',
      min: 1,
      max: 5,
      admin: {
        description: 'Opcional — 1 a 5 estrellas',
        step: 1,
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado',
      defaultValue: false,
    },
  ],
}
