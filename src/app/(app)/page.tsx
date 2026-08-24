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
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        and: [
          { slug: { equals: 'home' } },
          ...(!draft ? [{ _status: { equals: 'published' } }] : []),
        ],
      },
    })

    if (result.docs && result.docs.length > 0) {
      return result.docs[0] as Page
    }
  } catch (err) {
    payload.logger.warn({ msg: '[Home] Error querying home page from DB, falling back to static', err })
  }

  return homeStaticData() as Page
}

export default async function HomePage() {
  const page = await queryHomePage()
  const { hero, layout } = page || (homeStaticData() as Page)

  return (
    <article className="pt-8 pb-24 space-y-12">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}
