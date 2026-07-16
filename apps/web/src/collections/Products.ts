import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'price_cop',
      type: 'number',
      required: true,
      admin: { description: 'Precio en pesos colombianos (COP)' },
    },
    { name: 'materials', type: 'text', hasMany: true },
    {
      name: 'images',
      type: 'array',
      fields: [{ name: 'url', type: 'text' }],
    },
    { name: 'available', type: 'checkbox', defaultValue: true },
    {
      name: 'handoff_ttl_hours',
      type: 'number',
      admin: { description: 'DEPRECATED — unused in v2.1' },
    },
    {
      name: 'is_upsell',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Unused in v2.1 — reserved for the agentic phase' },
    },
  ],
}