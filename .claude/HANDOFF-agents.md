# Handoff — Bot Asistente Telegram + Agentes IA (v3.2)

> Para agentes de IA que continúen este trabajo. Estado al 20 de agosto de 2026.

---

## Contexto del negocio

**Nénufar** es una tienda de joyería artesanal de una sola persona: Shirley (Cartagena, Colombia). Ella diseña, fabrica, vende, empaca y envía. Su teléfono es su oficina.

**Regla de oro:** los agentes IA asisten y derivan a Shirley — **nunca cierran una venta, nunca confirman un pedido, nunca cobran**. Shirley siempre tiene la última palabra.

---

## Estado actual (slice 1 — implementado)

### ✅ Qué está hecho

| Componente | Archivo(s) | Estado |
|------------|-----------|--------|
| Cliente Groq | `src/lib/groq.ts` | ✅ Listo |
| Tipos compartidos | `src/lib/agents/types.ts` | ✅ Listo |
| Runtime (tool-calling loop) | `src/lib/agents/runtime.ts` | ✅ Listo |
| Orquestador | `src/lib/agents/orchestrator.ts` | ✅ Listo |
| Agente Catálogo | `src/lib/agents/catalogo.ts` | ✅ Listo |
| Agente Conversación | `src/lib/agents/conversacion.ts` | ✅ Listo |
| Skill buscarProductos | `src/lib/agents/skills/buscarProductos.ts` | ✅ Listo |
| Skill derivarAShirley | `src/lib/agents/skills/derivarAShirley.ts` | ✅ Listo |
| Webhook handler | `src/app/(app)/telegram/webhook/route.ts` | ✅ Listo |
| Función sendTelegramReply | `src/lib/telegram.ts` (al final) | ✅ Listo |
| Script set-webhook | `scripts/set-telegram-webhook.ts` | ✅ Listo |
| Tests integración | `tests/int/agents.int.spec.ts` (4 tests) | ✅ Pasan |
| Documentación env vars | `.env.example` | ✅ Actualizado |
| Diagrama arquitectura | `docs/arquitectura.html` | ✅ Actualizado |

### ⚠️ Qué falta configurar (el usuario lo debe hacer manualmente)

1. **Groq API key** — obtener en https://console.groq.com (gratis)  
   Variable: `GROQ_API_KEY`

2. **Secreto del webhook** — string aleatorio  
   `openssl rand -hex 24`  
   Variable: `TELEGRAM_WEBHOOK_SECRET`

3. **Túnel HTTPS** — para exponer el webhook localmente  
   `cloudflared tunnel --url http://localhost:3002`

4. **Registrar el webhook** (mismo bot que ya tiene para pedidos)  
   `pnpm tsx scripts/set-telegram-webhook.ts <url-del-tunel>`

> **No se necesita un bot adicional.** El mismo `TELEGRAM_BOT_TOKEN` del flujo de pedidos hace las dos cosas: envía notificaciones al canal de Shirley y recibe mensajes de compradoras vía webhook.

---

## Arquitectura del sistema de agentes

```
Compradora escribe → Bot (@NenufarPedidosBot — mismo TELEGRAM_BOT_TOKEN)
                              │
                     POST /telegram/webhook
                              │
                    ┌─────────▼──────────┐
                    │   routeAndRun()    │
                    │   orchestrator.ts  │
                    └─────────┬──────────┘
                              │
              ┌───────────────▼───────────────┐
              │         Groq / Llama 3.3       │  ← 1 llamada, temp=0, max_tokens=4
              │     clasifica la intención     │
              └───────┬───────────────┬────────┘
                      │               │
              'catalogo'         'conversacion'
                      │               │
              ┌───────▼───┐   ┌───────▼─────────┐
              │  Agente   │   │     Agente      │
              │ Catálogo  │   │  Conversación   │
              │           │   │                 │
              │ skill:    │   │ skill:          │
              │ buscarPr. │   │ derivarShirley  │
              └─────┬─────┘   └──────┬──────────┘
                    │                │
              payload.find      sendTelegramMessage
              (products)        (canal de Shirley)
                    │                │
                    └────────┬───────┘
                             │
                    sendTelegramReply()
                    (al chat_id de la compradora)
```

### Decisiones de implementación clave

- **Webhook en `/telegram/webhook`**, NO en `/api/...` — el catch-all de Payload en `src/app/(payload)/api/[...slug]/route.ts` capturaría cualquier ruta bajo `/api`.

- **Un solo bot:** `TELEGRAM_BOT_TOKEN` hace las dos cosas — envía pedidos al canal de Shirley (función original, sin cambios) y recibe mensajes de compradoras vía webhook (función nueva). No se necesita un bot adicional.

- **Runtime: max 4 rondas** de tool-calling por request para evitar loops infinitos.

- **Deduplicación por `update_id`** en un `Set` en memoria (max 1000 entradas), mismo patrón que `src/lib/idempotency.ts`.

- **Bug pre-existente de `slug` en tipos generados de Payload** — resuelto en `buscarProductos.ts` con cast explícito `as { title?: string; slug?: string; priceInCOP?: number | null }`. No tocar sin entender el sistema de tipos del plugin.

---

## Qué sigue (próximas fases)

### Fase 3.3 — RAG del catálogo

**Objetivo:** la skill `buscarProductos` pasa de query por título (`like`) a búsqueda semántica.

**Stack planificado (todo gratis/local):**
- Embeddings: `Transformers.js` con `multilingual-e5-small` (local, sin API key)
- Vector store: Supabase pgvector (free tier) o PostgreSQL + pgvector local
- Job de ingesta: `afterChange` hook en la colección Products → split en chunks → embed → upsert

**Impacto en el código:**
- `src/lib/agents/skills/buscarProductos.ts` → reemplazar `payload.find` con búsqueda semántica
- Nuevo: `src/lib/embeddings.ts` — cliente de embeddings locales
- Nuevo: `src/lib/vectorStore.ts` — cliente de pgvector
- Nuevo: `src/hooks/products/indexarProducto.ts` — hook afterChange de Payload

### Fase 3.4 — MCP para el CMS

**Objetivo:** exponer Payload como herramientas MCP para que los agentes puedan consultar y actualizar el catálogo de forma estructurada, sin SQL directo.

**Herramientas MCP propuestas:**
- `listarProductos(filtros)` — reemplaza `payload.find` directa
- `obtenerProducto(slug)` — detalle completo de una pieza
- `actualizarInventario(productId, stock)` — Shirley puede pedirle al bot que actualice stock

### Fase 4.0 — Memoria de conversación persistente

**Objetivo:** el bot recuerda el contexto de la conversación entre mensajes.

**Opciones:** Supabase (misma DB que el RAG), Redis, o PostgreSQL local con tabla `conversations`.

---

## Cómo contribuir / continuar

### Regla del proyecto

**Nunca cambiar `main` directamente.** Crear worktree + feature branch:

```bash
git worktree add ../nenufar-<nombre> feature/<nombre>
cd ../nenufar-<nombre>
# trabajar aquí
```

### Para agregar una nueva skill

1. Crear `src/lib/agents/skills/miSkill.ts` implementando la interface `Skill` de `types.ts`
2. Agregar la skill al agente correspondiente en `catalogo.ts` o `conversacion.ts`
3. Agregar un test en `tests/int/agents.int.spec.ts` (mockear Groq y Telegram)

### Para crear un nuevo agente

1. Crear `src/lib/agents/miAgente.ts` con `systemPrompt` + `skills[]`
2. Agregar el caso en `orchestrator.ts` → `route()` y `routeAndRun()`
3. Actualizar los tests del orquestador

### Cómo correr los tests (sin red)

```bash
# desde el worktree de trabajo
NODE_OPTIONS=--no-deprecation npx vitest run tests/int/agents.int.spec.ts
```

---

## Archivos clave para leer primero

Si eres un agente que entra en frío, lee estos archivos en orden:

1. `CLAUDE.md` — reglas del proyecto, stack, color de marca, puerto de dev
2. `src/lib/agents/types.ts` — las interfaces base
3. `src/lib/agents/orchestrator.ts` — el punto de entrada del sistema
4. `src/lib/agents/runtime.ts` — cómo funciona el tool-calling loop
5. `tests/int/agents.int.spec.ts` — cómo están estructurados los tests y cómo mockear

---

## Notas operacionales

| Variable | Dónde obtener | Para qué |
|----------|--------------|----------|
| `GROQ_API_KEY` | console.groq.com | LLM de los agentes |
| `TELEGRAM_WEBHOOK_SECRET` | `openssl rand -hex 24` | Autenticar el webhook |
| `TELEGRAM_BOT_TOKEN` | ya configurado | Bot (pedidos + asistente — no crear uno nuevo) |
| `TELEGRAM_CHANNEL_ID` | ya configurado | Canal de Shirley (no tocar) |

El webhook del bot asistente usa el mismo bot que el flujo de pedidos. El flujo de pedidos existente no se toca — solo se agrega el webhook como canal de entrada nuevo.
