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
    overrideAccess: true,
  })

  if (!res.docs.length) {
    console.error('❌ No se encontró la página home')
    process.exit(1)
  }

  const page = res.docs[0]
  console.log('Página actual:', page.id, page.slug)

  // Preservar la imagen de media si existe
  const currentSlides = (page.hero as any)?.slides || []
  const firstSlideImg = currentSlides[0]?.image

  const updatedHero = {
    ...(page.hero as any),
    type: 'hero',
    badge: '',
    slides: [
      {
        badge: '',
        heading: 'La nobleza del Caribe no se hereda. Se teje.',
        metaText: 'CARTAGENA DE INDIAS • TEJIDO ANCESTRAL • PIEZAS DE AUTOR',
        subheading:
          'Micro-mostacilla checa calibrada, tejida a mano con precisión milimétrica y la vibrante herencia del Caribe. Piezas de autor exclusivas diseñadas para elevar tu estilo con una joya irrepetible que cuenta una historia viva.',
        tabTitle: 'Herencia Caribeña',
        linkLabel: '',
        linkUrl: '',
        imagePosition: 'center',
        image: firstSlideImg || {
          url: '/landing-modify-traced.svg',
          alt: 'Mujer palenquera luciendo joyería en micro-mostacilla Nénufar',
        },
      },
    ],
  }

  const updated = await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      hero: updatedHero as any,
    },
    overrideAccess: true,
  })

  console.log('✅ Página actualizada con éxito. Nuevo hero:')
  console.log(JSON.stringify(updated.hero, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
