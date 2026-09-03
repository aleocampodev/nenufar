import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  const cats = await payload.find({ collection: 'categories', limit: 100 })
  console.log(`\n📂 Categorías actuales en la base de datos (${cats.docs.length}):`)
  cats.docs.forEach((c) => {
    console.log(` - [ID: ${c.id}] ${c.title} (slug: ${c.slug})`)
  })

  const pages = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } } })
  const home = pages.docs[0]
  console.log(`\n🏠 Bloques en Home Page:`)
  home?.layout?.forEach((b: any, i: number) => {
    console.log(` ${i + 1}. Block: ${b.blockType} ${b.title || b.heading || ''}`)
    if (b.categories) {
      console.log(`    Categorías asociadas:`, b.categories)
    }
  })
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
