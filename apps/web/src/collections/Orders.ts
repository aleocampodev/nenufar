import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'sessionCode',
    defaultColumns: [
      'sessionCode',
      'customerName',
      'totalPrice',
      'status',
      'paymentMethod',
      'createdAt',
    ],
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
      admin: { description: 'Formato AX-XXXX (e.g. AX-H3B9)' },
    },
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerPhone', type: 'text' },
    { name: 'customerAddress', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        description:
          'Snapshot inmutable de nombre + precio al momento de crear el pedido',
      },
      fields: [
        { name: 'productId', type: 'text' },
        { name: 'name', type: 'text', required: true },
        { name: 'price_cop', type: 'number', required: true },
        { name: 'quantity', type: 'number', defaultValue: 1 },
      ],
    },
    { name: 'totalPrice', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'CHECKOUT_READY',
      required: true,
      options: [
        { label: 'Checkout Ready', value: 'CHECKOUT_READY' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Dispatched', value: 'DISPATCHED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Nequi', value: 'Nequi' },
        { label: 'Transferencia', value: 'Transferencia' },
        { label: 'Efectivo', value: 'Efectivo' },
      ],
    },
    { name: 'paidAt', type: 'date' },
    { name: 'dispatchedAt', type: 'date' },
  ],
}