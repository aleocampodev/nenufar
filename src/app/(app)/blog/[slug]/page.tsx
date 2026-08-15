import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { RichText } from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const post = posts.docs[0]

  if (!post) {
    notFound()
  }

  return (
    <main className="container py-12 max-w-3xl mx-auto">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-serif mb-4 text-neutral-900">{post.title}</h1>
          {post.publishedAt && (
            <time className="text-sm text-neutral-500">
              {new Date(post.publishedAt).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </header>

        {post.content && (
          <div className="prose prose-neutral max-w-none">
            <RichText data={post.content} enableGutter={false} />
          </div>
        )}

        {post.relatedProducts && post.relatedProducts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-neutral-200">
            <h2 className="text-2xl font-serif mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {post.relatedProducts.map((product) => {
                if (typeof product === 'object' && product !== null && 'slug' in product) {
                  return (
                    <a
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="block p-4 border border-neutral-200 rounded-lg hover:shadow-md transition"
                    >
                      <h3 className="font-medium text-neutral-900">{product.title}</h3>
                    </a>
                  )
                }
                return null
              })}
            </div>
          </section>
        )}

        <footer className="mt-12 pt-8 border-t border-neutral-200">
          <a href="/blog" className="text-brand hover:underline">
            ← Volver al blog
          </a>
        </footer>
      </article>
    </main>
  )
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const post = posts.docs[0]

  if (!post) {
    return {
      title: 'Artículo no encontrado | Nenúfar',
    }
  }

  return {
    description: post.meta?.description || `Lee este artículo en el blog de Nenúfar.`,
    openGraph: mergeOpenGraph({
      title: `${post.title} | Nenúfar Blog`,
      url: `/blog/${post.slug}`,
    }),
    title: `${post.title} | Nenúfar Blog`,
  }
}
