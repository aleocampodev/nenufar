import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from './linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: 'Hero principal de la página',
  admin: {
    description: 'Configuración del Hero de la página (Foto de Shirley / modelo, titular, botón CTA y redes sociales).',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'slider',
      label: '¿Qué mostrar arriba?',
      admin: {
        description: 'Elige "Hero Principal Nénufar" para la página de Inicio.',
      },
      options: [
        {
          label: '✅ Hero Principal Nénufar (Foto de Shirley, Redes Sociales y Titular) — (Inicio)',
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
      name: 'modelImage',
      type: 'upload',
      label: 'Foto de Shirley / Modelo (Fondo Transparente)',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description:
          'Foto en primer plano con fondo transparente (SVG o PNG). Si la dejas vacía, se usará por defecto la foto oficial procesada en alta definición (/shirley-hdr-sin-fondo.svg).',
      },
    },
    {
      name: 'badge',
      type: 'text',
      label: 'Etiqueta superior (Badge)',
      defaultValue: 'ALTA JOYERÍA ARTESANAL',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Texto pequeño con punto indicador que aparece sobre el titular.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Titular H1 (Texto principal)',
      defaultValue: 'La nobleza del Caribe no se hereda.',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Frase principal del encabezado (sin la parte resaltada en cursiva violeta).',
      },
    },
    {
      name: 'headingHighlight',
      type: 'text',
      label: 'Texto resaltado (Cursiva violeta)',
      defaultValue: 'Se teje.',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Frase o palabra destacada al final del titular con estilo en cursiva y color violeta.',
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      label: 'Texto del botón principal',
      defaultValue: 'Conoce la colección',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Enlace del botón principal (URL)',
      defaultValue: '/shop',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Ej: /shop, /eventos',
      },
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Redes Sociales del Hero',
      admin: {
        condition: (_, { type } = {}) => type === 'slider',
        description: 'Canales oficiales mostrados junto al botón principal.',
      },
      fields: [
        {
          name: 'instagramUrl',
          type: 'text',
          label: 'URL de Instagram',
          defaultValue: 'https://www.instagram.com/nenufar.co/',
        },
        {
          name: 'facebookUrl',
          type: 'text',
          label: 'URL de Facebook',
          defaultValue: 'https://www.facebook.com/nenufar.co',
        },
        {
          name: 'whatsappUrl',
          type: 'text',
          label: 'URL de WhatsApp',
          defaultValue: 'https://wa.me/?text=Hola%2C%20quisiera%20consultar%20sobre%20las%20joyas%20artesanales%20de%20N%C3%A9nufar',
        },
        {
          name: 'telegramUrl',
          type: 'text',
          label: 'URL de Telegram',
          defaultValue: 'https://t.me/',
        },
      ],
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
      label: 'Fotos del carrusel (Legado / Opcional)',
      admin: {
        condition: () => false,
        description: 'Campo legado preservado para compatibilidad con datos existentes.',
      },
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'modelImage',
          type: 'upload',
          label: 'Foto de Shirley / Modelo (Lado Izquierdo)',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Foto a pantalla completa para el lado izquierdo. Si la dejas vacía, se usará la foto de Shirley por defecto.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Foto de la joya (Lado Derecho - Dentro del Arco)',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Foto en primer plano de la joya que aparecerá dentro del marco en arco.',
          },
        },
        {
          name: 'imagePosition',
          type: 'select',
          label: 'Enfoque de la foto (para no cortar rostros)',
          defaultValue: 'top',
          options: [
            {
              label: '👤 Rostros / Superior (Recomendado para fotos con Shirley o personas)',
              value: 'top',
            },
            {
              label: '🎯 Centro (Recomendado para fotos de joyas solas o productos centrados)',
              value: 'center',
            },
            {
              label: '📐 Inferior (Enfocar la parte baja)',
              value: 'bottom',
            },
          ],
          admin: {
            description: 'Elige "Rostros / Superior" para que al recortar la imagen en pantallas no corte las cabezas.',
          },
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Etiqueta superior (ej: COLECCIÓN DESTACADA, TALLER PRESENCIAL)',
        },
        {
          name: 'heading',
          type: 'text',
          label: 'Título grande',
          required: false,
        },
        {
          name: 'metaText',
          type: 'text',
          label: 'Sub-etiqueta o metadatos (ej: CARTAGENA DE INDIAS • HECHO A MANO)',
        },
        {
          name: 'subheading',
          type: 'textarea',
          label: 'Subtítulo descriptivo',
        },
        {
          name: 'tabTitle',
          type: 'text',
          label: 'Nombre en la pestaña inferior derecha (si está vacío, usa el título)',
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
}
