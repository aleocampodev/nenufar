import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { adminOnly } from '@/access/adminOnly'

const filePath = fileURLToPath(import.meta.url)
const mediaDir = path.dirname(filePath)

/**
 * Renombra el archivo físico cuando se edita `fileName` en el admin.
 * Garantiza conservar la extensión correcta para que las imágenes se previsualicen y sirvan siempre.
 */
const syncFileName = ({ data, originalDoc }: { data: any; originalDoc: any }) => {
  const newName: string | undefined = data?.fileName
  if (!newName || typeof newName !== 'string' || !newName.trim()) return data

  const currentFilename = data?.filename || originalDoc?.filename || ''
  let ext = path.extname(currentFilename).toLowerCase()
  if (!ext && data?.mimeType) {
    if (data.mimeType === 'image/jpeg') ext = '.jpg'
    else if (data.mimeType === 'image/png') ext = '.png'
    else if (data.mimeType === 'image/webp') ext = '.webp'
    else if (data.mimeType === 'image/avif') ext = '.avif'
    else if (data.mimeType === 'image/gif') ext = '.gif'
    else if (data.mimeType === 'image/svg+xml') ext = '.svg'
  }

  const base = newName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sin tildes
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!base) return data

  const cleanName = base.endsWith(ext) ? base : `${base}${ext || '.jpg'}`
  if (cleanName === currentFilename) return data

  data.filename = cleanName
  if (typeof data.url === 'string') {
    data.url = data.url.replace(/[^/]+$/, cleanName)
  }
  return data
}

export const Media: CollectionConfig = {
  admin: {
    group: 'Contenido Web',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'filename', 'updatedAt'],
  },
  labels: {
    singular: 'Medio / Imagen',
    plural: 'Medios y Archivos',
  },
  slug: 'media',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'fileName',
      type: 'text',
      label: 'Nombre del archivo',
      admin: {
        description: 'Nombre descriptivo del archivo físico (ej. aretes-filigrana).',
      },
      hooks: {
        beforeValidate: [({ value, originalDoc }) => {
          if (typeof value !== 'string' || !value.trim()) return undefined
          if (originalDoc && value === originalDoc.fileName) return value
          return value
        }],
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Texto Alternativo (Alt)',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Descripción o Leyenda',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(mediaDir, '../../public/media'),
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'],
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 500,
        position: 'centre',
        formatOptions: {
          format: 'webp' as const,
          options: { quality: 92 },
        },
      },
      {
        name: 'card',
        width: 800,
        height: 1000,
        position: 'centre',
        formatOptions: {
          format: 'webp' as const,
          options: { quality: 92 },
        },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
        formatOptions: {
          format: 'webp' as const,
          options: { quality: 92 },
        },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: {
          format: 'webp' as const,
          options: { quality: 92 },
        },
      },
    ],
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const result = syncFileName({ data, originalDoc })
        const newName = result?.filename
        const oldName = originalDoc?.filename
        if (newName && oldName && newName !== oldName) {
          try {
            const staticDir = path.resolve(mediaDir, '../../public/media')
            const { promises: fs } = require('fs') as typeof import('fs')
            void fs
              .rename(path.join(staticDir, oldName), path.join(staticDir, newName))
              .catch((e) => req.payload.logger.error(`No se pudo renombrar ${oldName}: ${e}`))
          } catch (e) {
            req.payload.logger.error(`Error renombrando ${oldName}: ${e}`)
          }
        }
        return result
      },
    ],
  },
}
