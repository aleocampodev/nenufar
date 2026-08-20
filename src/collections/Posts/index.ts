import type { CollectionConfig } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    // Fuera del storefront actual (landing + ecommerce) — oculto, no eliminado
    hidden: true,
    defaultColumns: ['title', 'author', 'publishedAt', '_status'],
    livePreview: {
      url: ({ data, req }) => {
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000'
        return `${baseUrl}/blog/${data?.slug}`
      },
    },
    preview: (data, { req }) => {
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000'
      return `${baseUrl}/blog/${data?.slug}`
    },
    useAsTitle: 'title',
  },
  defaultPopulate: {
    title: true,
    slug: true,
    author: true,
    publishedAt: true,
    meta: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'slug',
      useAsSlug: 'title',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: 'Contenido',
            },
          ],
          label: 'Contenido',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      filterOptions: ({ id }) => {
        if (id) {
          return {
            id: {
              not_in: [id],
            },
          }
        }
        return {
          id: {
            exists: true,
          },
        }
      },
      hasMany: true,
      relationTo: 'products',
    },
  ],
  versions: {
    drafts: true,
  },
}
