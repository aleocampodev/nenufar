import type { CollectionConfig } from 'payload'
import { syncProductEmbedding, deleteProductEmbedding } from './Products/hooks'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    afterChange: [syncProductEmbedding],
    afterDelete: [deleteProductEmbedding],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'price_cop',
      type: 'number',
      required: true,
    },
    {
      name: 'materials',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'handoff_ttl_hours',
      type: 'number',
      admin: {
        description: 'Optional override for handoff TTL in hours.',
      },
    },
  ],
}
