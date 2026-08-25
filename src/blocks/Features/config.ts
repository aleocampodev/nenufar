import type { Block } from 'payload'

export const FeaturesBlock: Block = {
  slug: 'features',
  labels: {
    singular: 'Bloque de Beneficios / Features',
    plural: 'Bloques de Beneficios / Features',
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      label: 'Subtítulo / Tagline',
      defaultValue: 'Tradición y Delicadeza',
      admin: {
        description: 'Texto pequeño en mayúsculas sobre el título',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título Principal',
      defaultValue: 'Por qué elegir Nenúfar Joyería',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Lista de Beneficios',
      minRows: 1,
      maxRows: 6,
      defaultValue: [
        {
          icon: 'handmade',
          title: '100% Hecho a Mano',
          description: 'Cada pieza es tejida pacientemente por Shirley en Cartagena con mostacilla calibrada de alta calidad.',
        },
        {
          icon: 'shipping',
          title: 'Envíos a Toda Colombia',
          description: 'Llegamos a tu ciudad con empaque seguro y seguimiento en tiempo real vía Telegram/WhatsApp.',
        },
        {
          icon: 'quality',
          title: 'Materiales Duraderos',
          description: 'Hilos de alta resistencia e insumos hipoalergénicos diseñados para durar y mantener su brillo.',
        },
        {
          icon: 'gift',
          title: 'Lista para Regalar',
          description: 'Todas nuestras joyas se envían en una presentación artesanal lista para sorprender a alguien especial.',
        },
      ],
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Ícono',
          defaultValue: 'handmade',
          options: [
            { label: 'Arte Manual / Tijeras / Manos', value: 'handmade' },
            { label: 'Envíos / Entrega rápida', value: 'shipping' },
            { label: 'Brillo / Calidad de materiales', value: 'quality' },
            { label: 'Empaque de Regalo', value: 'gift' },
            { label: 'Atención Personalizada', value: 'support' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Título',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Descripción',
          required: true,
        },
      ],
    },
  ],
}
