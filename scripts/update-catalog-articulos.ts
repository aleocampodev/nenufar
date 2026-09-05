import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import config from '../src/payload.config'
import { getPayload } from 'payload'

const SOURCE_DIR = '/home/ale/Imágenes/nenufar/nenufar-productos'

const ARTICULOS = [
  {
    num: 1,
    file: 'articulo1.jpeg',
    title: 'Conjunto Lirio Esmeralda',
    slug: 'conjunto-lirio-esmeralda',
    priceInCOP: 85000,
    categoryTitles: ['Conjuntos', 'Aretes'],
    featured: true,
    inventory: 8,
    alt: 'Conjunto de gargantilla rígida dorada con flor esmeralda y aretes en mostacilla checa',
    shortDesc: 'Gargantilla rígida con dije de flor en mostacilla checa tonos esmeralda y aretes a juego.',
    fullDesc: 'Exclusivo conjunto de alta joyería artesanal tejido a mano en Cartagena por Shirley. Cuenta con una gargantilla rígida dorada de estilo contemporáneo coronada por un majestuoso dije floral tejido en micro-mostacillas checas calibradas en tonos verde esmeralda y azul profundo. Incluye aretes a juego con herrajes hipoalergénicos en baño dorado.'
  },
  {
    num: 2,
    file: 'articulo2.jpeg',
    title: 'Set Imperial Flor de Nieve',
    slug: 'set-imperial-flor-de-nieve',
    priceInCOP: 110000,
    categoryTitles: ['Conjuntos'],
    featured: true,
    inventory: 5,
    alt: 'Set imperial gargantilla, aretes y anillo con flor de nieve tejida en blanco y oro',
    shortDesc: 'Trilogía artesanal de gargantilla dorada, aretes y anillo ajustable con flor tejida en blanco y oro.',
    fullDesc: 'Juego ceremonial completo de tres piezas: gargantilla rígida dorada con colgante de flor tejida a mano con micro-mostacillas blancas, centros oro y fucsia; aretes con broches trenzados en filigrana artesanal; y anillo floral ajustable a juego. Una obra de arte portable perfecta para ocasiones memorables.'
  },
  {
    num: 3,
    file: 'articulo3.jpeg',
    title: 'Collar Ceremonial Colibrí del Caribe',
    slug: 'collar-ceremonial-colibri-del-caribe',
    priceInCOP: 75000,
    categoryTitles: ['Collares', 'Aretes'],
    featured: true,
    inventory: 6,
    alt: 'Collar colibrí en vuelo tridimensional y aretes en mostacilla checa colores fuego',
    shortDesc: 'Collar en cordón negro trenzado con dije 3D de colibrí en degradé fuego y aretes a juego.',
    fullDesc: 'Inspirado en la libertad y la fauna del Caribe colombiano. Presenta un collar tejido en espiral continua en tono azabache mate con un colibrí tridimensional desplegando sus alas en un degradé ardiente de naranja, rojo carmesí y destellos violetas. Incluye aretes ligeros a juego con base texturizada.'
  },
  {
    num: 4,
    file: 'articulo4.jpeg',
    title: 'Aretes Piña Dorada del Sinú',
    slug: 'aretes-pina-dorada-del-sinu',
    priceInCOP: 45000,
    categoryTitles: ['Aretes'],
    featured: true,
    inventory: 12,
    alt: 'Aretes artesanales piña tejida en relieve 3D con follaje verde y hojas doradas',
    shortDesc: 'Aretes con piña 3D en mostacilla amarilla y ámbar, coronados por hojas en baño de oro.',
    fullDesc: 'Homenaje a la frescura y abundancia de las tierras caribeñas. Aretes con cuerpo de piña en tejido tridimensional denso con micro-mostacillas amarillas y sombras ámbar, copete verde esmeralda y herrajes superiores labrados en forma de ramas botánicas con baño de oro.'
  },
  {
    num: 5,
    file: 'articulo5.jpeg',
    title: 'Gargantilla Tubular Étnica & Aretes Rombo',
    slug: 'gargantilla-tubular-etnica-aretes-rombo',
    priceInCOP: 95000,
    categoryTitles: ['Conjuntos', 'Collares'],
    featured: false,
    inventory: 7,
    alt: 'Gargantilla tubular multicolor en mostacilla sobre azul cobalto con aretes romboidales',
    shortDesc: 'Gargantilla tubular con patronaje geométrico ancestral y aretes en rombo peyote.',
    fullDesc: 'Pieza de colección inspirada en los tejidos geométricos originarios. Estructura tubular firme con base azul cobalto y bloques de color en amarillo solar, verde selva y carmín. Se acompaña de aretes colgantes en rombo escalonado tejidos punto por punto con técnica peyote.'
  },
  {
    num: 6,
    file: 'articulo6.jpeg',
    title: 'Aretes Alas de Cartagena',
    slug: 'aretes-alas-de-cartagena',
    priceInCOP: 40000,
    categoryTitles: ['Aretes'],
    featured: false,
    inventory: 15,
    alt: 'Aretes con forma de alas de mariposa en mostacilla tricolor rojo, amarillo y verde',
    shortDesc: 'Aretes con silueta de mariposa y franjas tricolor de la bandera cartagenera.',
    fullDesc: 'Ligeros, vibrantes y llenos de identidad caribeña. Diseñados con la silueta de alas de mariposa en vuelo, luciendo con orgullo los tres colores representativos de Cartagena: rojo carmesí, amarillo cálido y verde esperanza. Cierre seguro tipo anzuelo antialérgico.'
  },
  {
    num: 7,
    file: 'articulo7.jpeg',
    title: 'Pectoral Solar Flor del Fuego',
    slug: 'pectoral-solar-flor-del-fuego',
    priceInCOP: 120000,
    categoryTitles: ['Collares'],
    featured: true,
    inventory: 4,
    alt: 'Pectoral artesanal calado con flor solar en mostacillas naranja, amarillo y ramales verdes',
    shortDesc: 'Pectoral imponente con flor estelar calada en degradé fuego y cordones en mostacilla verde.',
    fullDesc: 'Una de las piezas más laboriosas de Shirley, requiriendo más de 25 horas de tejido paciente. Pectoral calado con geometría fractal que evoca la energía del sol sobre el mar Caribe, complementado por ramales botánicos laterales y cordón de cuello en verde esmeralda profundo.'
  },
  {
    num: 8,
    file: 'articulo8.jpeg',
    title: 'Prendedor & Colgante Rosa Ámbar Silvestre',
    slug: 'prendedor-colgante-rosa-ambar-silvestre',
    priceInCOP: 65000,
    categoryTitles: ['Accesorios', 'Collares'],
    featured: false,
    inventory: 10,
    alt: 'Rosa tridimensional en mostacilla champaña y oro con hojas verdes sobre cordón natural',
    shortDesc: 'Rosa en relieve 3D en mostacilla champaña con pétalos ondulados y cordón natural.',
    fullDesc: 'Excepcional escultura floral textil que funciona tanto como colgante como broche de gala. Cada pétalo posee curvatura natural tejida con micro-mostacillas en tonalidad champaña nacarada y ribetes en oro viejo, rematada con dos hojas en verde esmeralda y cordón suave con terminal tejida.'
  }
]

function createLexicalDescription(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function main() {
  const payload = await getPayload({ config })
  console.log('🚀 Iniciando sincronización de los 8 artículos del catálogo...')

  // 1. Crear o actualizar categorías usando el campo `title`
  const categoryTitles = ['Aretes', 'Collares', 'Conjuntos', 'Accesorios']
  const categoryMap = new Map<string, number>()

  for (const title of categoryTitles) {
    const existing = await payload.find({
      collection: 'categories',
      where: {
        title: { equals: title }
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      categoryMap.set(title, doc.id)
      console.log(`✓ Categoría existente: ${title} (#${doc.id})`)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: {
          title,
        },
      })
      categoryMap.set(title, created.id)
      console.log(`+ Creada categoría: ${title} (#${created.id})`)
    }
  }

  // 2. Subir o sincronizar las 8 imágenes a Media
  const mediaMap = new Map<number, any>()

  for (const item of ARTICULOS) {
    const filePath = path.join(SOURCE_DIR, item.file)
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Archivo no encontrado: ${filePath}`)
      continue
    }

    const fileBuffer = fs.readFileSync(filePath)
    const fileName = item.file

    // Verificar si ya existe en Media
    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        filename: { equals: fileName },
      },
      limit: 1,
    })

    let mediaDoc: any = null
    if (existingMedia.docs.length > 0) {
      mediaDoc = existingMedia.docs[0]
      console.log(`✓ Media existente para ${fileName} (#${mediaDoc.id})`)
    } else {
      console.log(`Subiendo nueva media para ${fileName}...`)
      mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: item.alt,
        },
        file: {
          name: fileName,
          data: fileBuffer,
          mimetype: 'image/jpeg',
          size: fileBuffer.length,
        },
      })
      console.log(`+ Creado media #${mediaDoc.id} para ${fileName}`)
    }

    mediaMap.set(item.num, mediaDoc)
  }

  // 3. Limpiar productos antiguos de prueba si existen para dejar limpio el catálogo oficial
  const allExistingProducts = await payload.find({
    collection: 'products',
    limit: 100,
  })

  // Identificar slugs oficiales de los 8 artículos
  const officialSlugs = new Set(ARTICULOS.map(a => a.slug))

  for (const p of allExistingProducts.docs) {
    if (!officialSlugs.has(p.slug || '')) {
      console.log(`Eliminando producto antiguo de prueba: "${p.title}" (slug: ${p.slug})`)
      await payload.delete({
        collection: 'products',
        id: p.id,
      })
    }
  }

  // 4. Crear o actualizar los 8 productos oficiales
  const baseTime = Date.now()
  for (let idx = 0; idx < ARTICULOS.length; idx++) {
    const item = ARTICULOS[idx]
    const mediaDoc = mediaMap.get(item.num)
    if (!mediaDoc) {
      console.warn(`No hay media para artículo ${item.num}, omitiendo...`)
      continue
    }

    const catIds = item.categoryTitles
      .map(t => categoryMap.get(t))
      .filter((id): id is number => typeof id === 'number')

    // Asignar timestamps descendentes para que aparezcan ordenados 1..8 por defecto
    const orderedCreatedAt = new Date(baseTime + (ARTICULOS.length - idx) * 60000).toISOString()

    const productPayload: any = {
      title: item.title,
      slug: item.slug,
      priceInCOP: item.priceInCOP,
      priceInCOPEnabled: true,
      inventory: item.inventory,
      featured: item.featured,
      _status: 'published',
      enableVariants: false,
      gallery: [
        {
          image: mediaDoc.id,
        },
      ],
      categories: catIds,
      description: createLexicalDescription(item.fullDesc),
      createdAt: orderedCreatedAt,
      meta: {
        title: `${item.title} | Nenúfar Joyería Artesanal`,
        description: item.shortDesc,
        image: mediaDoc.id,
      },
    }

    const existingProd = await payload.find({
      collection: 'products',
      where: {
        slug: { equals: item.slug },
      },
      limit: 1,
    })

    if (existingProd.docs.length > 0) {
      const updated = await payload.update({
        collection: 'products',
        id: existingProd.docs[0].id,
        data: productPayload,
      })
      console.log(`🔄 Actualizado producto: "${updated.title}" (#${updated.id}) con ${item.file}`)
    } else {
      const created = await payload.create({
        collection: 'products',
        data: productPayload,
      })
      console.log(`✨ Creado producto: "${created.title}" (#${created.id}) con ${item.file}`)
    }
  }

  console.log('🎉 ¡Los 8 artículos de nenufar-productos han sido integrados con éxito al catálogo!')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error fatal al actualizar catálogo:', err)
    process.exit(1)
  })
