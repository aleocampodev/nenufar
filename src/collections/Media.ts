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
const dirname = path.dirname(filePath)

/**
 * Renombra el archivo físico cuando se edita `fileName` en el admin.
 * Payload usa `filename` (reservado) como identidad del archivo en disco;
 * este campo custom permite editarlo desde el panel sin romper nada:
 * ajusta `filename`, `url` y las variantes `sizes.*.filename/url`.
 */
const syncFileName = ({ data, originalDoc }: { data: any; originalDoc: any }) => {
  const newName: string | undefined = data?.fileName
  if (!newName || typeof newName !== 'string') return data

  // Normaliza: sin espacios ni caracteres problemáticos, conserva la extensión
  const ext = path.extname(originalDoc?.filename || '').toLowerCase()
  const base = newName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sin tildes
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!base) return data
  const cleanName = base.endsWith(ext) ? base : `${base}${ext}`
  if (cleanName === originalDoc?.filename) return data

  data.filename = cleanName
  if (typeof data.url === 'string') {
    data.url = data.url.replace(/[^/]+$/, cleanName)
  }
  if (data.sizes && typeof data.sizes === 'object') {
    for (const size of Object.values<any>(data.sizes)) {
      if (size?.filename) {
        size.filename = cleanName
        if (typeof size.url === 'string') {
          size.url = size.url.replace(/[^/]+$/, cleanName)
        }
      }
    }
  }
  return data
}

const filename = fileURLToPath(import.meta.url)
// dirname ya está declarado arriba junto a syncFileName
const mediaDir = path.dirname(filename)

export const Media: CollectionConfig = {
  admin: {
    group: 'Contenido',
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
      // Nombre del archivo editable desde el admin (renombra el físico al guardar)
      name: 'fileName',
      type: 'text',
      label: 'Nombre del archivo',
      admin: {
        description: 'Renombra el archivo físico. Sin espacios ni tildes (se normalizan solas).',
      },
      hooks: {
        beforeValidate: [({ value, originalDoc }) => {
          // Si el usuario no lo tocó, no cambia nada
          if (typeof value !== 'string' || !value.trim()) return undefined
          if (originalDoc && value === originalDoc.fileName) return value
          return value
        }],
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(mediaDir, '../../public/media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'],
    focalPoint: true,
    // Sharp genera estas variantes WebP automáticamente al subir cada imagen.
    // Payload guarda las URLs en resource.sizes.{name}.url
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
        // Renombrar también el archivo físico en disco
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
