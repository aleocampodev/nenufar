import { z } from 'zod'
import type { Payload } from 'payload'
import { executeShirleyTool } from './tools'

/**
 * Single source of truth for Shirley's tools (candidate #1 — Tool Registry).
 *
 * Every tool is declared exactly once here: name, description, zod input
 * shape, and whether it is destructive (needs Shirley's explicit "sí").
 * Derived artifacts — the SDK MCP server, the prompt tool inventory, the
 * destructive gate set — are built from this list, so they cannot drift.
 */

export interface ToolContext {
  payload: Payload
  chatId: number
  mediaId?: number
}

export interface ShirleyToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, z.ZodTypeAny>
  destructive: boolean
  run: (args: Record<string, any>, ctx: ToolContext) => Promise<string>
}

function local(
  name: string,
  description: string,
  inputSchema: Record<string, z.ZodTypeAny>,
  destructive = false,
): ShirleyToolDefinition {
  return {
    name,
    description,
    inputSchema,
    destructive,
    run: (args, ctx) =>
      executeShirleyTool(
        name,
        { ...args, ...(ctx.mediaId ? { mediaId: ctx.mediaId } : {}) },
        ctx.payload,
      ),
  }
}

export const SHIRLEY_TOOL_DEFINITIONS: ShirleyToolDefinition[] = [
  local('buscarProducto', 'Busca piezas de joyeria en el catalogo real de Nenufar por nombre o palabra clave. Devuelve solo piezas que existen en la base de datos.', {
    consulta: z.string().describe('Palabra clave, ej. "aretes", "collar", "pulsera"'),
  }),
  local('crearProductoDraft', 'Crea una joya nueva: borrador o publicada de inmediato en /shop. Si Shirley envio una foto, se vincula automaticamente.', {
    titulo: z.string().describe('Nombre de la pieza, ej. "Collar Filigrana Atardecer"'),
    precioCOP: z.number().optional().describe('Precio en pesos colombianos sin decimales (ej. 45000)'),
    inventario: z.number().optional().describe('Unidades disponibles (ej. 5)'),
    categoria: z.string().optional().describe('Categoria (ej. "Aretes"). Se crea si no existe.'),
    publicar: z.boolean().optional().describe('true para publicar de inmediato, false para borrador'),
  }),
  local('publicarProducto', 'Publica o pasa a borrador un producto existente para que sea visible (o invisible) en /shop.', {
    slug: z.string().describe('Slug o nombre del producto'),
    publicar: z.boolean().optional().describe('true para publicar, false para borrador'),
  }),
  local('actualizarInventario', 'Actualiza el inventario (unidades disponibles) y/o el precio en pesos colombianos de una joya por su slug.', {
    slug: z.string().describe('Slug del producto'),
    inventario: z.number().optional().describe('Nueva cantidad de unidades disponibles'),
    precioCOP: z.number().optional().describe('Nuevo precio en pesos colombianos, sin decimales'),
  }),
  local('destacarProducto', 'Marca o desmarca un producto como destacado en la tienda web y la landing.', {
    slug: z.string().describe('Slug del producto'),
    destacado: z.boolean().optional().describe('true para destacar, false para quitar destaque'),
  }),
  local('crearCategoria', 'Crea una nueva categoria en el catalogo (ej. "Aretes", "Collares"). Habilita filtros en /shop.', {
    titulo: z.string().describe('Nombre de la categoria, ej. "Tobilleras"'),
  }),
  local('listarCategorias', 'Lista todas las categorias de joyas registradas en el catalogo con el numero de piezas asociadas.', {}),
  local('asignarCategoriaProducto', 'Asigna o vincula una categoria a una joya existente del catalogo por su slug o nombre.', {
    slug: z.string().describe('Slug o nombre del producto'),
    categoria: z.string().describe('Nombre de la categoria a asignar (ej. "Aretes")'),
  }),
  local('pedidosPendientes', 'Lista los pedidos de la web pendientes de confirmacion o pago (estado processing).', {}),
  local('confirmarPedido', 'Marca un pedido como completado tras coordinar pago y envio. ACCION DESTRUCTIVA: siempre pide confirmacion primero.', {
    pedidoId: z.number().describe('Numero (ID) del pedido a confirmar'),
  }, true),
  local('agregarFotoGaleria', 'Agrega una fotografia a la galeria de Nenufar (/galeria): clientas, ferias, talleres o shirley. Si Shirley envio foto, se vincula.', {
    categoria: z.enum(['clientas', 'ferias', 'talleres', 'shirley']).describe('Pestana de la galeria'),
    titulo: z.string().describe('Titulo o pie de la foto'),
    descripcion: z.string().optional().describe('Descripcion breve opcional'),
    esDestacada: z.boolean().optional().describe('true para tamano destacado en la cuadricula'),
  }),
  local('listarFotosGaleria', 'Lista las fotos y momentos publicados en cada pestana de la galeria (/galeria).', {
    categoria: z.string().optional().describe('Filtro opcional: clientas, ferias, talleres o shirley'),
  }),
  local('eliminarFotoGaleria', 'Elimina una fotografia de la galeria por su titulo. ACCION DESTRUCTIVA: siempre pide confirmacion primero.', {
    titulo: z.string().describe('Titulo o parte del titulo de la foto a retirar'),
    categoria: z.string().optional().describe('Categoria opcional para afinar la busqueda'),
  }, true),
  local('publicarEvento', 'Agenda un taller, feria o pop-up en Cartagena para la seccion de la landing.', {
    titulo: z.string().describe('Nombre del taller o feria'),
    fecha: z.string().describe('Fecha y hora ISO o texto claro (ej. "2026-09-15T10:00:00-05:00")'),
    lugar: z.string().optional().describe('Lugar en Cartagena'),
    descripcion: z.string().optional().describe('Descripcion breve'),
    tipo: z.enum(['taller', 'feria']).optional().describe('Tipo de evento'),
  }),
  local('listarEventos', 'Lista todos los talleres, ferias o pop-ups programados con titulo, fecha y ubicacion.', {}),
  local('eliminarEvento', 'Elimina o cancela un taller o feria por ID o titulo. ACCION DESTRUCTIVA: siempre pide confirmacion primero.', {
    eventoId: z.number().optional().describe('ID numerico del evento'),
    titulo: z.string().optional().describe('Nombre o parte del nombre si no hay ID'),
  }, true),
  local('crearTestimonio', 'Guarda un testimonio de compradora con su foto para la seccion de testimonios de la landing.', {
    nombre: z.string().describe('Nombre de la clienta'),
    testimonio: z.string().describe('Cita textual u opinion sobre sus joyas'),
    rol: z.string().optional().describe('Ciudad u origen (ej. "Cartagena")'),
    calificacion: z.number().optional().describe('Calificacion de 1 a 5'),
  }),
  local('listarTestimonios', 'Lista los testimonios publicados en la landing.', {}),
  local('eliminarTestimonio', 'Elimina un testimonio por el nombre de la clienta. ACCION DESTRUCTIVA: siempre pide confirmacion primero.', {
    nombre: z.string().describe('Nombre de la clienta cuyo testimonio se elimina'),
  }, true),
  local('generarCopyProducto', 'Genera la ficha de descripcion persuasiva para /products/[slug]: descripcion artesanal, beneficios y texto de pedido. Solo propone el texto; no publica nada.', {
    slug: z.string().optional().describe('Slug del producto existente'),
    nombrePieza: z.string().optional().describe('Nombre de la joya si no hay slug'),
    materialesOTecnica: z.string().optional().describe('Tecnica o materiales'),
    ocasionOEstilo: z.string().optional().describe('Ocasion o estilo'),
  }),
  local('actualizarDescripcionProducto', 'Guarda o actualiza la descripcion y narrativa artesanal de una joya en el catalogo web.', {
    slug: z.string().describe('Slug de la joya'),
    descripcion: z.string().describe('Texto completo de la descripcion'),
  }),
  local('generarCopyLanding', 'Genera copys persuasivos para secciones de la landing (hero, cta, historia, taller). Solo propone texto; no publica nada.', {
    seccion: z.enum(['hero', 'cta', 'historia', 'taller']).describe('Seccion de la web'),
    enfoque: z.string().optional().describe('Tema o motivo (ej. "nueva coleccion")'),
  }),
  local('consultarAlmacenamientoFotos', 'Consulta el almacenamiento en la nube (1 GB gratis): porcentaje ocupado, espacio libre y fotos mas pesadas.', {
    limiteFotos: z.number().optional().describe('Numero de fotos mas pesadas a listar (por defecto 5)'),
  }),
]

/** Names the model may call — the single inventory the prompt quotes. */
export function toolInventoryPrompt(): string {
  return SHIRLEY_TOOL_DEFINITIONS.map((t) => t.name).join(', ')
}

/** Destructive names — the single set the HITL gate enforces. */
export function destructiveToolNames(): Set<string> {
  return new Set(SHIRLEY_TOOL_DEFINITIONS.filter((t) => t.destructive).map((t) => t.name))
}
