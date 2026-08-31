import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const AgentMessages: CollectionConfig = {
  slug: 'agent-messages',
  labels: {
    singular: 'Mensaje del Bot',
    plural: 'Historial de Conversación',
  },
  admin: {
    hidden: true,
    group: 'Bot de Shirley',
    useAsTitle: 'content',
    defaultColumns: ['chatId', 'role', 'content', 'toolName', 'createdAt'],
    description: 'Historial conversacional y contexto de Shirley en Telegram para memoria persistente',
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
      admin: {
        description: 'Telegram Chat ID del remitente',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      required: true,
      options: [
        { label: 'Usuario (Shirley)', value: 'user' },
        { label: 'Asistente (Bot)', value: 'assistant' },
        { label: 'Herramienta (Tool Result)', value: 'tool' },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Contenido del Mensaje',
    },
    {
      name: 'toolName',
      type: 'text',
      label: 'Herramienta Invocada',
      admin: {
        description: 'Nombre de la tool si el rol es tool o assistant',
      },
    },
    {
      name: 'toolCalls',
      type: 'json',
      label: 'Llamadas a Herramientas (JSON)',
      admin: {
        description: 'Detalle de tool_use de Anthropic si aplica',
      },
    },
    {
      name: 'toolResults',
      type: 'json',
      label: 'Resultados de Herramientas (JSON)',
      admin: {
        description: 'Resultado devuelto por la tool',
      },
    },
  ],
  timestamps: true,
}
