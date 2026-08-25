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
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Slider (Krafti)',
          value: 'slider',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
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
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
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
