# FEATURES.md — Agento PoC
> Última actualización: 2026-06-06

---

## FEAT-01 · Búsqueda Semántica de Productos ✅
**Como** comprador, **quiero** buscar artesanías en lenguaje natural **para** encontrar productos sin saber el nombre exacto.
- RAG con pgvector + Gemini Embedding 2 (3072 dims)
- Hasta 4 resultados ordenados por similitud coseno
- Score de similitud visible por resultado

---

## FEAT-02 · Chips de Intención Rápida ✅
**Como** comprador, **quiero** filtrar por categorías con un click **para** explorar sin escribir.
- Chips: 🎒 Mochila Wayuu · 🤠 Sombrero Vueltiao · 🏺 Jarrón de Barro

---

## FEAT-03 · Configuración de Producto y Grabado ✅
**Como** comprador, **quiero** personalizar mi pedido con grabado **para** recibir una pieza única.
- Checkbox para activar grabado
- Campo de texto libre para el mensaje del grabado

---

## FEAT-04 · Generación de Código de Handoff (AX-XXXX) ✅
**Como** comprador, **quiero** congelar mi carrito con un código **para** continuar en WhatsApp sin perder mi selección.
- Código formato `AX-[4 chars no ambiguos]`
- Único, con hasta 10 reintentos anti-colisión
- TTL de 168h (7 días), configurable por env

---

## FEAT-05 · Simulador de WhatsApp (Panel Derecho) ✅
**Como** demostrante del PoC, **quiero** simular WhatsApp en el browser **para** demostrar el flujo sin teléfono real.
- Apariencia WhatsApp (verde, burbujas)
- Auto-scroll al último mensaje

---

## FEAT-06 · Rehidratación de Sesión por Código ✅
**Como** comprador, **quiero** enviar `AX-XXXX` y que el bot reconozca mi carrito **para** no repetir qué quería.
- Guardián Pre-LLM: regex detecta el código antes de llamar a Gemini
- Shirley confirma producto, precio y grabado

---

## FEAT-07 · Upsell Conversacional con Shirley ✅
**Como** vendedor, **quiero** que el bot ofrezca un complemento **para** aumentar el ticket promedio.
- Upsell contextual por producto (Mochila → Llavero, Sombrero → Estuche, Jarrón → Soporte)
- Parseo de `[UPSELL: ACCEPTED]` / `[UPSELL: REJECTED]` sin tokens extra
- Decisión persiste en `cart_context` (DB)

---

## FEAT-08 · Checkout Simulado ✅
**Como** comprador, **quiero** simular el pago con un click **para** ver el flujo completo.
- Botón aparece cuando Shirley incluye link `mock-{code}`
- `simulateCheckout()` marca sesión como `PAID`

---

## FEAT-09 · Creación Automática de Orden en CRM ✅
**Como** operador, **quiero** que cada pago genere una ficha de despacho automáticamente **para** tener registro inmutable.
- Crea documento en colección `orders` de Payload
- Visible en `localhost:3000/admin/collections/orders`

---

## FEAT-10 · Panel Admin CRM (Tech-Brutalist) ✅
**Como** operador, **quiero** un panel con estética brutalista **para** gestionar catálogo y órdenes.
- Login + dashboard con CSS brutalista
- Sidebar oscuro, amarillo `#F2C94C`, monospace, bordes negros

---

## FEAT-11 · Ephemeral UI en el Simulador ✅
**Como** comprador, **quiero** ver tarjetas interactivas en el chat **para** una experiencia más rica que texto plano.
- `<ProductCard>` al confirmar producto
- `<UpsellCard>` con botones Sí/No
- `<CheckoutCard>` con resumen y botón de pago
- `<ConfirmationCard>` tras pago exitoso
- Tecnología: AI SDK v6 (`useChat` + tools + Route Handler)

---

## FEAT-12 · Sesión Omnicanal Bidireccional ✅
**Como** comprador, **quiero** poder iniciar la conversación desde WhatsApp o desde la web y que el contexto me siga en ambos canales **para** no perder mi progreso sin importar por dónde empiece.

### Criterios de Aceptación
- [ ] **WA → Web:** Shirley puede recomendar productos desde WhatsApp y generar un código `AX-XXXX` sin que el usuario haya pasado por la web
- [ ] **WA → Web (link):** Shirley envía `/?session=AX-XXXX` — la web carga con el producto pre-seleccionado y el carrito rehidratado
- [ ] **Web → WA (actual):** El usuario configura en la web, genera código y continúa en WhatsApp
- [ ] **Contexto compartido:** `handoff_sessions` en DB es la única fuente de verdad para ambos canales
- [ ] **Canal activo:** La DB registra desde qué canal interactuó el usuario por última vez
- [ ] **Pick-up URL:** `/?session=AX-XXXX` en la web auto-rellena el panel izquierdo con el producto de la sesión
- [ ] **Sin duplicación:** Si el usuario retoma en web una sesión iniciada en WA, no se crea una nueva sesión

### Flujos

```
ESCENARIO A — Web → WhatsApp (actual)
Usuario web → busca → configura → AX-XXXX → WhatsApp → Shirley → pago

ESCENARIO B — WhatsApp → Web (nuevo)
Usuario WA → "busco una mochila" → Shirley RAG → recomienda → AX-XXXX
→ Shirley: "Continúa tu compra en: agento.co/?session=AX-B3K9"
→ Web carga con Mochila preseleccionada + grabado del chat

ESCENARIO C — WhatsApp solo (nuevo)
Usuario WA → "busco una mochila" → Shirley RAG → recomienda
→ Usuario configura grabado por chat → AX-XXXX → pago desde WA
```

### Cambios de Arquitectura

| Cambio | Descripción |
|---|---|
| `handoff_sessions.activeChannel` | Nuevo campo: `'WEB' \| 'WHATSAPP'` |
| `handoff_sessions.initiatedFrom` | Nuevo campo: `'WEB' \| 'WHATSAPP'` |
| `/api/webhooks/whatsapp/route.ts` | Implementar lógica real de chat (actualmente stub) |
| `/?session=[code]` | Web detecta query param y rehidrata carrito |
| Shirley system prompt | Agregar herramienta `generateHandoffCode` para WA-initiated sessions |

### Dependencias
- FEAT-06 (rehidratación de sesión) — ya implementado
- FEAT-11 (Ephemeral UI) — puede implementarse en paralelo

---

## Resumen de Estado

| Feature | Estado |
|---|---|
| FEAT-01 Búsqueda semántica | ✅ |
| FEAT-02 Chips de intención | ✅ |
| FEAT-03 Config producto y grabado | ✅ |
| FEAT-04 Generación código handoff | ✅ |
| FEAT-05 Simulador WhatsApp | ✅ |
| FEAT-06 Rehidratación de sesión | ✅ |
| FEAT-07 Upsell conversacional | ✅ |
| FEAT-08 Checkout simulado | ✅ |
| FEAT-09 Orden automática en CRM | ✅ |
| FEAT-10 Admin CRM brutalista | ✅ |
| FEAT-11 Ephemeral UI | ✅ |
| FEAT-12 Sesión omnicanal bidireccional | ✅ |
