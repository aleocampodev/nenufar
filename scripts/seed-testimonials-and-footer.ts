import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function run() {
  const payload = await getPayload({ config: configPromise })

  console.log('Seeding Testimonials collection...')
  const initialTestimonials = [
    {
      authorName: 'María José',
      authorRole: 'Cartagena',
      quote: 'Mi collar de mostacilla es una obra de arte. Se nota el amor y la dedicación en cada detalle. ¡Shirley es una artista!',
      rating: 5,
      featured: true,
      _status: 'published' as const,
    },
    {
      authorName: 'Laura V.',
      authorRole: 'Bogotá',
      quote: 'El empaque es hermoso y el envío llegó perfecto. Mis aretes son cómodos y brillan muchísimo.',
      rating: 5,
      featured: true,
      _status: 'published' as const,
    },
    {
      authorName: 'Camila R.',
      authorRole: 'Medellín — Taller de Mostacilla',
      quote: 'Tomé el taller de mostacilla y fue una experiencia hermosa. Aprendí mucho y me llevé mi primera pulsera.',
      rating: 5,
      featured: true,
      _status: 'published' as const,
    },
  ]

  for (const t of initialTestimonials) {
    const existing = await payload.find({
      collection: 'testimonials',
      where: { authorName: { equals: t.authorName } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'testimonials',
        data: t,
        overrideAccess: true,
        draft: false,
      })
      console.log(`Created testimonial for: ${t.authorName}`)
    } else {
      console.log(`Testimonial already exists for: ${t.authorName}`)
    }
  }

  console.log('Updating Footer Global...')
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            url: '/shop',
            label: 'Catálogo de Joyas',
          },
        },
        {
          link: {
            type: 'custom',
            url: '/#tradicion',
            label: 'Tradición Émbera',
          },
        },
        {
          link: {
            type: 'custom',
            url: '/#historia',
            label: 'Historia de Shirley',
          },
        },
        {
          link: {
            type: 'custom',
            url: '/#talleres',
            label: 'Talleres & Ferias',
          },
        },
        {
          link: {
            type: 'custom',
            url: '/#contacto',
            label: 'Pedidos Personalizados',
          },
        },
      ],
    },
    overrideAccess: true,
  })
  console.log('Footer Global updated with nav items!')

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
