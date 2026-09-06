import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { RichText } from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

/** Google exige URLs absolutas en JSON-LD. Prefija el dominio solo si es relativa. */
const toAbsoluteUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${getServerSideURL()}${url}`
}

const plainExcerpt = (content: unknown, max = 155): string => {
  if (!content) return ''
  try {
    const text = convertLexicalToPlaintext({ data: content as any })
      .replace(/\s+/g, ' ')
      .trim()
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
  } catch {
    return ''
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    // Public article only needs the author byline (name), which Users
    // read-access would otherwise block during prerender.
    overrideAccess: true,
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

  const metaImage = typeof post.meta?.image === 'object' ? (post.meta?.image as Media) : undefined
  const author =
    typeof post.author === 'object' && post.author !== null
      ? (post.author as { name?: string | null }).name || 'Nenúfar'
      : 'Nenúfar'

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || plainExcerpt(post.content),
    image: toAbsoluteUrl(metaImage?.url),
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: 'Nenúfar' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${getServerSideURL()}/blog/${post.slug}`,
    },
  }

  return (
    <main className="container py-12 max-w-3xl mx-auto">
      <script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
    // Same public byline rationale as the page query above.
    overrideAccess: true,
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
      robots: { index: false, follow: false },
    }
  }

  const title = post.meta?.title || `${post.title} | Nenúfar Blog`
  const description =
    post.meta?.description || plainExcerpt(post.content) || `Lee este artículo en el blog de Nenúfar.`
  const canonical = `${getServerSideURL()}/blog/${post.slug}`
  const metaImage = typeof post.meta?.image === 'object' ? (post.meta?.image as Media) : undefined
  const ogImages = metaImage?.url
    ? [{ url: metaImage.url, alt: metaImage.alt || post.title }]
    : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: mergeOpenGraph({
      type: 'article',
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      images: ogImages,
    }),
    twitter: {
      card: ogImages ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImages?.map((i) => i.url),
    },
  }
}
