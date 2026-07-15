import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'sessionCode',
    defaultColumns: ['sessionCode', 'productName', 'totalPrice', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'sessionCode',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'productName',
      type: 'text',
      required: true,
    },
    {
      name: 'price_cop',
      type: 'number',
      required: true,
    },
    {
      name: 'engraving',
      type: 'text',
    },
    {
      name: 'upsellAdded',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'upsellName',
      type: 'text',
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'PAID',
      options: [
        { label: 'Paid', value: 'PAID' },
        { label: 'Dispatched', value: 'DISPATCHED' },
        { label: 'Refunded', value: 'REFUNDED' },
      ],
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'wompiTransactionId',
      type: 'text',
    },
  ],
}
