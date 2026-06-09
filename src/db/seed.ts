import { getPayload } from 'payload'
import config from '../payload.config'

const crafts = [
  {
    name: 'Mochila Wayuu Tradicional',
    description: 'Mochila tejida a mano por artesanos de la comunidad Wayuu en La Guajira, Colombia. Cada diseño geométrico (Kanas) cuenta una historia ancestral de la cosmología Wayuu. Elaborada en hilos acrílicos de alta calidad, resistente y de colores vibrantes.',
    price_cop: 120000,
    materials: ['hilo acrílico', 'lana'],
    images: [{ url: '/images/mochila-wayuu.png' }],
    available: true,
  },
  {
    name: 'Mochila Wayuu Unicolor Elegante',
    description: 'Mochila Wayuu tejida a un solo tono (arena/terracota), combinando la sobriedad del diseño minimalista moderno con el tejido ancestral a crochet de una sola hebra. Cuenta con una gasa tejida clásica y cordón ajustable con borlas medianas.',
    price_cop: 140000,
    materials: ['hilo acrílico'],
    images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600' }],
    available: true,
  },
  {
    name: 'Mochila Wayuu de Lujo (Doble Hebra)',
    description: 'Edición especial de mochila Wayuu tejida en doble hebra con patrones geométricos kanas complejos y de altísima definición. La gasa o reata está elaborada en telar tradicional con flecos decorativos y borlas extra grandes de colores contrastantes.',
    price_cop: 195000,
    materials: ['hilo acrílico', 'lana fina'],
    images: [{ url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' }],
    available: true,
  },
  {
    name: 'Sombrero Vueltiao Zenú',
    description: 'Sombrero tradicional colombiano y símbolo cultural nacional, elaborado a partir de la fibra de la caña flecha. Tejido a mano por artesanos Zenúes en Tuchín, Córdoba. El modelo es de 21 vueltas, ofreciendo flexibilidad y durabilidad excepcionales.',
    price_cop: 250000,
    materials: ['caña flecha'],
    images: [{ url: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?auto=format&fit=crop&q=80&w=600' }],
    available: true,
  },
  {
    name: 'Jarrón de Barro de Ráquira',
    description: 'Jarrón de barro modelado a mano y cocido en horno tradicional en Ráquira, Boyacá. Con acabados rústicos en tonos terracota naturales y decoraciones pintadas a mano inspiradas en motivos andinos. Ideal para decoración de interiores.',
    price_cop: 75000,
    materials: ['arcilla', 'barro'],
    images: [{ url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600' }],
    available: true,
  }
]

async function seed() {
  try {
    console.log('Initializing Payload...')
    const payload = await getPayload({ config })

    console.log('Seeding admin user...')
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@agento.co',
        },
      },
    })

    if (users.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@agento.co',
          password: 'admin123456',
        },
      })
      console.log('Admin user created successfully! (admin@agento.co / admin123456)')
    } else {
      console.log('Admin user already exists.')
    }

    console.log('Clearing existing products...')
    await payload.delete({
      collection: 'products',
      where: {
        id: {
          exists: true
        }
      }
    })

    console.log('Seeding products...')
    for (const craft of crafts) {
      const existing = await payload.find({
        collection: 'products',
        where: {
          name: {
            equals: craft.name,
          },
        },
      })

      if (existing.docs.length === 0) {
        const product = await payload.create({
          collection: 'products',
          data: craft,
        })
        console.log(`Created product: ${product.name} (ID: ${product.id})`)
      } else {
        console.log(`Product already exists: ${craft.name}`)
      }
    }

    console.log('Waiting for background embedding generation...')
    await new Promise((resolve) => setTimeout(resolve, 8000))

    console.log('Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()
