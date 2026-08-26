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
        description: 'Texto pequeño en mayúsculas sobre el título (ej: Tradición y Delicadeza)',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título Principal',
      defaultValue: 'Por qué elegir Nenúfar Joyería',
    },
    {
      name: 'centerImage',
      type: 'upload',
      label: 'Imagen central (pieza destacada / joya)',
      relationTo: 'media',
      admin: {
        description: 'Imagen del centro destacada. Si se deja vacía se muestra imagen ilustrativa por defecto.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Lista de Beneficios',
      minRows: 1,
      maxRows: 8,
      defaultValue: [
        {
          icon: 'handmade',
          title: 'HECHO A MANO',
          description: 'Cada pieza es elaborada a mano, hilo por hilo, siguiendo técnicas tradicionales de tejido en mostacilla.',
        },
        {
          icon: 'ancestral',
          title: 'DISEÑO ANCESTRAL',
          description: 'Inspirados en los patrones y colores de las comunidades indígenas colombianas, cada diseño cuenta una historia.',
        },
        {
          icon: 'colors',
          title: 'COLORES AUTÉNTICOS',
          description: 'Combinaciones vibrantes hechas con mostacilla checa y materiales de alta calidad, pensadas para durar.',
        },
        {
          icon: 'unique',
          title: 'PIEZAS ÚNICAS',
          description: 'Ninguna pieza es igual a otra: cada collar, arete o pulsera es una obra original, hecha para ti.',
        },
      ],
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Ícono Representativo',
          defaultValue: 'handmade',
          options: [
            { label: '🪡 Hecho a Mano / Aguja e Hilo', value: 'handmade' },
            { label: '💠 Diseño Ancestral / Patrón Indígena', value: 'ancestral' },
            { label: '🔘 Colores Auténticos / Mostacilla Checa', value: 'colors' },
            { label: '⭐ Piezas Únicas / Estrella', value: 'unique' },
            { label: '💎 Joya / Filigrana de Autor', value: 'design' },
            { label: '🛡️ Insumos Duraderos / Calidad', value: 'quality' },
            { label: '🎁 Empaque de Regalo Artesanal', value: 'gift' },
            { label: '🚚 Envíos a Toda Colombia', value: 'shipping' },
            { label: '🤝 Atención Personalizada Shirley', value: 'support' },
            { label: '✨ Brillo y Delicadeza', value: 'sparkles' },
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


