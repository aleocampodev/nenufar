import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Products,
    Orders,
    Posts,
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    {
      slug: 'media',
      upload: true,
      admin: { useAsTitle: 'filename' },
      fields: [
        { name: 'filename', type: 'text' },
        { name: 'url', type: 'text' },
        { name: 'mimeType', type: 'text' },
      ],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'nenufar-dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        'postgres://postgres:postgres@127.0.0.1:5432/nenufar',
    },
  }),
})