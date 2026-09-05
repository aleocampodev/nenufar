import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ANTHROPIC_SHIRLEY_TOOLS, executeShirleyTool } from '@/lib/agent/tools'

const createMockPayload = () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  find: vi.fn(async () => ({ docs: [], totalDocs: 0 })),
  findByID: vi.fn(async () => null),
  create: vi.fn(async ({ data }: any) => ({ id: 101, ...data })),
  update: vi.fn(async ({ id, data }: any) => ({ id, ...data })),
  delete: vi.fn(async ({ id }: any) => ({ id, title: 'Taller Mostacilla' })),
})

describe('Shirley Agent Tools - Cobertura Total de Skills', () => {
  let mockPayload: ReturnType<typeof createMockPayload>

  beforeEach(() => {
    mockPayload = createMockPayload()
    vi.clearAllMocks()
  })

  describe('Definición de Esquemas (ANTHROPIC_SHIRLEY_TOOLS)', () => {
    it('registra todas las herramientas requeridas con esquemas válidos', () => {
      const toolNames = ANTHROPIC_SHIRLEY_TOOLS.map((t) => t.name)
      const expectedTools = [
        'buscarProducto',
        'crearProductoDraft',
        'publicarProducto',
        'actualizarInventario',
        'destacarProducto',
        'crearCategoria',
        'listarCategorias',
        'asignarCategoriaProducto',
        'pedidosPendientes',
        'confirmarPedido',
        'agregarFotoGaleria',
        'listarFotosGaleria',
        'eliminarFotoGaleria',
        'publicarEvento',
        'listarEventos',
        'eliminarEvento',
        'crearTestimonio',
        'listarTestimonios',
        'generarCopyProducto',
        'actualizarDescripcionProducto',
        'generarCopyLanding',
      ]

      for (const tool of expectedTools) {
        expect(toolNames).toContain(tool)
      }
    })
  })

  describe('Catálogo & Joyas', () => {
    it('buscarProducto: devuelve lista de piezas con precio en COP y stock', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          { id: 1, title: 'Aretes Filigrana Sol', priceInCOP: 45000, inventory: 5, slug: 'aretes-sol' },
          { id: 2, title: 'Collar Mostacilla Coral', priceInCOP: 65000, inventory: 0, slug: 'collar-coral' },
        ],
      } as any)

      const res = await executeShirleyTool('buscarProducto', { consulta: 'aretes' }, mockPayload as any)

      expect(res).toContain('Encontré 2 pieza(s)')
      expect(res).toContain('Aretes Filigrana Sol')
      expect(res).toContain('$ 45.000')
      expect(res).toContain('(5 disp.)')
      expect(res).toContain('Sin stock')
    })

    it('buscarProducto: mensaje amigable cuando no hay coincidencias', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [] } as any)

      const res = await executeShirleyTool('buscarProducto', { consulta: 'esmeralda' }, mockPayload as any)
      expect(res).toContain('No encontré piezas para "esmeralda"')
    })

    it('crearProductoDraft: crea joya en borrador con precio y categoría', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [{ id: 7, title: 'Aretes', slug: 'aretes' }] } as any)

      const res = await executeShirleyTool(
        'crearProductoDraft',
        {
          titulo: 'Aretes Mar Caribe',
          precioCOP: 52000,
          inventario: 3,
          categoria: 'Aretes',
          publicar: false,
        },
        mockPayload as any,
      )

      expect(res).toContain('Aretes Mar Caribe')
      expect(res).toContain('guardada como borrador')
      expect(res).toContain('$ 52.000')
      expect(mockPayload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'products',
          data: expect.objectContaining({
            title: 'Aretes Mar Caribe',
            priceInCOP: 52000,
            inventory: 3,
            categories: [7],
            _status: 'draft',
          }),
        }),
      )
    })

    it('crearProductoDraft: publica joya directamente en la tienda web con foto', async () => {
      const res = await executeShirleyTool(
        'crearProductoDraft',
        {
          titulo: 'Pulsera Coral Getsemaní',
          precioCOP: 38000,
          inventario: 10,
          publicar: true,
          mediaId: 99,
        },
        mockPayload as any,
      )

      expect(res).toContain('publicada exitosamente en el catálogo (/shop)')
      expect(res).toContain('$ 38.000')
      expect(mockPayload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            _status: 'published',
            images: [{ image: 99 }],
          }),
        }),
      )
    })

    it('publicarProducto: cambia estado a publicado y a borrador', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 5, title: 'Collar Loto', slug: 'collar-loto' }],
      } as any)

      const pubRes = await executeShirleyTool('publicarProducto', { slug: 'collar-loto', publicar: true }, mockPayload as any)
      expect(pubRes).toContain('fue publicado y ya está visible')

      const draftRes = await executeShirleyTool('publicarProducto', { slug: 'collar-loto', publicar: false }, mockPayload as any)
      expect(draftRes).toContain('cambiado a borrador')
    })

    it('publicarProducto: retorna error si el producto no existe', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [] } as any)
      const res = await executeShirleyTool('publicarProducto', { slug: 'inexistente' }, mockPayload as any)
      expect(res).toContain('No encontré ningún producto')
    })

    it('actualizarInventario: actualiza stock y precio COP correctamente', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 12, title: 'Anillo Filigrana', slug: 'anillo-filigrana' }],
      } as any)

      const res = await executeShirleyTool(
        'actualizarInventario',
        { slug: 'anillo-filigrana', inventario: 8, precioCOP: 35000 },
        mockPayload as any,
      )

      expect(res).toContain('inventario → 8 unidades')
      expect(res).toContain('precio → $ 35.000')
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'products',
          id: 12,
          data: { inventory: 8, priceInCOPEnabled: true, priceInCOP: 35000 },
        }),
      )
    })

    it('destacarProducto: marca y desmarca joya destacada', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 4, title: 'Gargantilla Caribe', slug: 'gargantilla-caribe' }],
      } as any)

      const destRes = await executeShirleyTool('destacarProducto', { slug: 'gargantilla-caribe', destacado: true }, mockPayload as any)
      expect(destRes).toContain('ahora está marcado como producto destacado')

      const unDestRes = await executeShirleyTool('destacarProducto', { slug: 'gargantilla-caribe', destacado: false }, mockPayload as any)
      expect(unDestRes).toContain('ya no aparece como producto destacado')
    })

    it('crearCategoria: crea nueva categoría si no existe', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [] } as any)

      const res = await executeShirleyTool('crearCategoria', { titulo: 'Anillos de Autor' }, mockPayload as any)
      expect(res).toContain('Categoría "Anillos de Autor" creada exitosamente')
      expect(mockPayload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'categories',
          data: { title: 'Anillos de Autor', slug: 'anillos-de-autor' },
        }),
      )
    })

    it('crearCategoria: informa amablemente si la categoría ya existía', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 2, title: 'Collares', slug: 'collares' }],
      } as any)

      const res = await executeShirleyTool('crearCategoria', { titulo: 'Collares' }, mockPayload as any)
      expect(res).toContain('ya existía en el catálogo')
    })

    it('listarCategorias: muestra todas las categorías con el conteo de joyas', async () => {
      mockPayload.find
        .mockResolvedValueOnce({
          docs: [
            { id: 1, title: 'Aretes' },
            { id: 2, title: 'Collares' },
          ],
        } as any)
        .mockResolvedValueOnce({ totalDocs: 6 } as any)
        .mockResolvedValueOnce({ totalDocs: 4 } as any)

      const res = await executeShirleyTool('listarCategorias', {}, mockPayload as any)
      expect(res).toContain('Categorías en el catálogo (2)')
      expect(res).toContain('• Aretes (6 joyas)')
      expect(res).toContain('• Collares (4 joyas)')
    })

    it('asignarCategoriaProducto: vincula categoría al producto', async () => {
      mockPayload.find
        .mockResolvedValueOnce({ docs: [{ id: 1, title: 'Pulsera Sol', slug: 'pulsera-sol' }] } as any)
        .mockResolvedValueOnce({ docs: [{ id: 8, title: 'Pulseras', slug: 'pulseras' }] } as any)
      mockPayload.findByID.mockResolvedValueOnce({ id: 1, title: 'Pulsera Sol', categories: [] } as any)

      const res = await executeShirleyTool(
        'asignarCategoriaProducto',
        { slug: 'pulsera-sol', categoria: 'Pulseras' },
        mockPayload as any,
      )

      expect(res).toContain('Asocié la categoría "Pulseras" a la joya "Pulsera Sol"')
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          data: { categories: [8] },
        }),
      )
    })
  })



  describe('Pedidos', () => {
    it('pedidosPendientes: lista pedidos en procesamiento con items y total', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          {
            id: 105,
            amount: 85000,
            customerEmail: 'cliente@gmail.com',
            items: [{ product: { title: 'Collar Filigrana' }, quantity: 1 }],
          },
        ],
      } as any)

      const res = await executeShirleyTool('pedidosPendientes', {}, mockPayload as any)
      expect(res).toContain('Pedido #105')
      expect(res).toContain('$ 85.000')
      expect(res).toContain('1x Collar Filigrana')
    })

    it('pedidosPendientes: mensaje cuando todo está al día', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [] } as any)
      const res = await executeShirleyTool('pedidosPendientes', {}, mockPayload as any)
      expect(res).toContain('No tienes pedidos pendientes')
    })

    it('confirmarPedido: marca pedido como completado', async () => {
      mockPayload.findByID.mockResolvedValueOnce({ id: 105, status: 'processing', amount: 85000 } as any)

      const res = await executeShirleyTool('confirmarPedido', { pedidoId: 105 }, mockPayload as any)
      expect(res).toContain('Pedido #105 confirmado exitosamente')
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'orders',
          id: 105,
          data: { status: 'completed' },
        }),
      )
    })
  })

  describe('Talleres, Ferias & Testimonios', () => {
    it('publicarEvento: publica taller presencial en Cartagena', async () => {
      const res = await executeShirleyTool(
        'publicarEvento',
        {
          titulo: 'Taller de Mostacilla Getsemaní',
          fecha: '2026-10-15T10:00:00-05:00',
          lugar: 'Taller Shirley, Getsemaní',
          descripcion: 'Aprende a tejer tu primer accesorio',
          tipo: 'taller',
        },
        mockPayload as any,
      )

      expect(res).toContain('Taller de Mostacilla Getsemaní')
      expect(res).toContain('taller')
      expect(mockPayload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'events',
          data: expect.objectContaining({
            title: 'Taller de Mostacilla Getsemaní',
            type: 'taller',
            _status: 'published',
          }),
        }),
      )
    })

    it('listarEventos y eliminarEvento', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          { id: 4, title: 'Feria de Joyas', type: 'feria', date: '2026-08-29T00:00:00.000Z', location: 'Cartagena' },
          { id: 5, title: 'Taller de Joyas Ancestrales', type: 'taller', date: '2026-09-04T21:00:00.000Z', location: 'Getsemaní' },
        ],
      } as any)

      const listRes = await executeShirleyTool('listarEventos', {}, mockPayload as any)
      expect(listRes).toContain('Tienes 2 actividad(es) programada(s)')
      expect(listRes).toContain('Feria de Joyas')
      expect(listRes).toContain('Taller de Joyas Ancestrales')

      const deleteRes = await executeShirleyTool('eliminarEvento', { eventoId: 4 }, mockPayload as any)
      expect(deleteRes).toContain('Eliminé')
      expect(mockPayload.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'events',
          id: 4,
        }),
      )
    })

    it('crearTestimonio y listarTestimonios', async () => {
      const createRes = await executeShirleyTool(
        'crearTestimonio',
        {
          nombre: 'Valentina P.',
          testimonio: 'Mis aretes son hermosos y no pesan nada.',
          rol: 'Cartagena',
          calificacion: 5,
          mediaId: 44,
        },
        mockPayload as any,
      )

      expect(createRes).toContain('Valentina P.')
      expect(createRes).toContain('fue publicado exitosamente')

      mockPayload.find.mockResolvedValueOnce({
        docs: [
          { id: 1, authorName: 'Valentina P.', quote: 'Mis aretes son hermosos y no pesan nada.' },
        ],
      } as any)

      const listRes = await executeShirleyTool('listarTestimonios', {}, mockPayload as any)
      expect(listRes).toContain('Tienes 1 testimonio(s)')
      expect(listRes).toContain('Valentina P.')

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 1, authorName: 'Valentina P.' }],
      } as any)

      const delRes = await executeShirleyTool('eliminarTestimonio', { nombre: 'Valentina' }, mockPayload as any)
      expect(delRes).toContain('Eliminé el testimonio de "Valentina P."')
    })
  })

  describe('Copywriting & Textos', () => {
    it('generarCopyProducto: genera propuesta artesanal con historia', async () => {
      const res = await executeShirleyTool(
        'generarCopyProducto',
        {
          nombrePieza: 'Aretes Flor Caribe',
          materialesOTecnica: 'mostacilla checa tejida a mano',
          ocasionOEstilo: 'elegantes y livianos',
        },
        mockPayload as any,
      )

      expect(res).toContain('Aretes Flor Caribe')
      expect(res).toContain('Cartagena de Indias')
      expect(res).toContain('mostacilla checa tejida a mano')
    })

    it('actualizarDescripcionProducto: guarda descripción en Lexical', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 9, title: 'Aretes Coral', slug: 'aretes-coral' }],
      } as any)

      const res = await executeShirleyTool(
        'actualizarDescripcionProducto',
        {
          slug: 'aretes-coral',
          descripcion: 'Pieza única tejida a mano en Cartagena de Indias con amor.',
        },
        mockPayload as any,
      )

      expect(res).toContain('actualizada en la tienda web')
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'products',
          id: 9,
          data: expect.objectContaining({
            description: expect.objectContaining({
              root: expect.objectContaining({
                type: 'root',
              }),
            }),
          }),
        }),
      )
    })

    it('generarCopyLanding: genera textos para hero y cta', async () => {
      const heroRes = await executeShirleyTool('generarCopyLanding', { seccion: 'hero' }, mockPayload as any)
      expect(heroRes).toContain('Hero Principal')

      const ctaRes = await executeShirleyTool('generarCopyLanding', { seccion: 'cta' }, mockPayload as any)
      expect(ctaRes).toContain('Pedidos Personalizados')
    })

    it('agregarFotoGaleria: agrega foto a la categoría indicada en el CMS', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          {
            id: 3,
            slug: 'home',
            layout: [
              {
                blockType: 'gallery',
                tabs: [
                  { tabTitle: 'Nuestras Clientas', images: [] },
                  { tabTitle: 'Ferias en Cartagena', images: [] },
                ],
              },
            ],
          },
        ],
      } as any)

      const res = await executeShirleyTool(
        'agregarFotoGaleria',
        {
          categoria: 'clientas',
          titulo: 'Clienta con aretes café en Getsemaní',
          mediaId: 42,
        },
        mockPayload as any,
      )

      expect(res).toContain('agregada exitosamente a la galería')
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'pages',
          id: 3,
        }),
      )
    })

    it('listarFotosGaleria: lista fotos agrupadas por pestañas', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          {
            id: 3,
            slug: 'home',
            layout: [
              {
                blockType: 'gallery',
                tabs: [
                  {
                    tabTitle: 'Nuestras Clientas',
                    images: [{ title: 'Aretes Coral' }, { title: 'Collar Okama' }],
                  },
                ],
              },
            ],
          },
        ],
      } as any)

      const res = await executeShirleyTool('listarFotosGaleria', {}, mockPayload as any)
      expect(res).toContain('Nuestras Clientas (2 fotos)')
      expect(res).toContain('Aretes Coral')
      expect(res).toContain('Collar Okama')
    })

    it('eliminarFotoGaleria: elimina foto por título', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          {
            id: 3,
            slug: 'home',
            layout: [
              {
                blockType: 'gallery',
                tabs: [
                  {
                    tabTitle: 'Nuestras Clientas',
                    images: [{ title: 'Foto a borrar' }],
                  },
                ],
              },
            ],
          },
        ],
      } as any)

      const res = await executeShirleyTool('eliminarFotoGaleria', { titulo: 'Foto a borrar' }, mockPayload as any)
      expect(res).toContain('Eliminé "Foto a borrar"')
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'pages',
          id: 3,
        }),
      )
    })

    it('manejo de tool no reconocida y excepciones', async () => {
      const unkRes = await executeShirleyTool('herramientaInexistente', {}, mockPayload as any)
      expect(unkRes).toContain('no reconocida')

      mockPayload.find.mockRejectedValueOnce(new Error('DB Connection Failed'))
      const errRes = await executeShirleyTool('buscarProducto', { consulta: 'error' }, mockPayload as any)
      expect(errRes).toContain('Ocurrió un inconveniente')
    })
  })
})
