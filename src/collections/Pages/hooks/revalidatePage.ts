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
      const isHome = doc.slug === 'home' || doc.slug === 'inicio'
      const path = isHome ? '/' : `/${doc.slug}`

      try {
        payload.logger.info(`Revalidating page at path: ${path}`)
        revalidatePath(path)
      } catch (err) {
        payload.logger.warn({ msg: `Skipped revalidatePath for ${path}: no static store available`, err })
      }
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published' && previousDoc?.slug) {
      const wasHome = previousDoc.slug === 'home' || previousDoc.slug === 'inicio'
      const oldPath = wasHome ? '/' : `/${previousDoc.slug}`

      try {
        payload.logger.info(`Revalidating old page at path: ${oldPath}`)
        revalidatePath(oldPath)
      } catch (err) {
        payload.logger.warn({ msg: `Skipped revalidatePath for ${oldPath}: no static store available`, err })
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context, payload } }) => {
  if (!context.disableRevalidate && doc?.slug) {
    const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
    try {
      revalidatePath(path)
    } catch (err) {
      payload.logger.warn({ msg: `Skipped revalidatePath for ${path}: no static store available`, err })
    }
  }

  return doc
}
