import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { GridTileImage } from '@/components/Grid/tile'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { getServerSideURL } from '@/utilities/getURL'

const SITE_NAME = 'Nenúfar'

/** Google exige URLs absolutas en JSON-LD. Prefija el dominio solo si es relativa. */
const toAbsoluteUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${getServerSideURL()}${url}`
}

/** Convierte el richText de descripción a texto plano y lo recorta para meta/JSON-LD. */
const plainDescription = (product: Product, max = 300): string => {
  if (!product.description) return ''
  try {
    const text = convertLexicalToPlaintext({ data: product.description as any })
      .replace(/\s+/g, ' ')
      .trim()
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
  } catch {
    return ''
  }
}

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)
  const description =
    product.meta?.description ||
    plainDescription(product, 155) ||
    `${product.title} — joyería artesanal colombiana hecha a mano por Nénufar.`
  const title = product.meta?.title || `${product.title} | ${SITE_NAME} Joyería Artesanal`
  const canonical = `${getServerSideURL()}/products/${(product as any).slug || slug}`

  const images = seoImage?.url
    ? [
        {
          alt: seoImage.alt || product.title,
          height: seoImage.height!,
          url: seoImage.url,
          width: seoImage.width!,
        },
      ]
    : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'es_CO',
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images?.map((i) => i.url),
    },
    robots: {
      follow: canIndex,
      index: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
    },
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? Boolean(
        product?.variants?.docs?.some((variant) => {
          if (typeof variant !== 'object' || !variant) return false
          return typeof variant.inventory === 'number' && variant.inventory > 0
        }),
      )
    : typeof product.inventory === 'number' && product.inventory > 0

  let price = product.priceInCOP

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInCOP && acc && variant?.priceInCOP > acc) {
        return variant.priceInCOP
      }
      return acc
    }, price)
  }

  const productUrl = `${getServerSideURL()}/products/${(product as any).slug || slug}`
  const jsonLdImages = [
    typeof metaImage === 'object' ? metaImage?.url : undefined,
    ...gallery.map((item) => item.image?.url),
  ]
    .map(toAbsoluteUrl)
    .filter((url): url is string => Boolean(url))

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: plainDescription(product) || product.title,
    image: jsonLdImages.length ? jsonLdImages : undefined,
    url: productUrl,
    sku: String(product.id),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      price: price ?? undefined,
      priceCurrency: 'COP',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  return (
    <React.Fragment>
      <script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="container pt-8 pb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/shop">
            <ChevronLeftIcon />
            All products
          </Link>
        </Button>
        <div className="flex flex-col gap-12 rounded-lg border p-8 md:py-12 lg:flex-row lg:gap-8 bg-primary-foreground">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : <></>}

      {relatedProducts.length ? (
        <div className="container">
          <RelatedProducts products={relatedProducts as Product[]} />
        </div>
      ) : (
        <></>
      )}
    </React.Fragment>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {products.map((product) => (
          <li
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            key={product.id}
          >
            <Link className="relative h-full w-full" href={`/products/${(product as any).slug}`}>
              <GridTileImage
                label={{
                  amount: product.priceInCOP!,
                  title: product.title,
                }}
                media={product.meta?.image as Media}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        priceInCOP: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}
