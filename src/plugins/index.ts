import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

// Nénufar v3.1: Stripe removed — orders go to Telegram invisibly (constitution §2.1)
// import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Nenúfar Joyería Artesanal` : 'Nenúfar — Joyería Artesanal Colombiana'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // Vercel Blob: persists uploaded images across deploys (production).
  // In dev, falls back to local disk (public/media/) when BLOB_READ_WRITE_TOKEN is absent.
  ...(process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          enabled: true,
          collections: {
            media: true,
          },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : []),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Contenido',
        // Fuera del storefront actual (landing + ecommerce) — oculto, no eliminado
        hidden: true,
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Contenido',
        // Fuera del storefront actual (landing + ecommerce) — oculto, no eliminado
        hidden: true,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    currencies: {
      defaultCurrency: 'COP',
      supportedCurrencies: [
        {
          code: 'COP',
          decimals: 0,
          label: 'Peso Colombiano',
          symbol: '$',
          symbolDisplay: 'symbol',
        },
      ],
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        labels: {
          singular: 'Carrito',
          plural: 'Carritos Activos',
        },
        admin: {
          ...defaultCollection.admin,
          group: 'Gestión de Pedidos',
        },
        fields: [
          ...defaultCollection.fields,
          {
            name: 'attributes',
            type: 'array',
            label: 'Personalización',
            fields: [
              {
                name: 'key',
                type: 'text',
                label: 'Campo',
                required: true,
              },
              {
                name: 'value',
                type: 'text',
                label: 'Valor',
                required: true,
              },
            ],
            admin: {
              description: 'Opciones de personalización del pedido (talla, color, grabado, etc.)',
            },
          },
          {
            name: 'note',
            type: 'textarea',
            label: 'Notas del pedido',
            admin: {
              description: 'Instrucciones especiales o comentarios para Shirley',
            },
          },
        ],
      }),
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        labels: {
          singular: 'Pedido',
          plural: 'Pedidos (Órdenes)',
        },
        admin: {
          ...defaultCollection.admin,
          group: 'Gestión de Pedidos',
        },
        fields: [
          ...defaultCollection.fields,
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    payments: {
      // Nenúfar v3.1: no payment gateway — order goes to Telegram, payment is off-system
      // (Shirley closes via Telegram per BRD §3.2 and constitution §2.1)
      paymentMethods: [],
    },
    transactions: {
      // Sin pasarela de pago: la colección siempre queda vacía.
      // Se oculta del admin (no se elimina — el plugin la requiere internamente).
      transactionsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          group: 'Gestión de Pedidos',
          hidden: true,
        },
      }),
    },
    products: {
      productsCollectionOverride: ({ defaultCollection }) => {
        const overridden = ProductsCollection({ defaultCollection })
        return {
          ...overridden,
          labels: {
            singular: 'Joya / Producto',
            plural: 'Catálogo de Joyas',
          },
          admin: {
            ...overridden.admin,
            group: 'Catálogo de Joyas',
          },
        }
      },
    },
  }),
]
