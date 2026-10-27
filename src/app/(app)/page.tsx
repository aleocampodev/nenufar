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

// Revalidación ISR cada 5 minutos (300s) para máximo rendimiento, compatible con draftMode
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage()
  return generateMeta({ doc: page || (homeStaticData() as Page) })
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

    const isStarterTemplate = (doc: Page) => {
      const heroType = (doc.hero as any)?.type
      const blocks = doc.layout || []
      const hasNenufarBlocks = blocks.some((b) =>
        ['nenufarStory', 'imageStrip', 'upcomingEvents', 'testimonials', 'gallery'].includes(b.blockType)
      )
      return heroType === 'lowImpact' && !hasNenufarBlocks
    }

    if (result.docs && result.docs.length > 0) {
      const doc = result.docs[0] as Page
      if (!isStarterTemplate(doc)) {
        return doc
      }
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
        const draftDoc = draftResult.docs[0] as Page
        if (!isStarterTemplate(draftDoc)) {
          return draftDoc
        }
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
  const filteredBlocks = layout?.filter((block) => block.blockType !== 'gallery')

  return (
    <article className={isHero ? 'pb-16' : 'pt-8 pb-16'}>
      {/* H1 Semántico accesible para SEO / Motores de búsqueda */}
      <h1 className="sr-only">Nenúfar — Joyería Artesanal en Mostacilla | Hecho a Mano en Cartagena</h1>
      <RenderHero {...hero} />
      <RenderBlocks blocks={filteredBlocks} />
    </article>
  )
}
