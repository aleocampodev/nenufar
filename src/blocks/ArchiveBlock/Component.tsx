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

  // Posts collection is hidden but still queryable — render simple cards
  if (target === 'posts') {
    const payload = await getPayload({ config: configPromise })
    let docs: any[] = []
    if (populateBy === 'collection') {
      const res = await payload.find({
        collection: 'posts',
        depth: 1,
        limit,
        overrideAccess: false,
        where: { _status: { equals: 'published' } },
        sort: '-publishedAt',
      })
      docs = res.docs
    } else if (selectedDocs?.length) {
      docs = selectedDocs
        .filter((d: any) => d.relationTo === 'posts' && typeof d.value === 'object')
        .map((d: any) => d.value)
    }

    if (!docs.length) return null

    return (
      <div className="my-16 container" id={`block-${id}`}>
        {introContent && (
          <div className="mb-8">
            <RichText className="ml-0 max-w-3xl" data={introContent} enableGutter={false} />
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((post: any) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-serif text-lg leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-brand">
                    {post.title}
                  </Link>
                </h3>
                {post.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('es-CO', {
                      dateStyle: 'medium',
                      timeZone: 'America/Bogota',
                    })}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-block text-sm text-brand hover:underline font-medium"
                >
                  Leer más →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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
