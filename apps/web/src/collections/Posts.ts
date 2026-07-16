import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'category', 'format', 'publishedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'author', type: 'text' },
    { name: 'category', type: 'text' },
    {
      name: 'format',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Quote', value: 'quote' },
        { label: 'Audio', value: 'audio' },
      ],
    },
    {
      name: 'audioUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.format === 'audio',
        description: 'URL externa (Spotify, SoundCloud) o archivo alojado en Supabase Storage',
      },
    },
    {
      name: 'quoteText',
      type: 'textarea',
      admin: { condition: (_, siblingData) => siblingData?.format === 'quote' },
    },
    {
      name: 'quoteAuthor',
      type: 'text',
      admin: { condition: (_, siblingData) => siblingData?.format === 'quote' },
    },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { description: 'Auto-generado desde el título si se deja vacío' },
    },
  ],
}