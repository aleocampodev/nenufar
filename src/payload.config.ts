import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'

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
    // Payload needs a users collection to log in to the admin panel
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'agento-super-secret-key-2026',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgres://postgres:postgres@127.0.0.1:5432/agento',
    },
    // Prevent Payload's Drizzle adapter from dropping our custom tables
    tablesFilter: ['!product_embeddings', '!handoff_sessions'],
    // IMPORTANT: Constitution warns about PgBouncer transaction mode and prepared statements.
    // In node-postgres (used by Drizzle under the hood), prepared statements can be disabled or handled carefully.
    // Drizzle handles them implicitly. We can disable prepared statements if needed by setting push: false
    // or by configuring the pool to not use them, but it's often handled at the connection string level (pgbouncer=true).
  }),
})
