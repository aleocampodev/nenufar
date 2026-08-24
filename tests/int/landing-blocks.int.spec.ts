import { describe, it, expect } from 'vitest'
import { homeStaticData } from '@/endpoints/seed/home-static'

describe('Landing & Modular Blocks Subsystem (IP-003 / SPEC-003)', () => {
  it('homeStaticData provides valid Spanish artisan hero and metadata', () => {
    const home = homeStaticData()

    expect(home.slug).toBe('home')
    expect(home._status).toBe('published')
    expect(home.title).toBe('Inicio')
    expect(home.meta?.title).toContain('Nénufar')
    expect(home.hero?.links?.[0]?.link?.url).toBe('/shop')
  })

  it('homeStaticData includes upcoming events and CTA modular blocks', () => {
    const home = homeStaticData()
    const layout = home.layout || []

    expect(layout.length).toBeGreaterThanOrEqual(2)

    const eventsBlock = layout.find((b) => b.blockType === 'upcomingEvents')
    expect(eventsBlock).toBeDefined()

    const ctaBlock = layout.find((b) => b.blockType === 'cta')
    expect(ctaBlock).toBeDefined()
  })
})
