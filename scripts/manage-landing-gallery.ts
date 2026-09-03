import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

/**
 * Script de gestión exclusiva de la Galería de Momentos, Eventos y Clientas de la Landing Page.
 * Forma parte de la skill `landing-content-manager`.
 * 
 * Uso:
 *   pnpm tsx scripts/manage-landing-gallery.ts list
 *   pnpm tsx scripts/manage-landing-gallery.ts add --tab "clientas" --imageUrl "..." --title "..."
 *   pnpm tsx scripts/manage-landing-gallery.ts remove --tab "clientas" --index 0
 */
async function main() {
  const args = process.argv.slice(2)
  const action = args[0] || 'list'

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
    overrideAccess: true,
  })

  if (!res.docs.length) {
    console.error('❌ Error: No se encontró la página Home en la base de datos.')
    process.exit(1)
  }

  const page = res.docs[0]
  const currentLayout = (page.layout as any[]) || []
  const galleryBlockIdx = currentLayout.findIndex((b) => b.blockType === 'gallery')

  if (galleryBlockIdx === -1) {
    console.error('❌ Error: La página Home no contiene un bloque "gallery".')
    process.exit(1)
  }

  const galleryBlock = currentLayout[galleryBlockIdx]
  const collections: any[] = galleryBlock.collections || []

  const resolveTabIndex = (tabIdentifier: string): number => {
    const idLower = tabIdentifier.toLowerCase()
    return collections.findIndex((col: any) => {
      const colId = (col.id || '').toLowerCase()
      const title = (col.title || '').toLowerCase()
      return colId === idLower || title.includes(idLower)
    })
  }

  if (action === 'list') {
    console.log('\n📸 Galería de la Landing Page (Momentos, Eventos & Clientas)\n')
    collections.forEach((col: any, idx: number) => {
      console.log(`📌 Tab [${idx}] ${col.title} (ID: ${col.id})`)
      console.log(`   Subtítulo: ${col.subtitle || 'Sin subtítulo'}`)
      const images: any[] = col.images || []
      console.log(`   Total Fotos: ${images.length}`)
      images.forEach((img: any, iIdx: number) => {
        const url = img.imageUrl || (typeof img.image === 'object' ? img.image?.url : '')
        console.log(`     [${iIdx}] ${img.title || 'Sin título'} -> ${url}`)
      })
      console.log('')
    })
    process.exit(0)
  }

  if (action === 'add') {
    const getArg = (flag: string): string | undefined => {
      const idx = args.indexOf(flag)
      return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined
    }

    const tab = getArg('--tab')
    const imageUrl = getArg('--imageUrl')
    const title = getArg('--title') || 'Momento Nénufar'

    if (!tab || !imageUrl) {
      console.error('❌ Error: Debes especificar --tab ("clientas" | "ferias" | "talleres" | "taller") y --imageUrl')
      process.exit(1)
    }

    const tabIdx = resolveTabIndex(tab)
    if (tabIdx === -1) {
      console.error(`❌ Error: No se encontró la pestaña "${tab}". Opciones válidas: clientas, ferias, talleres, taller`)
      process.exit(1)
    }

    const targetCollection = collections[tabIdx]
    targetCollection.images = targetCollection.images || []
    targetCollection.images.push({
      title,
      imageUrl,
    })

    const newLayout = [...currentLayout]
    newLayout[galleryBlockIdx] = {
      ...galleryBlock,
      collections,
    }

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        layout: newLayout,
      },
      overrideAccess: true,
      context: {
        disableRevalidate: true,
      },
    })

    console.log(`\n✅ Foto agregada exitosamente a la pestaña "${targetCollection.title}" en la Landing Page.`)
    console.log(`   Título: ${title}`)
    console.log(`   URL: ${imageUrl}\n`)
    return
  }

  if (action === 'remove') {
    const getArg = (flag: string): string | undefined => {
      const idx = args.indexOf(flag)
      return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined
    }

    const tab = getArg('--tab')
    const indexStr = getArg('--index')

    if (!tab || indexStr === undefined) {
      console.error('❌ Error: Debes especificar --tab y --index (ej. --tab clientas --index 1)')
      process.exit(1)
    }

    const tabIdx = resolveTabIndex(tab)
    if (tabIdx === -1) {
      console.error(`❌ Error: No se encontró la pestaña "${tab}".`)
      process.exit(1)
    }

    const targetCollection = collections[tabIdx]
    const removeIdx = Number(indexStr)
    if (isNaN(removeIdx) || removeIdx < 0 || removeIdx >= (targetCollection.images || []).length) {
      console.error(`❌ Error: Índice ${indexStr} fuera de rango. Total fotos en este tab: ${(targetCollection.images || []).length}`)
      process.exit(1)
    }

    const removed = targetCollection.images.splice(removeIdx, 1)

    const newLayout = [...currentLayout]
    newLayout[galleryBlockIdx] = {
      ...galleryBlock,
      collections,
    }

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        layout: newLayout,
      },
      overrideAccess: true,
      context: {
        disableRevalidate: true,
      },
    })

    console.log(`\n🗑️  Foto [${removeIdx}] "${removed[0]?.title || 'Sin título'}" eliminada con éxito de "${targetCollection.title}".\n`)
    return
  }

  console.log('Comandos soportados: list, add, remove')
}

main().catch((err) => {
  console.error('Error ejecutando script de galería:', err)
  process.exit(1)
})
