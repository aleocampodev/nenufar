# Nénufar — Joyería Artesanal de Colombia

<div align="center">

*Cada pieza cuenta una historia. Hecha a mano en Cartagena.*

[![Status](https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=flat-square)](https://github.com/aleocampodev/nenufar)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload-v3-7C3AED?style=flat-square)](https://payloadcms.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-F55036?style=flat-square)](https://console.groq.com)

</div>

---

## Qué es Nénufar

Nénufar es la tienda online de Shirley, joyera artesanal de Cartagena. La plataforma le permite mostrar su catálogo de piezas únicas y recibir pedidos estructurados en Telegram — sin pasarela de pago, sin comisiones, sin intermediarios.

El flujo es intencionalmente simple: la compradora explora el catálogo, elige su pieza, agrega notas de personalización (talla, grabado, instrucciones especiales), y llena sus datos de contacto. Shirley recibe el pedido en Telegram y cierra la venta por WhatsApp, tal como siempre lo ha hecho. La plataforma no reemplaza su forma de trabajar: la amplifica.

A partir de la v3.2 el mismo bot de Telegram incorpora un **sistema multiagente de gestión, exclusivo para Shirley**: ella le escribe al bot y el orquestador interpreta la intención y ejecuta skills sobre Payload (ver pedidos, confirmar, actualizar stock). Todo con Groq (free tier), sin costo de infraestructura. **Las compradoras no interactúan con el bot** — su recorrido es 100% web.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CANALES          APLICACIÓN             AGENTES IA         EXTERNOS    │
│                                                                         │
│  ┌───────────┐    ┌──────────────┐                                     │
│  │Compradora │───▶│ Next.js +    │                                     │
│  │  (web)    │    │ Payload CMS  │                                     │
│  │/shop·carro│    │              │──────────▶ Canal pedidos            │
│  └───────────┘    │  /pedidos    │  sendMessage  (Shirley lee)         │
│                   │  /shop       │                                     │
│                   │  /admin      │   ┌──────────────────┐              │
│  ┌───────────┐    └──────┬───────┘   │   Orquestador    │──▶ Groq      │
│  │ Telegram  │           │           │ (interpreta req.)│              │
│  │ (SHIRLEY) │    ┌──────▼──────────┐└──┬────┬────┬─────┘              │
│  └─────┬─────┘    │/telegram/webhook│   │    │    │                    │
│        │          │ POST · secret    │  ▼    ▼    ▼                    │
│        └─────────▶│ chat_id==ADMIN?  │ pedidos catálogo inventario     │
│                   │ dedup · routeAnd │  skills sobre Payload            │
│                   └──────┬──────────┘   │    │    │                    │
│                          │        ┌─────▼────▼────▼─┐                  │
│                    REPLY │        │   PostgreSQL    │                  │
│                    a Shirley◀──────│ products·orders │                  │
│                                   └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘

  El bot es solo de Shirley (auth por chat_id). La compradora nunca le escribe.

  FUTURO (Fase 3.3): Supabase pgvector + embeddings locales (Transformers.js)
  buscarProducto → búsqueda semántica sobre el catálogo
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

### Flujo del bot de gestión de Shirley (v3.2)

| Paso | Actor | Qué pasa |
|------|-------|----------|
| 1 | Shirley | Escribe al bot: "¿qué pedidos pendientes tengo?" |
| 2 | Webhook | Recibe POST, valida secreto, verifica `chat_id == TELEGRAM_ADMIN_CHAT_ID`, deduplica por `update_id` |
| 3 | Orquestador | Llama a Groq con temperatura=0, interpreta la intención → `pedidos` |
| 4 | Skill | Ejecuta la skill sobre Payload → `payload.find(orders, status=pending)` |
| 5 | Bot | Responde a Shirley en el mismo chat con la lista de pedidos |

**Solo Shirley:** el webhook procesa únicamente mensajes cuyo `chat_id` sea el de Shirley (`TELEGRAM_ADMIN_CHAT_ID`); cualquier otro remitente se ignora. Las skills que escriben en Payload (confirmar pedido, actualizar stock) son acciones de la propia Shirley expresadas en lenguaje natural.

---

## Tech Stack

| Capa | Tecnología | Detalles |
|------|------------|----------|
| Framework | Next.js 15 | App Router, RSC, Server Actions |
| CMS | Payload CMS v3 | Self-hosted, admin UI, Local API |
| Base de datos | PostgreSQL 16 | Drizzle ORM (vía Payload) |
| UI | TailwindCSS v4 + shadcn/ui | Tokens OKLCH, color de marca `--brand` |
| Tipografía | Playfair Display · Inter · Geist Mono | |
| Imágenes | Sharp | WebP automático en 4 tamaños al subir |
| Agentes IA | Groq SDK (`groq-sdk`) | Llama 3.3 70B, free tier, tool-calling |
| Bot Telegram | Telegram Bot API | Un solo bot: notificaciones de pedidos (one-way) + gestión de Shirley vía webhook (two-way, auth por `chat_id`) |
| Tests | Vitest + Playwright | Int + E2E |

---

## Inicio rápido

### Requisitos previos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL local)
- Cuenta en [console.groq.com](https://console.groq.com) (gratis) para el bot de gestión

### Paso a paso

```bash
# 1. Clonar
git clone https://github.com/aleocampodev/nenufar.git
cd nenufar

# 2. Variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección abajo)

# 3. Base de datos
docker-compose up -d       # PostgreSQL en puerto 5433

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

# ── Bot de gestión de Shirley (agentes IA, v3.2) ─────────
# Usa el MISMO TELEGRAM_BOT_TOKEN de arriba — no se crea otro bot.
# String aleatorio: openssl rand -hex 24
TELEGRAM_WEBHOOK_SECRET=tu-secreto-largo
# chat_id de Shirley (con @userinfobot) — único remitente que el bot procesa
TELEGRAM_ADMIN_CHAT_ID=123456789
# Gratis en console.groq.com
GROQ_API_KEY=gsk_tu_api_key
# GROQ_MODEL=llama-3.3-70b-versatile   # opcional

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
pnpm dev                   # Dev server → localhost:3002
pnpm build                 # Build de producción
pnpm start                 # Servidor de producción
pnpm test:int              # Tests de integración (Vitest)
pnpm test:e2e              # Tests E2E (Playwright)
pnpm payload migrate       # Migraciones de DB (producción)
pnpm generate:types        # Regenerar tipos de Payload

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
| `/telegram/webhook` | Webhook del bot de gestión (POST) |

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
│   │   ├── telegram/webhook/       # Webhook del bot de gestión ← NUEVO
│   │   └── (account)/             # Cuenta de compradora
│   └── (payload)/                  # Admin de Payload
├── collections/
│   ├── Products/                   # Catálogo de joyería
│   ├── Media.ts                    # Imágenes con WebP automático
│   ├── Posts.ts                    # Blog posts
│   └── Events.ts                   # Eventos y ferias
├── lib/
│   ├── telegram.ts                 # Cliente Telegram (pedidos + reply)
│   ├── order-formatter.ts          # Formatea el mensaje HTML de pedido
│   ├── idempotency.ts              # Deduplicación de pedidos
│   ├── groq.ts                     # Cliente Groq (singleton) ← NUEVO
│   └── agents/                     # Sistema multiagente ← NUEVO
│       ├── types.ts                # AgentContext, Skill, Agent
│       ├── runtime.ts              # Loop de tool-calling (max 4 rondas)
│       ├── orchestrator.ts         # routeAndRun() — clasifica y delega
│       ├── catalogo.ts             # Agente Catálogo
│       ├── conversacion.ts         # Agente Conversación
│       └── skills/
│           ├── buscarProductos.ts  # payload.find → devuelve piezas reales
│           └── derivarAShirley.ts  # Handoff al canal de pedidos de Shirley
├── blocks/                         # Bloques del page-builder
└── scripts/
    └── set-telegram-webhook.ts     # CLI para gestionar el webhook ← NUEVO
tests/
├── e2e/                            # Playwright (frontend + admin)
└── int/
    ├── api.int.spec.ts             # Endpoints REST de Payload
    └── agents.int.spec.ts          # Tests del sistema multiagente ← NUEVO
docs/
├── arquitectura.html               # Diagrama de arquitectura interactivo
├── BRD.md                          # Requerimientos de negocio
├── PRD.md                          # Requerimientos de producto
├── SDD.md                          # Diseño de software
└── TSD.md                          # Especificación técnica
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

**Sin pasarela de pago** — intencional. Los pagos se coordinan manualmente por WhatsApp (Nequi, transferencia, efectivo). Agregar Stripe introduciría fricción y comisiones que no tienen sentido para el volumen actual.

**Un solo bot de Telegram** — el mismo `TELEGRAM_BOT_TOKEN` hace dos cosas: envía notificaciones de pedidos al canal de Shirley (`TELEGRAM_CHANNEL_ID`) y recibe los mensajes de gestión de la propia Shirley vía webhook (autenticados por `TELEGRAM_ADMIN_CHAT_ID`). No se necesita un bot adicional, y las compradoras nunca le escriben al bot.

**El bot es la herramienta de Shirley, no un vendedor** — los agentes IA ejecutan las acciones de gestión que Shirley pide en lenguaje natural (ver pedidos, confirmar, actualizar stock). No hay agente que atienda compradoras: la venta y su cierre siempre los maneja Shirley por WhatsApp.

**COP sin decimales** — `Intl.NumberFormat('es-CO', { currency: 'COP' })`. Los pesos colombianos no usan centavos.

**WebP al subir** — Sharp convierte las imágenes en el servidor. El original siempre se preserva.

**Idempotencia en memoria** — la deduplicación de pedidos usa un Map en memoria. Para deploys multi-instancia (Vercel), reemplazar con Vercel KV o un campo en PostgreSQL.

**Webhook fuera de `/api`** — el webhook del bot vive en `/telegram/webhook` (no `/api/telegram/webhook`) para no chocar con el catch-all de Payload en `src/app/(payload)/api/[...slug]/route.ts`.

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/BRD.md`](docs/BRD.md) | Requerimientos de negocio — objetivos, KPIs, alcance |
| [`docs/PRD.md`](docs/PRD.md) | Requerimientos de producto — user stories, criterios de aceptación |
| [`docs/SDD.md`](docs/SDD.md) | Diseño de software — arquitectura, módulos, flujos |
| [`docs/TSD.md`](docs/TSD.md) | Especificación técnica — stack, modelos de datos, API, deploy |
| [`docs/RAG-MEMORY-design.md`](docs/RAG-MEMORY-design.md) | Diseño de RAG del catálogo + memoria de conversación sobre Supabase (fases 3.3 / 4.0) |
| [`docs/arquitectura.html`](docs/arquitectura.html) | Diagrama de arquitectura interactivo |
| [`CLAUDE.md`](CLAUDE.md) | Contexto técnico para agentes de IA |
| [`.claude/HANDOFF-agents.md`](.claude/HANDOFF-agents.md) | Handoff de estado para agentes — qué está hecho y qué sigue |

---

<div align="center">

Privado — © 2026 Nénufar · Hecho con cariño para Shirley 🌸

</div>
