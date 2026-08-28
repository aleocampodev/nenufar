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
    defaultColumns: [
      'query',
      'totalTokens',
      'executionTimeMs',
      'toolsUsed',
      'cost',
      'createdAt',
    ],
    description: 'Auditoría, consumo de tokens, latencia y métricas de rendimiento de Shirley Bot',
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
      name: 'inputTokens',
      type: 'number',
      label: 'Tokens de Entrada (Prompt)',
      admin: {
        description: 'Tokens consumidos por el prompt y contexto previo',
      },
    },
    {
      name: 'outputTokens',
      type: 'number',
      label: 'Tokens de Salida (Respuesta)',
      admin: {
        description: 'Tokens generados por el modelo de IA',
      },
    },
    {
      name: 'totalTokens',
      type: 'number',
      label: 'Total Tokens Consumidos',
      admin: {
        description: 'Suma de tokens de entrada y salida',
      },
    },
    {
      name: 'cost',
      type: 'text',
      label: 'Costo Estimado',
      defaultValue: '$0 USD (Groq Free Tier)',
      admin: {
        description: 'Costo monetario real de la inferencia',
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
