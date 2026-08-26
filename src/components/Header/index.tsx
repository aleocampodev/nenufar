import { getCachedGlobal, getCachedCategories } from '@/utilities/getGlobals'

import './index.css'
import { HeaderClient } from './index.client'

export async function Header() {
  let header: any = { navItems: [] }
  let categories: any[] = []

  try {
    const [fetchedHeader, fetchedCategories] = await Promise.all([
      getCachedGlobal('header', 1)(),
      getCachedCategories(),
    ])
    if (fetchedHeader) header = fetchedHeader
    if (fetchedCategories) categories = fetchedCategories
  } catch (err) {
    console.error('Error loading header globals:', err)
  }

  return <HeaderClient header={header} categories={categories} />
}
