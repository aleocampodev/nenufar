import { postgresAdapter } from '@payloadcms/db-postgres'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { es } from '@payloadcms/translations/languages/es'

import { Categories } from '@/collections/Categories'
import { Events } from '@/collections/Events'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Testimonials } from '@/collections/Testimonials'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      actions: ['@/components/Admin/UserDropdown#UserDropdown'],
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
      beforeNavLinks: ['@/components/Admin/SidebarHeader#SidebarHeader'],
      graphics: {
        Logo: '@/components/Logo#Logo',
        Icon: '@/components/Logo#Icon',
      },
    },
    meta: {
      titleSuffix: '— Nenúfar Admin',
      description: 'Panel de administración de Nenúfar Joyería Artesanal',
    },
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, Media, Posts, Events, Testimonials],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl:
        process.env.DATABASE_URL?.includes('supabase') ||
        process.env.DATABASE_URL?.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : undefined,
    },
    // push: true auto-mutates schema on every start — dangerous in production.
    // Use `pnpm payload migrate` for schema changes.
    push: process.env.NODE_ENV === 'development',
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer],
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  plugins,
  secret: (() => {
    const s = process.env.PAYLOAD_SECRET
    if (!s) throw new Error('PAYLOAD_SECRET env var is required')
    return s
  })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
