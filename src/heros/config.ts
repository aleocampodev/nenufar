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
  label: 'Encabezado (Hero)',
  admin: {
    description: 'Elige cómo se ve la parte superior de la página. Para la landing usa "Carrusel".',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'slider',
      label: 'Tipo de encabezado',
      admin: {
        description: 'Carrusel = 3 imágenes deslizables (recomendado para la landing). Los demás son solo texto/imagen estática.',
      },
      options: [
        {
          label: 'Carrusel (Krafti) — Recomendado ⭐',
          value: 'slider',
        },
        {
          label: 'Ninguno (sin encabezado)',
          value: 'none',
        },
        {
          label: 'Impacto Bajo — Solo texto + botón',
          value: 'lowImpact',
        },
        {
          label: 'Impacto Medio — Texto + imagen',
          value: 'mediumImpact',
        },
        {
          label: 'Impacto Alto — Pantalla completa',
          value: 'highImpact',
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
      label: 'Texto del encabezado',
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
      label: 'Slides del carrusel',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Máximo 3 slides. Cada slide lleva imagen de fondo + título + subtítulo + botón.',
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
