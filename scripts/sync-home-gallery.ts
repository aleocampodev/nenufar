import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'
import { homeStaticData } from '../src/endpoints/seed/home-static'

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
    depth: 0,
  })

  if (!res.docs.length) {
    console.log('No se encontró página home.')
    return
  }

  const page = res.docs[0]
  const currentLayout = (page.layout as any[]) || []
  const hasGallery = currentLayout.some((b) => b.blockType === 'gallery')

  if (hasGallery) {
    console.log('✅ El bloque gallery ya existe en la página home de la BD.')
    return
  }

  // Obtener el bloque gallery de home-static
  const staticData = homeStaticData()
  const galleryBlock = (staticData.layout as any[])?.find((b) => b.blockType === 'gallery')

  if (!galleryBlock) {
    console.error('No se encontró el bloque gallery en homeStaticData.')
    return
  }

  // Encontrar la posición de features
  const featuresIdx = currentLayout.findIndex((b) => b.blockType === 'features')
  const newLayout = [...currentLayout]

  if (featuresIdx !== -1) {
    newLayout.splice(featuresIdx + 1, 0, galleryBlock)
  } else {
    // Si no está features, insertar antes de testimonials o al final
    const testIdx = currentLayout.findIndex((b) => b.blockType === 'testimonials')
    if (testIdx !== -1) {
      newLayout.splice(testIdx, 0, galleryBlock)
    } else {
      newLayout.push(galleryBlock)
    }
  }

  console.log(`Insertando bloque gallery en la posición ${featuresIdx !== -1 ? featuresIdx + 2 : 'final'}...`)

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      layout: newLayout,
    },
    context: {
      disableRevalidate: true,
    },
  })

  console.log('🎉 Página home actualizada con éxito en la base de datos!')
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('Error al sincronizar gallery en la BD:', err)
  process.exit(1)
})
