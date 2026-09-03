import type { Block } from 'payload'
import { FixedToolbarFeature, HeadingFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const NenufarStory: Block = {
  slug: 'nenufarStory',
  interfaceName: 'NenufarStoryBlock',
  labels: {
    singular: '1. Nuestra Historia (Shirley & Taller)',
    plural: 'Historias Nenúfar',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      label: 'Foto de Shirley (mitad izquierda)',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Foto vertical de Shirley trabajando. Recomendado 800x1000. Si aún no tienes, se ve placeholder.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Subtítulo pequeño (arriba del título)',
      defaultValue: 'Hecho a mano en Cartagena',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título grande',
      defaultValue: 'Nenúfar — Manos que tejen historias',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Texto sobre Nenúfar',
      admin: {
        description: 'Habla de Nenúfar, de Shirley, de la mostacilla. Estilo Krafti: 2-3 párrafos cortos.',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }), FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'URL del botón (opcional)',
      defaultValue: '/shop',
      admin: { description: 'Ej: /shop, /sobre-nenufar' },
    },
    {
      name: 'linkLabel',
      type: 'text',
      label: 'Texto del botón',
      defaultValue: 'Conocer la colección',
    },
  ],
}
