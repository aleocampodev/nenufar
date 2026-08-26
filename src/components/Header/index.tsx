import { getCachedGlobal, getCachedCategories } from '@/utilities/getGlobals'

import './index.css'
import { HeaderClient } from './index.client'

export async function Header() {
  const [header, categories] = await Promise.all([
    getCachedGlobal('header', 1)(),
    getCachedCategories(),
  ])

  return <HeaderClient header={header} categories={categories} />
}
