# HANDOFF — Migración del bot de Shirley a Claude Agent SDK + LiteLLM (gateway a Groq)

> **Para el agente que ejecuta esta migración:** lee este documento completo antes de tocar código. Contiene el estado actual, el objetivo, las restricciones duras, el plan paso a paso y los criterios de aceptación. No improvises arquitectura: está decidida.

---

## 1. Contexto del proyecto (lo mínimo indispensable)

**Nénufar** (`/home/ale/Work/nenufar`) — tienda de joyería artesanal colombiana (Shirley, Cartagena).
Stack: **Next.js 15 App Router + Payload CMS v3 + PostgreSQL + TailwindCSS**, basado en `@payloadcms/plugin-ecommerce`. Sin pasarela de pago (ADR-001): formulario web → Order en Payload → notificación Telegram → cierre manual por WhatsApp.

**El bot de gestión (v3.2)** es SOLO de Shirley: ella le escribe por Telegram para ver pedidos pendientes, confirmar pagos, actualizar stock. Las compradoras NUNCA le escriben al bot — su recorrido es 100% web.

```
Flujo actual:
Shirley → POST /telegram/webhook → valida secret → chat_id == TELEGRAM_ADMIN_CHAT_ID?
       → routeAndRun() (orquestador propio sobre Groq) → skill sobre Payload Local API → reply a Shirley
```

## 2. Estado actual del bot (lo que vas a reemplazar)

| Archivo | Rol | Destino tras la migración |
|---|---|---|
| `src/lib/groq.ts` | Cliente Groq singleton | ❌ **ELIMINAR** (LiteLLM consume Groq, no la app) |
| `src/lib/agents/orchestrator.ts` | Enrutado de intención → skill | ❌ **ELIMINAR** (el SDK trae el loop agéntico) |
| `src/lib/agents/runtime.ts` | Loop de tool-calling manual (max 4 rondas) | ❌ **ELIMINAR** (idem — este es EL punto de la migración) |
| `src/lib/agents/skills/*` | Skills que llaman Payload Local API | ✅ **CONVERTIR en tools del SDK** (misma lógica, nueva interfaz) |
| `src/lib/agents/catalogo.ts`, `conversacion.ts`, `types.ts` | Lógica de dominio/tipos | ✅ **CONSERVAR** lo reutilizable |
| `src/app/(app)/telegram/webhook/route.ts` | Validación secret, auth por chat_id, dedup por `update_id` | ✅ **CONSERVAR INTACTO** — solo cambia qué se llama después de validar |

**Skills existentes:** buscarProducto (built), pedidosPendientes, confirmarPedido, actualizarInventario, generarCaption, destacarProducto, publicarEvento, crearProductoDraft. Verifica el detalle real en `src/lib/agents/skills/`.

## 3. Arquitectura objetivo

```
Shirley → POST /telegram/webhook (sin cambios)
        → Claude Agent SDK (@anthropic-ai/claude-agent-sdk)
             │  habla Anthropic Messages API
             ▼
        LiteLLM proxy (:4000) ← gateway de modelos
             │  traduce a OpenAI-compatible
             ▼
        Groq API (llama-3.3-70b-versatile, FREE)
             ▲
        tools = skills actuales sobre Payload Local API
```

**Por qué así:**
- El SDK aporta gratis el bucle agéntico (decidir → llamar tool → procesar resultado → repetir), system prompts estructurados, manejo de errores de herramientas y hooks. Reemplaza ~500 líneas de orquestador artesanal.
- **LiteLLM es el gateway de modelos**: si mañana Groq falla o quieres probar otro proveedor free (Cerebras, Gemini free tier…), cambias UNA línea de config YAML, cero código.
- Se mantiene la política **#253 ($0/mes)**: nada de Anthropic API paga — el modelo real sigue siendo Groq free tier. La decisión vigente SUPERSEDE cualquier lectura anterior de #253 que descartara el SDK: **el SDK es necesario y la migración está aprobada explícitamente por Ale (2026-08-22)**. Actualiza AGENTS.md al terminar para cerrar esta contradicción documental.

## 4. Restricciones DURAS (no negociables)

1. **Nunca trabajes en `main` ni commitees directo.** Crea worktree:
   ```bash
   git worktree add ../nenufar-bot-sdk feature/bot/claude-agent-sdk-migration
   ```
   Todo el trabajo vive en ese worktree y esa rama.
2. **Dev server en puerto 3002, NO 3000.**
3. **$0 fijo/mes**: prohibido introducir dependencia de Anthropic API paga. El único camino de inferencia es LiteLLM → Groq (free).
4. **Errores TS pre-existentes NO son regresiones**: `slug` en tipos generados de Payload, `paymentMethod` en seed. No los "arregles" sin entender el sistema de tipos del plugin.
5. **Ruta del webhook**: `/telegram/webhook`, NO `/api/...` (Payload owns `/api` con su catch-all).
6. **Moneda COP sin decimales**: `Intl.NumberFormat('es-CO', { currency: 'COP' })`.
7. **El bot es solo de Shirley**: jamás habilites respuestas a otros chat_id. La validación `chat_id === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)` se conserva tal cual.
8. **Sin regresión de funcionalidad**: al terminar, TODO lo que Shirley hacía hoy debe seguir funcionando (ver §7).

## 5. Plan de migración paso a paso

### Paso 1 — Infraestructura: LiteLLM en docker-compose

Añadir a `docker-compose.yml` (ya tiene `postgres:16` en `:5433`):

```yaml
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: nenufar-litellm
    ports:
      - "4000:4000"
    volumes:
      - ./litellm/config.yaml:/app/config.yaml:ro
    env_file: .env          # consume GROQ_API_KEY y LITELLM_MASTER_KEY
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    depends_on: []
```

Crear `litellm/config.yaml`:

```yaml
model_list:
  - model_name: nenufar-bot
    litellm_params:
      model: groq/llama-3.3-70b-versatile   # los ids de Groq rotan: verifica en console.groq.com
      api_key: os.environ/GROQ_API_KEY

litellm_settings:
  drop_params: true     # CRÍTICO: descarta params Anthropic que Groq no soporta en vez de fallar

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

> `drop_params: true` es la pieza que hace viable todo esto: el SDK envía parámetros Anthropic (thinking, cache_control…) que Groq no conoce; LiteLLM los descarta silenciosamente. Si algo raro ocurre en inferencia, PRIMERO revisa aquí.

### Paso 2 — Variables de entorno

Actualizar `.env.example` y `.env`:

```bash
# ─── Bot brain (Claude Agent SDK vía LiteLLM→Groq) ───
ANTHROPIC_BASE_URL=http://localhost:4000
ANTHROPIC_AUTH_TOKEN=<LITELLM_MASTER_KEY, ej: sk-nenufar-local>
ANTHROPIC_MODEL=nenufar-bot
LITELLM_MASTER_KEY=sk-nenufar-local   # genera uno real: openssl rand -hex 24
GROQ_API_KEY=gsk_...                  # AHORA la consume LiteLLM, no la app
```

Eliminar `GROQ_MODEL` de la app (el routing vive en el YAML de LiteLLM).

### Paso 3 — Dependencias

```bash
pnpm remove groq-sdk
pnpm add @anthropic-ai/claude-agent-sdk zod
```

### Paso 4 — Convertir skills en tools del SDK

Cada skill actual se convierte en una tool con schema Zod. Patrón:

```typescript
// src/lib/agents-v4/tools/pedidosPendientes.ts (ejemplo)
import { tool } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"
// ...reutiliza la lógica existente de src/lib/agents/skills/
// que ya llama a Payload Local API (payload.find, payload.update...)
```

Requisitos por tool:
- Descripción en español, orientada a lo que Shirley pide ("Lista los pedidos con estado pending ordenados del más viejo al más nuevo").
- Errores capturados y devueltos como texto legible (Shirley lee la respuesta; nunca stack traces).
- Máximo de rondas: configura el límite del SDK (equivalente al `max 4 rounds` actual).

### Paso 5 — Reemplazar el runtime

En el handler post-validación del webhook:

```typescript
// Antes: routeAndRun(message) → orchestrator → runtime (loop manual sobre groq.ts)
// Ahora:
import { query } from "@anthropic-ai/claude-agent-sdk"

const result = await query({
  prompt: message.text,
  options: {
    model: process.env.ANTHROPIC_MODEL,           // 'nenufar-bot' → LiteLLM → Groq
    // tools registradas del paso 4
    // system prompt con contexto de tienda (catálogo breve, tono, reglas COP)
  },
})
// → sendMessage de Telegram con result (lógica de reply existente, SIN cambios)
```

Conservar: dedup por `update_id`, timeout de respuesta, y respuesta de cortesía si la inferencia falla ("Shirley, el bot está en mantenimiento, usa /admin") — **jamás un error crudo a Telegram**.

### Paso 6 — Limpieza

- Eliminar `src/lib/groq.ts`, `agents/orchestrator.ts`, `agents/runtime.ts`.
- Actualizar `CLAUDE.md` y `AGENTS.md`: diagrama nuevo, quitar referencias a Groq directo y a "orquestador propio". **Cerrar formalmente la contradicción**: AGENTS.md decía "migración en curso" mientras una decisión previa la daba por descartada — deja escrito: *"Migración a Claude Agent SDK COMPLETADA el [fecha]. Gateway de modelos: LiteLLM → Groq (free, política #253 intacta)."*

### Paso 7 — Verificación (criterios de aceptación)

Ejecuta TODO esto antes de proponer merge:

1. `docker-compose up -d` levanta postgres (:5433) + litellm (:4000). `curl http://localhost:4000/health` OK.
2. `curl http://localhost:4000/v1/messages` con el master key responde vía Groq (prueba de gateway aislada, antes de meter el SDK).
3. `pnpm build` pasa (los errores TS pre-existentes de §4.4 no cuentan).
4. Con dev server en :3002 y webhook registrado (`pnpm tsx scripts/set-telegram-webhook.ts <url>`):
   - "¿qué pedidos tengo pendientes?" → lista real desde Payload.
   - "confirma el pedido #N" → estado cambia a confirmed en admin + respuesta clara.
   - Mensaje ambiguo → pregunta de clarificación, no inventa datos.
   - Un mensaje repetido (mismo update_id) NO ejecuta dos veces la tool (dedup intacto).
5. **Test de caída**: detén el contenedor litellm → el webhook responde mensaje de cortesía a Shirley, sin crash del server, sin stack trace en Telegram.
6. Latencia percibida ≤ la del sistema actual (si Groq tarda >15s sostenido, documenta el hallazgo — no lo escondas).

## 6. Riesgos conocidos (del premortem 2026-08-22)

- **Camino no oficial**: el SDK asume Anthropic API real; LiteLLM+Groq es un puente. Mitigación: `drop_params: true`, pruebas del paso 7.5 y monitoreo de 429s de Groq (>3/semana = señal de alerta temprana documentada en el premortem, Fallo 5).
- **Rate limits de Groq free tier**: el bot es single-user (Shirley), el riesgo es bajo, pero registra cada 429 en logs.
- **No rompas el canal de pedidos**: `TELEGRAM_BOT_TOKEN` sirve DOS propósitos (notificaciones de pedidos al canal + bot de Shirley). Tu migración solo toca el segundo. Un test del flujo pedido→canal DEBE pasar después de la migración.

## 7. Definición de "listo"

Merge a main permitido cuando: pasos 1–7 completos ✅ + docs actualizados ✅ + Ale aprueba demo en vivo con el bot respondiendo desde Telegram real ✅.

---
*Handoff generado 2026-08-22 · Origen: decisión de Ale tras premortem (docs/premortem-transcript-20260822-1326.md) · Supersede la lectura "SDK descartado" de la política #253 manteniendo intacta la restricción $0.*
