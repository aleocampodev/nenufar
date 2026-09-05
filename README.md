# Nénufar — Joyería Artesanal de Colombia

<div align="center">

*Cada pieza cuenta una historia. Hecha a mano en Cartagena.*

[![Status](https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=flat-square)](https://github.com/aleocampodev/nenufar)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload-v3-7C3AED?style=flat-square)](https://payloadcms.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Claude Agent SDK](https://img.shields.io/badge/Claude%20Agent%20SDK-0.3-7C3AED?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code/sdk)
[![LiteLLM](https://img.shields.io/badge/LiteLLM-Gateway-0EA5E9?style=flat-square)](https://docs.litellm.ai)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat-square)](https://console.groq.com)

</div>

---

## Qué es Nénufar

Nénufar es la tienda online de Shirley, joyera artesanal de Cartagena. La plataforma le permite mostrar su catálogo de piezas únicas y recibir pedidos estructurados en Telegram — sin pasarela de pago, sin comisiones, sin intermediarios.

El flujo es intencionalmente simple: la compradora explora el catálogo, elige su pieza, agrega notas de personalización (talla, grabado, instrucciones especiales), y llena sus datos de contacto. Shirley recibe el pedido en Telegram y cierra la venta por WhatsApp, tal como siempre lo ha hecho. La plataforma no reemplaza su forma de trabajar: la amplifica.

Desde la **v3.3** el mismo bot de Telegram incorpora un **sistema agéntico de gestión, exclusivo para Shirley, sobre Claude Agent SDK**: ella le escribe al bot en lenguaje natural y el SDK orquesta el loop agéntico (decidir → llamar tool → procesar → responder) a través de un gateway local **LiteLLM :4000 → Groq free tier** (política $0/mes intacta). **Las compradoras no interactúan con el bot** — su recorrido es 100% web.

---

## Constitución

> 🏛️ **Fuente canónica:** [`CONSTITUTION.md`](./CONSTITUTION.md) — 7 Artículos que rigen todo el desarrollo.

| Artículo | Qué establece |
|----------|---------------|
| **I — Negocio** | Atelier de Shirley, sinergia físico-digital, modelo *Zero-Stripe Human Closing* (`/shop → /pedidos/enviar → Telegram → WhatsApp`) |
| **II — $0/mes #253** | Cero SaaS recurrente. Bot vía `Claude Agent SDK → LiteLLM :4000 → Groq free` (`drop_params: true`), fallback Gemini 2.0 Flash. Prohibido usar API paga de Anthropic/OpenAI |
| **III — Git** | Ban absoluto de push/merge directo a `main`. Trabajo solo en feature branches con worktrees aislados, integración solo vía PR |
| **IV — Arquitectura** | Monolito embebido (Next.js + Payload en el mismo proceso), Payload Local API first, puerto **3002** (nunca 3000), webhook en `/telegram/webhook` (nunca `/api/...`) |
| **V — Seguridad** | Ley 1581 (consentimiento explícito), bot solo Shirley (`chat_id === TELEGRAM_ADMIN_CHAT_ID`, rechazo silencioso 200), idempotencia SHA256 5 min |
| **VI — Estándares** | **Idioma:** UI/bot en español `es-CO`, código/docs/commits/specs/ADRs en inglés. **Moneda:** COP sin decimales `$ 45.000` (prohibido `COP` en UI). Brand `--brand: #E91E8C` (secundario `#3B032F`) |
| **VII — SDLC** | Slicing vertical S/M, tracking en `tasks/plan.md` + `tasks/todo.md`, handoffs para migraciones mayores |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CANALES              APLICACIÓN                 AGENTE               EXTERNOS   │
│                                                                                 │
│  ┌───────────┐        ┌──────────────┐                                          │
│  │Compradora │───────▶│ Next.js 15 + │                                          │
│  │  (web)    │        │ Payload CMS  │──────────▶ Canal pedidos                 │
│  │/shop·carro│        │  v3          │  sendMessage   (Shirley lee)             │
│  └───────────┘        │  /pedidos    │                                          │
│                       │  /shop       │   ┌──────────────────────┐               │
│  ┌───────────┐        │  /admin      │   │  Claude Agent SDK    │               │
│  │ Telegram  │        └──────┬───────┘   │  query() loop        │               │
│  │ (SHIRLEY) │               │           │  maxTurns: 4         │               │
│  └─────┬─────┘        ┌──────▼──────────┐└──────────┬───────────┘               │
│        │              │/telegram/webhook│           │ LiteLLM :4000             │
│        │              │ POST · secret    │           │ drop_params: true         │
│        └─────────────▶│ chat_id==ADMIN?  │──────────▶│ nenufar-bot               │
│                       │ dedup update_id  │           │ groq/llama-3.3-70b        │
│                       │ runShirleyAgent()│           └──────────┬───────────┘    │
│                       └──────┬──────────┘                      │                  │
│                              │              ┌──────────────────▼───┐              │
│                        REPLY │              │  7 tools MCP         │              │
│                        a Shirley◀───────────│  Payload Local API   │              │
│                                             │  buscar·destacar·     │              │
│                                             │  inventario·pedidos·  │              │
│                                             │  confirmar·evento·    │              │
│                                             │  crearDraft           │              │
│                                             └──────────┬───────────┘              │
│                                                        │                          │
│                                        ┌───────────────▼──────────┐               │
│                                        │      PostgreSQL 16       │               │
│                                        │  products·orders·events  │               │
│                                        └──────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘

  El bot es solo de Shirley (auth por chat_id). La compradora nunca le escribe.
  Política $0/mes intacta: la app nunca llama a la API paga de Anthropic.
```

**Diagrama interactivo:** [`docs/arquitectura.html`](docs/arquitectura.html) — ver en browser para los colores.

### Flujo de pedido (core del negocio)

| Paso | Actor | Qué pasa |
|------|-------|----------|
| 1 | Compradora | Explora el catálogo, elige variantes (material, talla) |
| 2 | Compradora | Agrega notas de personalización al carrito |
| 3 | Compradora | Llena nombre + número de WhatsApp, acepta política Ley 1581 |
| 4 | Sistema | Guarda el pedido en Payload + envía mensaje estructurado a Telegram |
| 5 | Shirley | Lee el pedido, confirma precio y coordina envío por WhatsApp |

### Flujo del bot de gestión de Shirley (v3.3)

| Paso | Actor | Qué pasa |
|------|-------|----------|
| 1 | Shirley | Escribe al bot: "¿qué pedidos pendientes tengo?" |
| 2 | Webhook | Recibe POST, valida `x-telegram-bot-api-secret-token`, verifica `chat_id == TELEGRAM_ADMIN_CHAT_ID`, deduplica por `update_id` (no autorizado → 200 silencioso) |
| 3 | Agent SDK | `runShirleyAgent()` invoca `query()` con system prompt cartagenero, `maxTurns: 4`, whitelist `mcp__nenufar-tienda__*` vía LiteLLM :4000 |
| 4 | Tool | El modelo decide y llama la tool (`pedidosPendientes` → `payload.find(orders, status=processing)`) |
| 5 | Bot | Responde a Shirley en el mismo chat con la lista formateada (COP `$ 45.000`, sin `COP`). Si LiteLLM cae → fallback de cortesía, sin crash |

**7 tools de Shirley (Payload Local API, `overrideAccess: false`):** `buscarProducto` · `destacarProducto` (toggle `featured`) · `actualizarInventario` (stock/priceInCOP) · `pedidosPendientes` · `confirmarPedido` → `completed` · `publicarEvento` (draft) · `crearProductoDraft` (draft).

**Solo Shirley:** el webhook procesa únicamente mensajes cuyo `chat_id` sea el de Shirley; cualquier otro remitente se ignora. Las tools que escriben son acciones de la propia Shirley en lenguaje natural.

---

## Tech Stack

| Capa | Tecnología | Versión / Detalles |
|------|------------|--------------------|
| **Framework** | Next.js | 15 · App Router, RSC, Server Actions, Turbopack |
| **CMS** | Payload CMS | v3 · Self-hosted, admin UI, Local API (`getPayload`) |
| **Base de datos** | PostgreSQL | 16 · vía `@payloadcms/db-postgres` (Drizzle), puerto `5433` en dev |
| **Lenguaje** | TypeScript | 6 · `strict`, tipos generados `payload generate:types` |
| **Validación** | Zod | 4 · schemas de las 7 tools del bot |
| **UI** | TailwindCSS + shadcn/ui | v4 + Radix UI, tokens CSS, `bg-brand` (`#E91E8C`) |
| **Tipografía** | Playfair Display · Inter · Geist Mono | vía `next/font` |
| **Imágenes** | Sharp | 0.34 · WebP automático en 4 tamaños al subir, `serverExternalPackages` |
| **Estado / Forms** | React Hook Form + date-fns + sonner |  |
| **Agente IA** | Claude Agent SDK | `0.3.x` · loop `query()` con MCP, `maxTurns: 4`, `allowedTools` whitelist |
| **Gateway modelos** | LiteLLM Proxy | `ghcr.io/berriai/litellm:main-latest` · `:4000`, `drop_params: true`, `model: nenufar-bot → groq/llama-3.3-70b-versatile` |
| **LLM** | Groq Cloud Free Tier | `llama-3.3-70b-versatile` (consumido solo por LiteLLM, nunca directo) |
| **Bot Telegram** | Telegram Bot API | Un solo `TELEGRAM_BOT_TOKEN`: notificaciones (one-way al canal) + gestión Shirley (two-way webhook, auth `chat_id`) |
| **Tests** | Vitest + Playwright | `test:int` (Payload + agent mocks) · `test:e2e` (Playwright) |
| **Tooling** | pnpm 10 · ESLint 9 · Prettier · cross-env · tsx |  |
| **Infra local** | Docker Compose | `postgres:16` + `litellm:main-latest` |
| **Deploy** | Vercel (previsto) | `vercel-blob` para media en prod, `payload migrate` en prod |

---

## Inicio rápido

### Requisitos previos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL + LiteLLM)
- Cuenta en [console.groq.com](https://console.groq.com) (gratis) para el bot

### Paso a paso

```bash
# 1. Clonar
git clone https://github.com/aleocampodev/nenufar.git
cd nenufar

# 2. Variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección abajo)

# 3. Infra local
docker-compose up -d       # PostgreSQL :5433 + LiteLLM :4000

# 4. Dependencias
pnpm install

# 5. Dev server
pnpm dev                   # → http://localhost:3002
```

Abrir **http://localhost:3002/admin** → Dashboard → **"Seed database"** para cargar productos y páginas de muestra.

### Variables de entorno

```env
# ── Core ────────────────────────────────────────────────
PAYLOAD_SECRET=un-string-largo-y-aleatorio-min-32-chars
DATABASE_URL=postgres://postgres:postgres@localhost:5433/nenufar
NEXT_PUBLIC_SERVER_URL=http://localhost:3002

# ── Bot de pedidos (notificaciones a Shirley) ────────────
# Crear con @BotFather en Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-tu-token
TELEGRAM_CHANNEL_ID=@tucanal   # o -100xxxxxxxx si es privado

# ── Bot de gestión de Shirley — Claude Agent SDK vía LiteLLM (v3.3) ─
# Usa el MISMO TELEGRAM_BOT_TOKEN de arriba — no se crea otro bot.
# La app NUNCA llama a la API paga de Anthropic; todo va por LiteLLM :4000 → Groq free.
# String aleatorio: openssl rand -hex 24
TELEGRAM_WEBHOOK_SECRET=tu-secreto-largo
# chat_id de Shirley (con @userinfobot) — único remitente que el bot procesa
TELEGRAM_ADMIN_CHAT_ID=123456789
# Groq free — la consume SOLO LiteLLM, no la app
GROQ_API_KEY=gsk_tu_api_key
LITELLM_MASTER_KEY=sk-nenufar-local   # openssl rand -hex 24
ANTHROPIC_BASE_URL=http://localhost:4000
ANTHROPIC_AUTH_TOKEN=sk-nenufar-local # mismo valor que LITELLM_MASTER_KEY
ANTHROPIC_MODEL=nenufar-bot            # ruteado en litellm/config.yaml

# ── Otros ───────────────────────────────────────────────
PREVIEW_SECRET=otro-string-aleatorio
```

### Activar el bot de gestión

Una vez que tengas las variables configuradas y el servidor corriendo:

```bash
# 1. Exponer el servidor localmente con un túnel HTTPS gratuito
cloudflared tunnel --url http://localhost:3002
# → te da una URL como https://xxxxx.trycloudflare.com

# 2. Registrar el webhook con esa URL
pnpm tsx scripts/set-telegram-webhook.ts https://xxxxx.trycloudflare.com

# 3. Verificar que quedó registrado
pnpm tsx scripts/set-telegram-webhook.ts info
```

Ahora escríbele al bot de gestión en Telegram y el sistema responderá.

---

## Comandos

```bash
pnpm dev                   # Dev server → localhost:3002 (NO 3000)
pnpm build                 # Build de producción (payload build)
pnpm start                 # Servidor de producción
pnpm test:int              # Tests de integración (Vitest)
pnpm test:e2e              # Tests E2E (Playwright)
pnpm payload migrate       # Migraciones de DB (producción)
pnpm generate:types        # Regenerar tipos de Payload
pnpm generate:importmap    # Regenerar import map

# Infra
docker-compose up -d       # Postgres :5433 + LiteLLM :4000
docker-compose up -d litellm  # solo gateway
curl http://localhost:4000/health/liveliness  # health del gateway

# Webhook del bot de gestión
pnpm tsx scripts/set-telegram-webhook.ts <url>   # registrar
pnpm tsx scripts/set-telegram-webhook.ts info    # consultar
pnpm tsx scripts/set-telegram-webhook.ts delete  # eliminar
```

---

## Rutas del sitio

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero y bloques del page-builder |
| `/shop` | Catálogo con búsqueda y filtros |
| `/products/[slug]` | Detalle de producto con variantes |
| `/blog` | Blog de Shirley |
| `/blog/[slug]` | Artículo con rich text y fotos |
| `/eventos` | Próximas ferias y eventos |
| `/pedidos/enviar` | Formulario de pedido (standard o personalizado) |
| `/pedidos/enviar/confirmacion` | Pantalla de éxito post-pedido |
| `/sobre-nenufar` | Historia de la marca |
| `/contacto` | Información de contacto |
| `/privacidad` | Política de privacidad (Ley 1581 de 2012) |
| `/terminos` | Términos y condiciones |
| `/(account)/` | Cuenta de compradora, pedidos, direcciones |
| `/admin` | Panel de Payload CMS (Shirley) |
| `/telegram/webhook` | Webhook del bot de gestión (POST, solo Shirley) |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (app)/
│   │   ├── shop/                   # Catálogo de productos
│   │   ├── products/[slug]/        # Detalle de producto
│   │   ├── blog/                   # Blog
│   │   ├── eventos/                # Eventos y ferias
│   │   ├── pedidos/enviar/         # Formulario de pedido → Telegram
│   │   │   ├── OrderForm.tsx       # Form (standard + custom personalization)
│   │   │   └── submitOrderAction.ts # Server action: valida → Order → Telegram
│   │   ├── telegram/webhook/       # Webhook del bot de gestión (v3.3)
│   │   │   └── route.ts            # secret + admin guard + dedup + runShirleyAgent
│   │   └── (account)/             # Cuenta de compradora
│   └── (payload)/                  # Admin de Payload
├── collections/
│   ├── Products/                   # Catálogo (title, priceInCOP, inventory, featured ✨)
│   ├── Categories.ts
│   ├── Media.ts                    # Imágenes con WebP automático
│   ├── Posts.ts                    # Blog posts
│   ├── Events.ts                   # Eventos y ferias (draft/published)
│   └── Users/                      # Clientes + Shirley (admin)
├── lib/
│   ├── telegram.ts                 # Cliente Telegram (pedidos + reply)
│   ├── order-formatter.ts          # Formatea mensaje HTML de pedido
│   ├── idempotency.ts              # Deduplicación de pedidos (SHA256 5 min)
│   └── agent/                      # Bot de Shirley — Claude Agent SDK (v3.3)
│       ├── tools.ts                # 7 tools Zod → Payload Local API (MCP)
│       └── runShirleyAgent.ts      # query() + maxTurns 4 + fallback cortesía
├── blocks/                         # Bloques del page-builder
├── components/ui/                  # shadcn/ui
└── scripts/
    └── set-telegram-webhook.ts     # CLI para gestionar el webhook

litellm/
└── config.yaml                     # Gateway: nenufar-bot → groq/llama-3.3-70b-versatile

tests/
├── e2e/                            # Playwright (frontend + admin)
└── int/
    ├── api.int.spec.ts             # Endpoints REST de Payload
    ├── order-formatter.int.spec.ts # Formateo de mensajes Telegram
    └── agent-runtime.int.spec.ts   # Bot SDK — mocks de query() + fallback

docs/
├── CONSTITUTION.md                 # 7 Artículos canónicos (fuente suprema)
├── adr/
│   ├── ADR-001-no-payment-gateway-human-closing.md
│   ├── ADR-002-claude-agent-sdk-litellm-groq.md
│   └── ADR-003-payload-embedded-monolith-local-api.md
├── specs/
│   ├── BRD.md · PRD.md · SDD.md · TRD.md
│   ├── SPEC-001-storefront-checkout.md
│   ├── SPEC-002-management-bot-runtime.md
│   └── SPEC-003-catalog-landing-blocks.md
├── HANDOFF-agent-sdk-migration.md  # Handoff IP-001 (pre-migración)
├── premortem-*.md/html             # Premortem 2026-08-22
├── arquitectura.html               # Diagrama interactivo
└── diagrams.html
tasks/
├── IP-001-bot-claude-agent-sdk.md  # Spec de migración (English, Art. VI)
└── todo.md                         # Backlog vertical slices
```

---

## Pipeline de imágenes

Al subir una foto al admin, Payload genera automáticamente variantes WebP (calidad 92) **sin modificar el original**:

| Variante | Dimensiones | Uso |
|----------|-------------|-----|
| `thumbnail` | 400 × 500 | Carrito, miniaturas |
| `card` | 800 × 1000 | Grid de productos |
| `hero` | 1920 × 1080 | Fondos de página |
| `og` | 1200 × 630 | Redes sociales / SEO |

---

## Decisiones de diseño

**Sin pasarela de pago** — intencional (ADR-001). Los pagos se coordinan manualmente por WhatsApp (Nequi, transferencia, efectivo). Agregar Stripe introduciría fricción y comisiones que no tienen sentido para el volumen actual.

**Un solo bot de Telegram** — el mismo `TELEGRAM_BOT_TOKEN` hace dos cosas: envía notificaciones de pedidos al canal de Shirley (`TELEGRAM_CHANNEL_ID`) y recibe los mensajes de gestión de la propia Shirley vía webhook (autenticados por `TELEGRAM_ADMIN_CHAT_ID`). No se necesita un bot adicional, y las compradoras nunca le escriben al bot.

**Claude Agent SDK vía LiteLLM (v3.3)** — el orquestador artesanal sobre Groq fue reemplazado por el loop oficial del SDK. LiteLLM es el gateway: si Groq falla o se quiere probar otro free tier (Gemini Flash, Cerebras), se cambia una línea en `litellm/config.yaml`, cero código. `drop_params: true` es crítico (el SDK envía params Anthropic que Groq no soporta).

**$0/mes #253 intacto** — la app nunca llama a la API paga de Anthropic. Toda inferencia es `SDK → ANTHROPIC_BASE_URL=:4000 → Groq free`. El fallback es Gemini 2.0 Flash vía el mismo LiteLLM.

**El bot es la herramienta de Shirley, no un vendedor** — los agentes ejecutan las acciones de gestión que Shirley pide en lenguaje natural (ver pedidos, confirmar, actualizar stock, destacar, crear borradores). No hay agente que atienda compradoras: la venta y su cierre siempre los maneja Shirley por WhatsApp.

**COP sin decimales** — `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })` → `$ 45.000`. Prohibido mostrar `COP` en UI/Telegram (Art. VI).

**WebP al subir** — Sharp convierte en el servidor. El original siempre se preserva.

**Idempotencia en memoria** — deduplicación de pedidos y de `update_id` del bot usan Map en memoria (suficiente para instancia única). Para multi-instancia, reemplazar por KV/DB.

**Webhook fuera de `/api`** — vive en `/telegram/webhook` (no `/api/telegram/webhook`) para no chocar con el catch-all de Payload en `src/app/(payload)/api/[...slug]/route.ts`.

**Puerto 3002** — nunca 3000 (Art. IV). `serverExternalPackages: ['@anthropic-ai/claude-agent-sdk']` evita que Next bundlee el SDK que hace spawn.

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`CONSTITUTION.md`](CONSTITUTION.md) | **Fuente canónica** — 7 Artículos (negocio, $0/mes, Git, arquitectura, seguridad, estándares, SDLC) |
| [`CLAUDE.md`](CLAUDE.md) | Contexto técnico para agentes de IA (stack, flujos, comandos) |
| [`AGENTS.md`](AGENTS.md) | Índice rápido para OpenCode + reglas para agentes |
| [`docs/specs/BRD.md`](docs/specs/BRD.md) | Requerimientos de negocio — objetivos, KPIs, alcance |
| [`docs/specs/PRD.md`](docs/specs/PRD.md) | Requerimientos de producto — user stories, ACs |
| [`docs/specs/SDD.md`](docs/specs/SDD.md) | Diseño de software — arquitectura, módulos, flujos (§2.3 bot) |
| [`docs/specs/TRD.md`](docs/specs/TRD.md) | Especificación técnica — stack, modelos, API, deploy |
| [`docs/adr/ADR-001-...`](docs/adr/ADR-001-no-payment-gateway-human-closing.md) | Sin pasarela de pago — cierre humano |
| [`docs/adr/ADR-002-...`](docs/adr/ADR-002-claude-agent-sdk-litellm-groq.md) | Bot: Claude Agent SDK + LiteLLM → Groq |
| [`docs/adr/ADR-003-...`](docs/adr/ADR-003-payload-embedded-monolith-local-api.md) | Monolito embebido + Local API |
| [`docs/HANDOFF-agent-sdk-migration.md`](docs/HANDOFF-agent-sdk-migration.md) | Handoff IP-001 — arquitectura objetivo, fases, caveats |
| [`tasks/IP-001-bot-claude-agent-sdk.md`](tasks/IP-001-bot-claude-agent-sdk.md) | Spec de migración IP-001 (English) |
| [`docs/arquitectura.html`](docs/arquitectura.html) | Diagrama interactivo de arquitectura |

---

<div align="center">

Privado — © 2026 Nénufar · Hecho con cariño para Shirley 🌸

</div>
