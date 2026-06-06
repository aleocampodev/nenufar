'use server'

import { searchProducts } from '@/lib/rag'

export async function handleSearch(query: string) {
  try {
    return await searchProducts(query)
  } catch (error) {
    console.error('Search action failed:', error)
    return []
  }
}
