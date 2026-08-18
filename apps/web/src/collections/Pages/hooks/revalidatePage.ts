import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache.js'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published' && doc.slug) {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published' && previousDoc?.slug) {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate && doc?.slug) {
    const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
    revalidatePath(path)
  }

  return doc
}
