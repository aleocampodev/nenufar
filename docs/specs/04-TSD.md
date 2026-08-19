# TSD — Technical Specification Document (Etapa 1)

**Proyecto:** Bot Concierge de Nénufar — **Etapa 1: Agente + herramientas**
**Versión:** v1 · 2026-08-18
**Estado:** Borrador
**Deriva de:** [SDD](./03-SDD.md)

> ⚠️ **Verificar contra la doc del SDK.** Los nombres/firmas exactos del **Claude Agent SDK**
> (`query`, `createSdkMcpServer`, `tool`, `AgentDefinition`, opciones) deben confirmarse en
> <https://code.claude.com/docs/en/agent-sdk/typescript> antes de codear. Este TSD fija los
> **contratos y el comportamiento**, no las firmas literales del SDK.

---

## 1. Alcance de la Etapa 1

Un servicio-bot que: recibe un mensaje de Telegram, resuelve el rol, corre **un** `query()`
del Agent SDK con **dos tools** (`buscar_productos`, `crear_pedido`), y responde. Sin RAG,
sin subagentes, sin sesiones persistentes avanzadas.

## 2. Stack y dependencias

- **Node.js 18+**, TypeScript.
- `@anthropic-ai/claude-agent-sdk` — orquestador `query()` + tools in-process (MCP del SDK).
- `payload` — Local API (mismo monorepo / acceso al proyecto Payload existente).
- `zod` — schemas de las tools.
- Cliente de Telegram: reusar `src/lib/telegram.ts` (extendido).

## 3. Estructura de archivos (propuesta)

```
bot/
  index.ts                 # entrypoint long-running; arranca el servidor + startup del SDK
  webhook.ts               # handler del update de Telegram (verifica secret, extrae, despacha)
  roles.ts                 # resolveRole(chatId) -> "cliente" | "admin"
  prompts.ts               # systemPrompt(rol)
  agent.ts                 # runTurn({ chatId, rol, text }) -> string  (llama query())
  tools/
    index.ts               # registra las tools según rol
    buscarProductos.ts
    crearPedido.ts
  telegram.ts              # reexport/extensión de src/lib/telegram.ts con chatId
```
> El edge (webhook en Vercel) puede ser un route handler de Next.js que reenvía al `bot/`.
> En dev, `bot/` puede recibir el webhook directo por túnel (ngrok/cloudflared).

## 4. Variables de entorno

```
ANTHROPIC_API_KEY=          # clave del modelo (spend cap configurado en consola)
TELEGRAM_BOT_TOKEN=         # ya existe
TELEGRAM_CHANNEL_ID=        # canal de avisos de Shirley (ya existe)
TELEGRAM_ADMIN_CHAT_ID=     # NUEVO: chat.id personal de Shirley (rol admin)
TELEGRAM_WEBHOOK_SECRET=    # NUEVO: secret token del webhook
DATABASE_URL=               # Postgres (compartido con la tienda)
NEXT_PUBLIC_SERVER_URL=     # para links de admin en el aviso (ya existe)
BOT_MODEL=claude-haiku-4-5  # modelo por defecto (barato)
```

## 5. Webhook — contrato

- **Ruta:** `POST /api/telegram/webhook`
- **Verificación:** header `X-Telegram-Bot-Api-Secret-Token` === `TELEGRAM_WEBHOOK_SECRET`
  (configurado al llamar `setWebhook`). Si no coincide → `401`.
- **Body:** update de Telegram. Extraer `message.chat.id` (número) y `message.text` (string).
- **Respuesta:** `200 OK` inmediato. El procesamiento del turno puede ser async.
- **Ignorar:** updates sin `message.text` (stickers, etc.) en Etapa 1.

## 6. Resolución de rol

```ts
// roles.ts
export type Rol = "cliente" | "admin"
export function resolveRole(chatId: number | string): Rol {
  return String(chatId) === process.env.TELEGRAM_ADMIN_CHAT_ID ? "admin" : "cliente"
}
```

## 7. Agente — `query()`

```ts
// agent.ts (pseudocódigo — confirmar firmas con la doc del SDK)
runTurn({ chatId, rol, text }): Promise<string> {
  const options = {
    systemPrompt: systemPrompt(rol),
    mcpServers: { nenufar: toolsServer(rol) }, // tools in-process del SDK
    maxTurns: 6,
    model: process.env.BOT_MODEL,
    settingSources: [],                        // aislamiento (no cargar .claude del disco)
    // resume / sessionStore -> Etapa posterior
  }
  // consumir el stream de query({ prompt: text, options }) y devolver el texto final
}
```

- `maxTurns: 6` acota el loop (defensa de costo).
- `settingSources: []` evita cargar settings/memoria del filesystem (multi-tenant limpio).
- **Modelo:** `claude-haiku-4-5` por defecto (barato y rápido).

## 8. System prompts (resumen)

- **cliente:** asesor cálido de Nénufar; puede buscar piezas y ayudar a armar un pedido;
  **debe** mostrar el texto de consentimiento y obtener un "sí" explícito antes de crear el
  pedido; precios en COP; no inventa datos que no salgan de las tools.
- **admin (Shirley):** asistente interno; en Etapa 1 solo saluda y explica que las funciones
  de gestión llegan en la Etapa 3 (las tools admin aún no existen).

## 9. Tools — contratos

### 9.1 `buscar_productos` (solo lectura)

- **Input (zod):** `{ consulta: string, limite?: number }`
- **Comportamiento:** `payload.find({ collection: 'products', where: <match por título/desc>,
  limit: limite ?? 5, depth: 1 })`.
- **Output:** lista de `{ id, titulo, precioCOP, variantes[], slug }`. Precio formateado con
  la misma lógica COP de `order-formatter` (`Intl.NumberFormat('es-CO')`).
- **Errores:** si falla la query → devolver `{ error: "no se pudo consultar el catálogo" }`
  (nunca throw que rompa el loop).

### 9.2 `crear_pedido` (escritura, con gate)

- **Input (zod):**
  ```
  {
    items: Array<{ productId: string, variantId?: string, cantidad: number }>,
    comprador: { nombre: string, whatsapp: string },
    consentimiento: boolean,
    personalizacion?: string,
    notas?: string
  }
  ```
- **Precondiciones (rechazo con mensaje, no throw):**
  - `nombre.length >= 2`, `whatsapp.length >= 6`.
  - `consentimiento === true` → si no, devolver el `CONSENT_TEXT` y pedir aceptación
    (reusa `validateConsent` de `src/lib/consent.ts`).
  - `items` no vacío.
- **Idempotencia:** clave por `chatId` (equivalente al `cartId` del flujo web). Reusar
  `checkIdempotency` / `markSeen` de `src/lib/idempotency.ts`; si ya hay pedido reciente,
  devolver ese `orderId` sin crear otro.
- **Efecto:**
  1. `payload.create({ collection: 'orders', data: { items, amount, currency: 'COP',
     status: 'processing', shippingAddress: { firstName: nombre, phone: whatsapp } } })`
     (mismo mapeo temporal que `submitOrderAction`).
  2. Formatear con `formatOrderMessage(...)` y enviar al canal (`TELEGRAM_CHANNEL_ID`) con
     `sendTelegramMessage`.
  3. `markSeen(chatId, orderId)`.
- **Output:** `{ orderId, resumen }` para que el agente confirme a la clienta.

## 10. Telegram — envío

Extender `src/lib/telegram.ts`:
```ts
sendTelegramMessage({ text, chatId })   // chatId opcional; default = TELEGRAM_CHANNEL_ID
```
La respuesta al usuario usa `chatId` del turno; el aviso de pedido usa `TELEGRAM_CHANNEL_ID`.

## 11. Manejo de errores (principios)

- Las tools **nunca** lanzan hacia el loop: devuelven `{ error }` legible.
- Fallo de Telegram al responder → log; el pedido igual quedó en Payload (Shirley lo ve en /admin).
- `maxTurns` alcanzado → responder un mensaje de cierre amable.

## 12. Modelos y costo

- Default `claude-haiku-4-5`. Spend cap en consola de Anthropic.
- Medir tokens por turno; si un flujo necesita más calidad, subir puntualmente a Sonnet.

## 13. Plan de pruebas (Etapa 1)

| # | Escenario | Esperado |
|---|-----------|----------|
| T1 | `setWebhook` con secret; mensaje desde chat cliente | El bot responde |
| T2 | "¿tenés aretes de plata?" | Lista piezas reales con precio COP |
| T3 | Flujo de pedido sin aceptar consentimiento | Muestra `CONSENT_TEXT`, no crea Order |
| T4 | Flujo de pedido con consentimiento | Crea `Order` (status processing) + aviso al canal |
| T5 | Reenviar el mismo pedido | No duplica (idempotencia) |
| T6 | Mensaje desde el chat de Shirley | Rol `admin` resuelto |
| T7 | Secret inválido en el webhook | `401`, no procesa |

Unit tests: `resolveRole`, schemas zod de tools, `buscar_productos` y `crear_pedido` con
Payload mockeado.

## 14. Preguntas abiertas / a confirmar

- Firmas exactas del SDK (`createSdkMcpServer`, `tool`, opciones de `query`) — **verificar docs**.
- ¿`bot/` como carpeta del monorepo o repo aparte? (afecta cómo importa la Payload Local API).
- Hosting de dev: túnel al `bot/` local vs route handler de Next reenviando.
- ¿Cuándo introducir `SessionStore`? (memoria simple alcanza para T1–T7).
