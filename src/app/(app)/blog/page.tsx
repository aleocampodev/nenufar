import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    // Public listing only shows published posts; depth:1 populates the
    // author byline (name), which Users read-access would otherwise block.
    overrideAccess: true,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-serif mb-8">Blog</h1>

      {posts.docs.length === 0 ? (
        <p className="text-neutral-600">No hay artículos publicados aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.docs.map((post) => (
            <article
              key={post.id}
              className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <a href={`/blog/${post.slug}`} className="block p-6">
                <h2 className="text-xl font-serif mb-2 text-neutral-900 hover:text-brand transition">
                  {post.title}
                </h2>
                {post.publishedAt && (
                  <time className="text-sm text-neutral-500 block mb-3">
                    {new Date(post.publishedAt).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
                {post.meta?.description && (
                  <p className="text-neutral-600 line-clamp-3">{post.meta.description}</p>
                )}
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export const metadata: Metadata = {
  description: 'Artículos sobre joyería, tendencias, cuidado de joyas y más.',
  openGraph: mergeOpenGraph({
    title: 'Blog | Nenúfar',
    url: '/blog',
  }),
  title: 'Blog | Nenúfar',
}
