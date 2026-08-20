# Handoff — Bot de gestión de Shirley (Telegram + Agentes IA, v3.2)

> Para agentes de IA que continúen este trabajo. Estado al 20 de agosto de 2026.

---

## Contexto del negocio

**Nénufar** es una tienda de joyería artesanal de una sola persona: Shirley (Cartagena, Colombia). Ella diseña, fabrica, vende, empaca y envía. Su teléfono es su oficina.

**Regla de oro:** el bot es la **herramienta de gestión de la propia Shirley** — no atiende compradoras. Las compradoras arman su pedido en la web; el bot solo le sirve a Shirley para operar su tienda (ver pedidos, confirmar, actualizar stock) desde Telegram. La venta y su cierre siempre los maneja Shirley por WhatsApp.

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

3. **chat_id de Shirley** — escribirle a `@userinfobot` en Telegram  
   Variable: `TELEGRAM_ADMIN_CHAT_ID` (único remitente que el bot procesa)

4. **Túnel HTTPS** — para exponer el webhook localmente  
   `cloudflared tunnel --url http://localhost:3002`

5. **Registrar el webhook** (mismo bot que ya tiene para pedidos)  
   `pnpm tsx scripts/set-telegram-webhook.ts <url-del-tunel>`

> **No se necesita un bot adicional.** El mismo `TELEGRAM_BOT_TOKEN` del flujo de pedidos hace las dos cosas: envía notificaciones al canal de Shirley y recibe los mensajes de gestión de la propia Shirley vía webhook (auth por `TELEGRAM_ADMIN_CHAT_ID`).

---

## Arquitectura del sistema de agentes

```
SHIRLEY escribe → Bot (@NenufarPedidosBot — mismo TELEGRAM_BOT_TOKEN)
                              │
                     POST /telegram/webhook
                              │
                    ┌─────────▼──────────┐
                    │ chat_id == ADMIN?  │  ← auth: solo el chat_id de Shirley
                    │  no → 200, ignora  │
                    └─────────┬──────────┘
                              │ sí
                    ┌─────────▼──────────┐
                    │   routeAndRun()    │
                    │   orchestrator.ts  │
                    └─────────┬──────────┘
                              │
              ┌───────────────▼───────────────┐
              │         Groq / Llama 3.3       │  ← 1 llamada, temp=0
              │     interpreta la intención    │
              └──┬──────────┬──────────┬───────┘
                 │          │          │
            'pedidos'  'catalogo' 'inventario'
                 │          │          │
           ┌─────▼───┐ ┌────▼────┐ ┌───▼──────────┐
           │pedidos- │ │buscar-  │ │actualizar-   │
           │Pendient.│ │Producto │ │Inventario    │
           │confirmar│ │         │ │              │
           └─────┬───┘ └────┬────┘ └───┬──────────┘
                 │          │          │
          payload.find/  payload.find  payload.update
          update(orders) (products)    (products.stock)
                 │          │          │
                 └──────────┼──────────┘
                            │
                   sendTelegramReply()
                   (responde a Shirley)
```

> Slice 1 implementó las rutas `catalogo`/`conversacion` para el supuesto (descartado) de que la compradora escribía. Con el modelo actual el bot es **solo de Shirley**: se agrega el guard por `chat_id` y las skills de gestión (`pedidosPendientes`, `confirmarPedido`, `actualizarInventario`). `derivarAShirley` queda obsoleta (no hay compradora a quien derivar).

### Decisiones de implementación clave

- **Webhook en `/telegram/webhook`**, NO en `/api/...` — el catch-all de Payload en `src/app/(payload)/api/[...slug]/route.ts` capturaría cualquier ruta bajo `/api`.

- **Un solo bot, solo Shirley:** `TELEGRAM_BOT_TOKEN` hace las dos cosas — envía pedidos al canal de Shirley (función original, sin cambios) y recibe los mensajes de gestión de la propia Shirley vía webhook (función nueva, autenticada por `TELEGRAM_ADMIN_CHAT_ID`). Las compradoras nunca le escriben al bot. No se necesita un bot adicional.

- **Runtime: max 4 rondas** de tool-calling por request para evitar loops infinitos.

- **Deduplicación por `update_id`** en un `Set` en memoria (max 1000 entradas), mismo patrón que `src/lib/idempotency.ts`.

- **Bug pre-existente de `slug` en tipos generados de Payload** — resuelto en `buscarProductos.ts` con cast explícito `as { title?: string; slug?: string; priceInCOP?: number | null }`. No tocar sin entender el sistema de tipos del plugin.

---

## Qué sigue (próximas fases)

> **Diseño detallado (inglés):** las fases 3.3 y 4.0 están especificadas en
> [`docs/RAG-MEMORY-design.md`](../docs/RAG-MEMORY-design.md). Topología acordada:
> **Opción A (unificada)** — Payload + un schema `rag` en un solo Supabase.
> **Principio clave:** Supabase es un **índice derivado, nunca la fuente** — el
> conocimiento vive en `knowledge/*.md` (git) + Payload; Supabase se puede reconstruir.

### Fase 3.3 — RAG de conocimiento (Supabase)

**Objetivo:** una sola búsqueda semántica sobre **dos fuentes**: el catálogo (Payload) y el conocimiento de marca curado en `knowledge/*.md` (esencia, políticas, cuidado, FAQ). Consumidor = **Shirley** (el bot es solo de ella).

**Stack (todo gratis):**
- Embeddings: `Transformers.js` con `multilingual-e5-small` (384d, local, sin API key; prefijos `passage:`/`query:`)
- Vector store: **Supabase** (pgvector) en un schema `rag`, misma DB que Payload; dev con Supabase local (offline)
- Tabla única `rag.chunks` (`source_type` = `product` | `knowledge`) → una query cubre productos y conocimiento
- Ingesta (idempotente, delete-then-insert por `source_id`):
  - Productos: `afterChange`/`afterDelete` hook en Products → chunk → embed → upsert
  - Conocimiento: `scripts/ingest-knowledge.ts` lee `knowledge/*.md`, parte por `##`, embed, upsert

**Impacto en el código:**
- `knowledge/*.md` — conocimiento curado (fuente de verdad, en git)
- `src/lib/agents/skills/buscarProductos.ts` → reemplazar `like` con búsqueda vectorial sobre `rag.chunks`
- Nuevo: `src/lib/embeddings.ts` — embedder local (singleton)
- Nuevo: `src/lib/vectorStore.ts` — upsert / delete / search sobre `rag.chunks`
- Nuevo: `src/hooks/products/indexProduct.ts` — hooks afterChange/afterDelete de Payload
- Nuevo: `scripts/ingest-knowledge.ts` + `scripts/reindex-all.ts`
- Nuevo: `supabase/migrations/*.sql` — schema `rag`, extensión `vector`, tablas, índices

### Fase 3.4 — MCP para el CMS

**Objetivo:** exponer Payload como herramientas MCP para que los agentes consulten y actualicen el catálogo de forma estructurada, sin SQL directo.

**Herramientas MCP propuestas:**
- `listarProductos(filtros)` — reemplaza `payload.find` directa
- `obtenerProducto(slug)` — detalle completo de una pieza
- `actualizarInventario(productId, stock)` — Shirley le pide al bot que actualice stock

### Fase 4.0 — Memoria de conversación (Supabase)

**Objetivo:** el bot recuerda los últimos turnos por `chat_id` → habilita multi-turn para Shirley ("confírmalo").

**Enfoque (con higiene, sin volcado crudo):** memoria *windowed* (últimos ~N turnos) en `rag.conversation_messages`, cargada en `routeAndRun` y pasada a Groq. Cuando crece, se **resume** lo viejo en una fila `kind='summary'` (vía Groq) y se borra el crudo → row count acotado. La memoria NO es la base de conocimiento: los datos durables van en `knowledge/*.md`, no en memoria. Memoria semántica de largo plazo = opcional/futuro. Detalle en `docs/RAG-MEMORY-design.md §6`.

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
| `TELEGRAM_ADMIN_CHAT_ID` | `@userinfobot` | chat_id de Shirley — único remitente que el bot procesa |
| `TELEGRAM_BOT_TOKEN` | ya configurado | Bot (pedidos + gestión de Shirley — no crear uno nuevo) |
| `TELEGRAM_CHANNEL_ID` | ya configurado | Canal de Shirley (no tocar) |

El webhook del bot de gestión usa el mismo bot que el flujo de pedidos. El flujo de pedidos existente no se toca — solo se agrega el webhook como canal de entrada nuevo (solo para Shirley).
