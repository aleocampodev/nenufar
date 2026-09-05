import type { Metadata } from 'next'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { homeStaticData } from '@/endpoints/seed/home-static'
import React from 'react'
import type { Page } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage()
  return generateMeta({ doc: page })
}

async function queryHomePage(): Promise<Page | null> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.find({
      collection: 'pages',
      depth: 2,
      draft,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          {
            or: [
              { slug: { equals: 'home' } },
              { slug: { equals: 'inicio' } },
            ],
          },
          ...(!draft ? [{ _status: { equals: 'published' } }] : []),
        ],
      },
    })

    if (result.docs && result.docs.length > 0) {
      return result.docs[0] as Page
    }

    // Si no está publicado y no estamos en draftMode, buscar el documento borrador de la DB antes del fallback estático
    if (!draft) {
      const draftResult = await payload.find({
        collection: 'pages',
        depth: 2,
        draft: true,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          or: [
            { slug: { equals: 'home' } },
            { slug: { equals: 'inicio' } },
          ],
        },
      })

      if (draftResult.docs && draftResult.docs.length > 0) {
        return draftResult.docs[0] as Page
      }
    }
  } catch (err) {
    payload.logger.warn({ msg: '[Home] Error querying home page from DB, falling back to static', err })
  }

  return homeStaticData() as Page
}

export default async function HomePage() {
  const page = await queryHomePage()
  const { hero, layout } = page || (homeStaticData() as Page)
  const isHero = (hero as any)?.type === 'slider' || (hero as any)?.type === 'hero'

  // Galería va en la subpágina dedicada /galeria, no en la landing
  const filteredBlocks = layout?.filter(
    (block) => block.blockType !== 'features' && block.blockType !== 'gallery',
  )

  return (
    <article className={isHero ? 'pb-16' : 'pt-8 pb-16'}>
      <RenderHero {...hero} />
      <RenderBlocks blocks={filteredBlocks} />
    </article>
  )
}
