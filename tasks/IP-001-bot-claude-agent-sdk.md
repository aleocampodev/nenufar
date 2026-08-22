# IP-001: Migración Bot de Shirley a Claude Agent SDK + LiteLLM (Groq)

> **Documento de Implementación Autónomo para Agentes**  
> **Fecha:** 2026-08-22  
> **Estado:** Listo para ejecución  
> **Ramas y Worktrees:**  
> - **Branch:** `feature/bot/claude-agent-sdk-migration`  
> - **Worktree sugerido:** `/home/ale/Work/nenufar-bot-sdk`  
> **Especificaciones asociadas:**  
> - [`docs/specs/SPEC-002-management-bot-runtime.md`](file:///home/ale/Work/nenufar/docs/specs/SPEC-002-management-bot-runtime.md)  
> - [`docs/HANDOFF-agent-sdk-migration.md`](file:///home/ale/Work/nenufar/docs/HANDOFF-agent-sdk-migration.md)  
> - [`docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md`](file:///home/ale/Work/nenufar/docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md)  

---

## 1. Resumen Ejecutivo y Objetivo

Reemplazar el runtime y orquestador artesanal (`src/lib/groq.ts`, `src/lib/agents/orchestrator.ts`, `src/lib/agents/runtime.ts`) por el loop agéntico oficial de **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`), comunicándose a través de un proxy local **LiteLLM** hacia **Groq** (`llama-3.3-70b-versatile`).

### Restricciones Inviolables:
1. **$0 USD/mes fijo (#253):** No usar claves pagas de Anthropic. Toda inferencia va por LiteLLM → Groq (free tier).
2. **Prohibido Push o Merge directo a `main`:** Trabajar exclusivamente en la rama de feature en un git worktree.
3. **Dev Server en puerto 3002 (NO 3000).**
4. **Respetar Errores TS Pre-existentes:** `slug` en tipos de Payload y `paymentMethod` en seed son pre-existentes del plugin ecommerce. No intentar refactorizarlos.
5. **Seguridad del Bot:** El bot es **exclusivo de Shirley**. Mantener estricta la validación `chat_id === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)`.
6. **No romper notificaciones de pedidos:** El `TELEGRAM_BOT_TOKEN` envía pedidos web al canal y a la vez atiende el webhook de Shirley. No tocar la lógica de envío de pedidos de la tienda.

---

## 2. Preparación del Entorno de Trabajo (Paso Previo)

El agente ejecutor DEBE ejecutar los siguientes comandos antes de modificar código:

```bash
# 1. Crear rama y worktree aislado
git worktree add ../nenufar-bot-sdk -b feature/bot/claude-agent-sdk-migration

# 2. Moverse al worktree
cd ../nenufar-bot-sdk

# 3. Copiar variables de entorno base si no existen en el worktree
cp /home/ale/Work/nenufar/.env .env 2>/dev/null || true
```

---

## 3. Desglose Detallado de Tareas (Vertical Slices)

### 🔹 Fase 1: Infraestructura y Gateway LiteLLM

#### Tarea 1.1: Configuración de LiteLLM en `docker-compose.yml` y `litellm/config.yaml`
- **Archivos a crear/modificar:**
  - `docker-compose.yml`
  - `litellm/config.yaml`
- **Descripción:**
  - Agregar servicio `litellm` a `docker-compose.yml` usando la imagen `ghcr.io/berriai/litellm:main-latest` en el puerto `4000:4000`.
  - Crear `litellm/config.yaml` con el modelo `nenufar-bot` apuntando a `groq/llama-3.3-70b-versatile`, con `drop_params: true` y `master_key: os.environ/LITELLM_MASTER_KEY`.
- **Criterios de Aceptación:**
  - [ ] `docker-compose.yml` define el servicio `litellm` montando `./litellm/config.yaml:/app/config.yaml:ro`.
  - [ ] `litellm/config.yaml` tiene configurado `drop_params: true`.
  - [ ] `docker-compose up -d` levanta Postgres (:5433) y LiteLLM (:4000).
- **Verificación:**
  ```bash
  docker-compose up -d litellm
  curl -s http://localhost:4000/health
  # Debe responder status OK
  ```

#### Tarea 1.2: Variables de Entorno y Dependencias
- **Archivos a modificar:**
  - `.env.example`
  - `package.json`
- **Descripción:**
  - Añadir `ANTHROPIC_BASE_URL=http://localhost:4000`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL=nenufar-bot`, y `LITELLM_MASTER_KEY` a `.env.example` y `.env`.
  - Desinstalar `groq-sdk` e instalar `@anthropic-ai/claude-agent-sdk` y `zod`.
- **Criterios de Aceptación:**
  - [ ] `.env.example` documenta todas las nuevas variables.
  - [ ] `pnpm remove groq-sdk` ejecutado.
  - [ ] `pnpm add @anthropic-ai/claude-agent-sdk zod` ejecutado.
- **Verificación:**
  ```bash
  pnpm ls @anthropic-ai/claude-agent-sdk zod
  ```

---

### 🔹 Fase 2: Definición de Tools Tipadas con Zod

#### Tarea 2.1: Crear herramientas de catálogo y operaciones (`src/lib/agent/tools.ts`)
- **Archivos a crear:**
  - `src/lib/agent/tools.ts`
- **Descripción:**
  Implementar las 7 tools de Shirley descritas en `SPEC-002` conectadas a Payload Local API:
  1. `buscarProducto`: Búsqueda por título en collection `products`.
  2. `destacarProducto`: Actualiza booleano `featured` por `slug`.
  3. `actualizarInventario`: Actualiza `stock` y/o `priceInCOP` por `slug`.
  4. `pedidosPendientes`: Lista órdenes en status `processing`/`pending`.
  5. `confirmarPedido`: Cambia estado de orden a `completed`.
  6. `publicarEvento`: Crea registro en collection `events`.
  7. `crearProductoDraft`: Crea producto en borrador (`_status: 'draft'`).
- **Reglas de las Tools:**
  - Toda salida de error debe capturarse y retornar texto amigable (nunca stack traces a Telegram).
  - Formato de moneda COP sin decimales con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.
- **Criterios de Aceptación:**
  - [ ] Cada tool tiene su schema Zod con descripciones claras en español.
  - [ ] Cada tool recibe o accede a la instancia `payload` (Payload Local API) con `overrideAccess: false` o según permisos administrativos.
- **Verificación:**
  - `pnpm lint` sin errores en `src/lib/agent/tools.ts`.

---

### 🔹 Fase 3: Runtime del Agente y Adaptador Webhook

#### Tarea 3.1: Implementar Runtime de Consulta (`src/lib/agent/runShirleyAgent.ts`)
- **Archivos a crear:**
  - `src/lib/agent/runShirleyAgent.ts`
- **Descripción:**
  - Invocar `query` del Claude Agent SDK configurando:
    - Base URL: `process.env.ANTHROPIC_BASE_URL` (http://localhost:4000)
    - Auth token: `process.env.ANTHROPIC_AUTH_TOKEN` (o `LITELLM_MASTER_KEY`)
    - Modelo: `process.env.ANTHROPIC_MODEL || 'nenufar-bot'`
    - System prompt con tono cálido cartagenero de Shirley, reglas de negocio y lista de herramientas.
    - Límite de rondas: `maxTurns: 4`.
  - Capturar fallos (ej: timeout o caída de LiteLLM) y retornar mensaje de cortesía seguro.
- **Criterios de Aceptación:**
  - [ ] El SDK ejecuta el ciclo agéntico autónomo (decisión → llamada a tool → resultado → respuesta final).
  - [ ] En caso de error crítico o caída del gateway, devuelve fallback: *"Shirley, tuve un inconveniente conectando con el servicio. Puedes revisar directamente en /admin mientras tanto 💜"*.

#### Tarea 3.2: Actualizar Handler del Webhook (`src/app/(app)/telegram/webhook/route.ts`)
- **Archivos a modificar:**
  - `src/app/(app)/telegram/webhook/route.ts`
- **Descripción:**
  - Mantener intacta la validación del secret `x-telegram-bot-api-secret-token`.
  - Mantener guard de admin: `chatId === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)`.
  - Mantener deduplicación por `update_id`.
  - Reemplazar la llamada `routeAndRun(...)` por `runShirleyAgent({ text, payload, chatId, userName })`.
  - Enviar la respuesta vía `sendTelegramReply`.
- **Criterios de Aceptación:**
  - [ ] El webhook sigue en `/telegram/webhook` (no bajo `/api/`).
  - [ ] Mensajes no autorizados se rechazan silenciosamente con `200 OK` (evitando reintentos de Telegram).

---

### 🔹 Fase 4: Limpieza de Código y Actualización Documental

#### Tarea 4.1: Eliminar Código Obsoleto
- **Archivos a eliminar:**
  - `src/lib/groq.ts`
  - `src/lib/agents/orchestrator.ts`
  - `src/lib/agents/runtime.ts`
  - `src/lib/agents/skills/*`
- **Criterios de Aceptación:**
  - [ ] No quedan importaciones residuales de `groq-sdk` ni del orquestador manual.

#### Tarea 4.2: Actualizar `CLAUDE.md` y `AGENTS.md`
- **Archivos a modificar:**
  - `CLAUDE.md`
  - `AGENTS.md`
- **Descripción:**
  - Actualizar diagramas y descripciones del bot para reflejar la arquitectura **Claude Agent SDK + LiteLLM (:4000) → Groq Free Tier**.
  - Documentar fecha de cierre de la migración.
- **Criterios de Aceptación:**
  - [ ] Ambos documentos reflejan con exactitud la arquitectura final.

---

## 4. Checkpoints de Verificación y DoD (Definition of Done)

### Checkpoint A: Verificación de Gateway Aislado
```bash
docker-compose up -d litellm
curl -X POST http://localhost:4000/v1/messages \
  -H "x-api-key: sk-nenufar-local" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "nenufar-bot",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hola, responde OK"}]
  }'
# Debe devolver respuesta JSON válida desde Groq
```

### Checkpoint B: Verificación de Build e Integración
```bash
pnpm build
# Debe compilar exitosamente (ignorando los errores TS preexistentes de slug/paymentMethod)
```

### Checkpoint C: Verificación Funcional del Bot
Con el dev server corriendo en el puerto 3002:
1. Simular / Probar webhook con mensaje: `¿Qué pedidos tengo pendientes?` -> Invoca tool `pedidosPendientes` y formatea respuesta.
2. Simular mensaje repetido con mismo `update_id` -> Deduplicado sin ejecutar tools dos veces.
3. Simular caída de LiteLLM (`docker-compose stop litellm`) -> Mensaje de cortesía seguro en Telegram, sin crash del servidor.
