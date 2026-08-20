/**
 * Skill: derivarAShirley — handoff al canal de pedidos.
 *
 * Guardarraíl de negocio: el bot NO cobra ni cierra ventas. Cuando la clienta
 * quiere personalizar/comprar, se avisa a Shirley (canal existente) y se le
 * confirma a la clienta que la contactarán.
 */
import { sendTelegramMessage } from '@/lib/telegram'
import type { Skill } from '../types'

export const derivarAShirley: Skill = {
  name: 'derivarAShirley',
  definition: {
    type: 'function',
    function: {
      name: 'derivarAShirley',
      description:
        'Deriva la conversación a Shirley (la dueña) cuando la clienta quiere personalizar una ' +
        'pieza, comprar, o coordinar pago/envío. Avisa a Shirley y confirma a la clienta que la ' +
        'contactarán. Úsalo apenas haya intención de compra o personalización.',
      parameters: {
        type: 'object',
        properties: {
          resumen: {
            type: 'string',
            description:
              'Resumen breve de lo que quiere la clienta (pieza de interés, personalización, etc.).',
          },
        },
        required: ['resumen'],
      },
    },
  },
  async run(args, ctx) {
    const resumen =
      String(args.resumen ?? '').trim() || 'La clienta quiere avanzar con un pedido.'
    const quien = ctx.userName ? `${ctx.userName} (chat ${ctx.chatId})` : `chat ${ctx.chatId}`

    const aviso = [
      '🔔 <b>Nuevo interesado desde el bot</b>',
      '',
      `👤 ${quien}`,
      `📝 ${resumen}`,
      '',
      'Escríbele para coordinar personalización, pago y envío.',
    ].join('\n')

    const res = await sendTelegramMessage({ text: aviso })
    if (!res.ok) {
      return 'No pude avisar a Shirley en este momento, pero quedó registrado tu interés. Puedes intentar de nuevo en un rato.'
    }
    return 'Le pasé tus datos a Shirley. Ella te va a contactar para coordinar la personalización, el pago y el envío. 💜'
  },
}
