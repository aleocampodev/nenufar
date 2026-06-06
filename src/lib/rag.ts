import { db } from '../db'
import { productEmbeddings } from '../db/schema'
import { sql } from 'drizzle-orm'
import { embed } from 'ai'
import { google } from '@ai-sdk/google'
import { getPayload } from 'payload'
import config from '../payload.config'

export interface SearchResult {
  product: {
    id: number
    name: string
    description: string
    price_cop: number
    materials?: string[] | null
    images?: { url?: string | null; id?: string | null }[] | null
    available?: boolean | null
    handoff_ttl_hours?: number | null
    createdAt: string
    updatedAt: string
  }
  similarity: number
}

export async function searchProducts(query: string, limit = 4): Promise<SearchResult[]> {
  try {
    if (!query || query.trim() === '') {
      return []
    }

    console.log(`[RAG] Generating embedding for query: "${query}"`)
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-2'),
      value: query,
    })

    const vectorStr = `[${embedding.join(',')}]`

    console.log(`[RAG] Querying vector similarity...`)
    const results = await db
      .select({
        productId: productEmbeddings.productId,
        similarity: sql<number>`1 - (${productEmbeddings.embedding} <=> ${vectorStr}::vector)`,
      })
      .from(productEmbeddings)
      .orderBy(sql`${productEmbeddings.embedding} <=> ${vectorStr}::vector`)
      .limit(limit)

    if (results.length === 0) {
      console.log('[RAG] No matching embeddings found.')
      return []
    }

    console.log(`[RAG] Found ${results.length} matching products. Hydrating from Payload...`)
    const payload = await getPayload({ config })
    const productIds = results.map((r) => r.productId)

    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Map and sort based on original similarity scores
    const searchResults: SearchResult[] = results
      .map((r) => {
        const product = products.find((p) => Number(p.id) === r.productId)
        return {
          product: product as any,
          similarity: Number(r.similarity),
        }
      })
      .filter((r) => r.product !== undefined)

    return searchResults
  } catch (error) {
    console.error('[RAG ERROR] Search failed:', error)
    return []
  }
}
