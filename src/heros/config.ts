import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: 'Fotos principales de la página',
  admin: {
    description: 'Aquí va el Carrusel de arriba de la landing. Déjalo en "Carrusel" y agrega las 3 fotos abajo.',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'slider',
      label: '¿Qué mostrar arriba?',
      admin: {
        description: 'Elige "Carrusel de 3 fotos" para la Inicio. Las otras opciones son solo texto y no las necesitas ahora.',
      },
      options: [
        {
          label: '✅ Carrusel de 3 fotos — (usa esto para la Inicio)',
          value: 'slider',
        },
        {
          label: '— Solo texto (sin fotos)',
          value: 'lowImpact',
        },
        {
          label: '— Texto + 1 foto',
          value: 'mediumImpact',
        },
        {
          label: '— Foto gigante a pantalla completa',
          value: 'highImpact',
        },
        {
          label: '— Nada (vacío)',
          value: 'none',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      admin: {
        condition: (_, { type } = {}) => type !== 'slider' && type !== 'none',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Texto (solo si NO usas carrusel)',
    },
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: {
          condition: (_, { type } = {}) => type !== 'slider' && type !== 'none',
        },
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: false,
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Fotos del carrusel (3 fotos que se deslizan)',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Agrega 3 fotos. Cada foto lleva su título y su botón. Si aún no tienes fotos, deja el degradado gris.',
      },
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: 'Imagen de fondo',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'heading',
          type: 'text',
          label: 'Título grande',
          required: true,
        },
        {
          name: 'subheading',
          type: 'textarea',
          label: 'Subtítulo',
        },
        {
          name: 'linkLabel',
          type: 'text',
          label: 'Texto del botón',
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'URL del botón',
          admin: {
            description: 'Ej: /shop, /eventos',
          },
        },
      ],
    },
  ],
  label: false,
}
