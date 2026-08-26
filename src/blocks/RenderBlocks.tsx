import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FeaturesBlock } from '@/blocks/Features/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { ImageStripBlock } from '@/blocks/ImageStrip/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { NenufarStoryBlock } from '@/blocks/NenufarStory/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { ThreeItemGridBlock } from '@/blocks/ThreeItemGrid/Component'
import { UpcomingEventsBlock } from '@/blocks/UpcomingEvents/Component'
import { ScrollReveal } from '@/components/Animation/ScrollReveal'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Page } from '../payload-types'

const blockComponents = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  features: FeaturesBlock,
  formBlock: FormBlock,
  imageStrip: ImageStripBlock,
  mediaBlock: MediaBlock,
  nenufarStory: NenufarStoryBlock,
  testimonials: TestimonialsBlock,
  threeItemGrid: ThreeItemGridBlock,
  upcomingEvents: UpcomingEventsBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    const unspacedBlocks = new Set([
      'features',
      'imageStrip',
      'testimonials',
      'nenufarStory',
      'upcomingEvents',
      'cta',
      'banner',
      'archive',
    ])

    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const shouldApplyMargin = !unspacedBlocks.has(blockType)

              return (
                <ScrollReveal
                  key={index}
                  className={shouldApplyMargin ? 'my-16' : ''}
                >
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block id={toKebabCase(blockName!)} {...block} />
                </ScrollReveal>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
