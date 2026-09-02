import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  
  // Clean any old categories
  const existing = await payload.find({ collection: 'categories', limit: 100 })
  for (const cat of existing.docs) {
    await payload.delete({ collection: 'categories', id: cat.id })
    console.log(`Eliminada categoría anterior: ${cat.title}`)
  }

  // Create single official category
  const newCat = await payload.create({
    collection: 'categories',
    data: {
      title: 'Aretes',
      slug: 'aretes',
    },
  })

  console.log(`✅ Creada categoría única en el Admin: "${newCat.title}" (#${newCat.id})`)
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
