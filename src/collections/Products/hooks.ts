import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { db } from '../../db'
import { productEmbeddings } from '../../db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'

function getMd5Hash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex')
}

export const syncProductEmbedding: CollectionAfterChangeHook = async ({
  doc,
  operation,
}) => {
  const name = doc.name || ''
  const description = doc.description || ''
  const materials = Array.isArray(doc.materials) ? doc.materials.join(', ') : ''
  const sourceText = `Product: ${name}\nDescription: ${description}\nMaterials: ${materials}`
  const currentHash = getMd5Hash(sourceText)
  const productId = Number(doc.id)

  const runAsync = async () => {
    try {
      if (operation === 'update') {
        const existing = await db
          .select({ sourceHash: productEmbeddings.sourceHash })
          .from(productEmbeddings)
          .where(eq(productEmbeddings.productId, productId))
          .limit(1)

        if (existing.length > 0 && existing[0].sourceHash === currentHash) {
          console.log(`[Embedding] Skipping indexation for product ${productId}: Hash unchanged.`);
          return
        }
      }

      console.log(`[Embedding] Generating embedding for product ${productId}...`);

      const { embedding } = await embed({
        model: google.textEmbeddingModel('gemini-embedding-2'),
        value: sourceText,
      })

      await db
        .insert(productEmbeddings)
        .values({
          productId: productId,
          embedding: embedding,
          sourceHash: currentHash,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: productEmbeddings.productId,
          set: {
            embedding: embedding,
            sourceHash: currentHash,
            updatedAt: new Date(),
          },
        })

      console.log(`[Embedding] Successfully indexed product ${productId}.`);
    } catch (err: any) {
      console.error(`[Embedding ERROR] Failed to generate embedding for product ${productId}:`, err?.message || err)
    }
  }

  runAsync()

  return doc
}

export const deleteProductEmbedding: CollectionAfterDeleteHook = async ({
  id,
}) => {
  const productId = Number(id)
  try {
    console.log(`[Embedding] Deleting embedding for product ${productId}...`);
    await db.delete(productEmbeddings).where(eq(productEmbeddings.productId, productId))
    console.log(`[Embedding] Successfully deleted embedding for product ${productId}.`);
  } catch (err: any) {
    console.error(`[Embedding ERROR] Failed to delete embedding for product ${productId}:`, err?.message || err)
  }
}
