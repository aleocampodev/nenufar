import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'
import { RichText } from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    relationTo,
  } = props as ArchiveBlockProps & { relationTo?: 'products' | 'posts' }

  const limit = limitFromProps || 3
  const target: 'products' | 'posts' = (relationTo as any) || 'products'

  // Posts collection - Krafti 3-column editorial journal style
  if (target === 'posts') {
    let docs: any[] = []
    try {
      const payload = await getPayload({ config: configPromise })
      if (populateBy === 'collection') {
        const res = await payload.find({
          collection: 'posts',
          depth: 1,
          limit,
          overrideAccess: true,
          where: { _status: { equals: 'published' } },
          sort: '-publishedAt',
        })
        docs = res.docs || []
      } else if (selectedDocs?.length) {
        docs = selectedDocs
          .filter((d: any) => d.relationTo === 'posts' && typeof d.value === 'object')
          .map((d: any) => d.value)
      }
    } catch (err) {
      console.error('Error fetching posts in ArchiveBlock:', err)
    }

    // Default fallback articles if DB doesn't have posts yet
    if (!docs.length) {
      docs = [
        {
          id: '1',
          slug: 'el-arte-de-la-mostacilla-en-el-caribe',
          title: 'El arte de la mostacilla en el Caribe',
          publishedAt: '2026-08-15T12:00:00.000Z',
          authorName: 'Shirley',
          heroImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
          excerpt: 'Descubre la historia y la paciencia detrás de cada puntada tejida a mano en Cartagena de Indias.',
        },
        {
          id: '2',
          slug: 'como-cuidar-tus-joyas-artesanales',
          title: 'Cómo cuidar tus joyas de filigrana',
          publishedAt: '2026-08-10T12:00:00.000Z',
          authorName: 'Shirley',
          heroImage: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop&q=80',
          excerpt: 'Consejos esenciales para preservar el brillo y los tonos vivos de tus accesorios en el clima cálido.',
        },
        {
          id: '3',
          slug: 'talleres-presenciales-cartagena',
          title: 'Tejiendo comunidad en Cartagena',
          publishedAt: '2026-08-01T12:00:00.000Z',
          authorName: 'Shirley',
          heroImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80',
          excerpt: 'Nuestros talleres presenciales: un espacio para aprender, compartir y crear con tus propias manos.',
        },
      ]
    }

    return (
      <section className="py-20 md:py-28 bg-white" id={`block-${id}`}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans block">
              Historias del Taller
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
              Diario & Tradición
            </h2>
            <div className="w-10 h-0.5 bg-brand mx-auto mt-4 rounded-full opacity-60" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((post: any) => {
              const imageSrc =
                (typeof post.heroImage === 'object' && post.heroImage?.url) ||
                (typeof post.heroImage === 'string' && post.heroImage) ||
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'

              return (
                <article key={post.id} className="group flex flex-col space-y-4">
                  {/* Image container */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100 block"
                  >
                    <img
                      src={imageSrc}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </Link>

                  {/* Meta: Author and Date */}
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8B5A2B] font-semibold font-sans pt-1">
                    <span>Por {post.authorName || 'Shirley'}</span>
                    <span>·</span>
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('es-CO', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'America/Bogota',
                          })
                        : 'Reciente'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-xl sm:text-2xl font-normal leading-snug text-foreground group-hover:text-brand transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-neutral-600 font-light leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read more link */}
                  <div className="pt-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-block text-xs uppercase tracking-widest font-semibold text-brand hover:text-brand-dark transition-colors underline underline-offset-4 decoration-brand/30 hover:decoration-brand"
                    >
                      Leer Historia →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Default: products
  let posts: any[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = (categories as any)?.map((category: any) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedProducts = await payload.find({
      collection: 'products',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedProducts.docs
  } else {
    if ((selectedDocs as any)?.length) {
      const filteredSelectedPosts = (selectedDocs as any).map((post: any) => {
        if (typeof post.value === 'object') return post.value
      })

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ml-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
