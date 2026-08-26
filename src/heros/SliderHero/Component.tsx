import type { Media, Page } from '@/payload-types'
import React from 'react'

import { SliderHeroClient } from './Component.client'

type Slide = {
  image: number | Media
  heading: string
  subheading?: string | null
  linkLabel?: string | null
  linkUrl?: string | null
}

export const SliderHero: React.FC<Page['hero']> = (props: any) => {
  const { richText, links, slides } = props as Page['hero'] & { slides?: Slide[] }

  // Fallback: if no slides configured, render lowImpact-style heading
  if (!slides || slides.length === 0) {
    return null
  }

  return <SliderHeroClient slides={slides as Slide[]} fallbackRichText={richText} fallbackLinks={links} />
}
