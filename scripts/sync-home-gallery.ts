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
  // Obtener el bloque gallery de home-static
  const staticData = homeStaticData()
  const galleryBlock = (staticData.layout as any[])?.find((b) => b.blockType === 'gallery')

  if (!galleryBlock) {
    console.error('No se encontró el bloque gallery en homeStaticData.')
    return
  }

  let newLayout = [...currentLayout]
  const existingGalleryIdx = newLayout.findIndex((b) => b.blockType === 'gallery')

  if (existingGalleryIdx !== -1) {
    console.log('🔄 Actualizando bloque gallery existente en la página home con URLs optimizadas...')
    newLayout[existingGalleryIdx] = galleryBlock
  } else {
    const featuresIdx = currentLayout.findIndex((b) => b.blockType === 'features')
    if (featuresIdx !== -1) {
      newLayout.splice(featuresIdx + 1, 0, galleryBlock)
    } else {
      newLayout.push(galleryBlock)
    }
  }

  console.log('Guardando cambios en el layout de la página home...')

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
