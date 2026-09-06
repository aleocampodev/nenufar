import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../src/payload.config'
import { getPayload } from 'payload'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FILE = path.resolve(__dirname, '../public/palenquera-hdr-sin-fondo.svg')
const ALT = 'Mujer palenquera luciendo joyería artesanal de autor en micro-mostacilla Nénufar'

async function main() {
  const payload = await getPayload({ config })

  // 1. Reutilizar si ya existe en la librería
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'palenquera-hdr-sin-fondo.svg' } },
    limit: 1,
    overrideAccess: true,
  })

  let mediaId: number | string
  if (existing.docs.length > 0) {
    mediaId = existing.docs[0].id
    console.log('♻️  Ya existe en Medios y Archivos, id:', mediaId)
  } else {
    const buffer = await fs.promises.readFile(FILE)
    const created = await payload.create({
      collection: 'media',
      data: { alt: ALT },
      file: {
        data: buffer,
        mimetype: 'image/svg+xml',
        name: 'palenquera-hdr-sin-fondo.svg',
        size: buffer.length,
      },
      overrideAccess: true,
    })
    mediaId = created.id
    console.log('✅ Subida a Medios y Archivos, id:', mediaId)
  }

  // 2. Asignarla como foto del hero en la home
  const pages = await payload.find({
    collection: 'pages',
    where: { or: [{ slug: { equals: 'home' } }, { slug: { equals: 'inicio' } }] },
    limit: 1,
    overrideAccess: true,
  })
  if (!pages.docs.length) {
    console.error('❌ No se encontró la página home')
    process.exit(1)
  }

  await payload.update({
    collection: 'pages',
    id: pages.docs[0].id,
    data: { hero: { ...(pages.docs[0].hero as any), modelImage: mediaId } as any },
    overrideAccess: true,
  })
  console.log('✅ Hero de la home apunta al medio id:', mediaId)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
