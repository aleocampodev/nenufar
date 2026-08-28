import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const AgentTraces: CollectionConfig = {
  slug: 'agent-traces',
  labels: {
    singular: 'Traza de IA',
    plural: 'Trazas y Métricas de IA',
  },
  admin: {
    group: 'Bot de Shirley',
    useAsTitle: 'query',
    defaultColumns: ['chatId', 'query', 'executionTimeMs', 'status', 'toolsUsed', 'createdAt'],
    description: 'Auditoría, latencia, métricas de rendimiento y trazabilidad de Shirley Bot',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'chatId',
      type: 'number',
      label: 'ID Chat Telegram',
      required: true,
      index: true,
    },
    {
      name: 'query',
      type: 'text',
      label: 'Consulta / Mensaje de Entrada',
      required: true,
    },
    {
      name: 'responseSummary',
      type: 'textarea',
      label: 'Respuesta del Agente',
    },
    {
      name: 'toolsUsed',
      type: 'text',
      label: 'Herramientas Ejecutadas',
      admin: {
        description: 'Lista de herramientas invocadas en el bucle agéntico',
      },
    },
    {
      name: 'executionTimeMs',
      type: 'number',
      label: 'Tiempo de Respuesta (ms)',
      admin: {
        description: 'Duración total del bucle agéntico en milisegundos',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Estado de la Ejecución',
      defaultValue: 'success',
      options: [
        { label: 'Exitoso', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Fallback Activado', value: 'fallback' },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Detalle del Error',
      admin: {
        description: 'Información del error si la ejecución falló',
      },
    },
    {
      name: 'model',
      type: 'text',
      label: 'Modelo de Inferencia',
      admin: {
        description: 'Nombre del modelo en LiteLLM / Groq',
      },
    },
  ],
  timestamps: true,
}
