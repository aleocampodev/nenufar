import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import { adminOnly } from '@/access/adminOnly'
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  getSupabasePublicUrl,
} from '@/lib/supabaseStorage'

const filePath = fileURLToPath(import.meta.url)
const mediaDir = path.dirname(filePath)

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
    adminThumbnail: ({ doc }) => {
      const d = doc as any
      if (d?.mimeType?.startsWith('video/') || d?.filename?.match(/\.(mp4|webm|mov|m4v)$/i)) {
        return '/media/shirley-nenufar-1.jpeg'
      }
      return (
        d?.thumbnailURL ||
        d?.sizes?.thumbnail?.url ||
        d?.url ||
        getSupabasePublicUrl(d?.sizes?.thumbnail?.filename || d?.filename || '')
      )
    },
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
      'video/x-m4v',
    ],
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
    afterRead: [
      ({ doc }) => {
        if (!doc) return doc
        if (doc.filename) {
          doc.url = getSupabasePublicUrl(doc.filename)
          if (doc.mimeType?.startsWith('video/') || doc.filename.match(/\.(mp4|webm|mov|m4v)$/i)) {
            doc.thumbnailURL = '/media/shirley-nenufar-1.jpeg'
          } else {
            doc.thumbnailURL = doc.sizes?.thumbnail?.filename
              ? getSupabasePublicUrl(doc.sizes.thumbnail.filename)
              : doc.url
          }
        }
        return doc
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        // Sync uploaded image/video and variants to Supabase Storage bucket in background
        try {
          const staticDir = path.resolve(mediaDir, '../../public/media')
          if (doc.filename) {
            const mainFilePath = path.join(staticDir, doc.filename)
            if (fs.existsSync(mainFilePath)) {
              const buffer = await fs.promises.readFile(mainFilePath)
              await uploadToSupabaseStorage({
                filename: doc.filename,
                buffer,
                mimeType: doc.mimeType || (doc.filename?.match(/\.(mp4|mov)$/i) ? 'video/mp4' : 'image/jpeg'),
              })
            }
          }
          if (doc.sizes && typeof doc.sizes === 'object') {
            for (const size of Object.values<any>(doc.sizes)) {
              if (size?.filename) {
                const sizeFilePath = path.join(staticDir, size.filename)
                if (fs.existsSync(sizeFilePath)) {
                  const sizeBuffer = await fs.promises.readFile(sizeFilePath)
                  await uploadToSupabaseStorage({
                    filename: size.filename,
                    buffer: sizeBuffer,
                    mimeType: size.mimeType || 'image/webp',
                  })
                }
              }
            }
          }
        } catch (err) {
          req.payload.logger.warn({ msg: '[Supabase Storage] Hook sync error', err })
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          if (doc.filename) {
            await deleteFromSupabaseStorage(doc.filename)
          }
          if (doc.sizes && typeof doc.sizes === 'object') {
            for (const size of Object.values<any>(doc.sizes)) {
              if (size?.filename) {
                await deleteFromSupabaseStorage(size.filename)
              }
            }
          }
        } catch (err) {
          req.payload.logger.warn({ msg: '[Supabase Storage] Delete sync error', err })
        }
      },
    ],
  },
}
