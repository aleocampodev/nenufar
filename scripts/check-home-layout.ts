import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'pages',
    where: {
      or: [
        { slug: { equals: 'home' } },
        { slug: { equals: 'inicio' } },
      ],
    },
    depth: 1,
  })

  console.log(`Páginas encontradas: ${res.docs.length}`)
  for (const page of res.docs) {
    console.log(`\n📄 Página ID: ${page.id} | Slug: ${page.slug} | Status: ${(page as any)._status}`)
    console.log(`   Hero Type: ${(page.hero as any)?.type}`)
    console.log(`   Layout Blocks (${(page.layout as any[])?.length || 0}):`)
    ;(page.layout as any[])?.forEach((b, i) => {
      console.log(`     ${i + 1}. [${b.blockType}] — ${b.title || b.heading || b.tagline || ''}`)
    })
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
