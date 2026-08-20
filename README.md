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

A partir de la v3.2 se suma un **bot asistente de Telegram con agentes IA**: la compradora puede escribirle al bot para consultar el catálogo o pedir que Shirley la contacte — todo con Groq (free tier), sin costo de infraestructura.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CANALES          APLICACIÓN             AGENTES IA         EXTERNOS    │
│                                                                         │
│  ┌───────────┐    ┌──────────────┐   ┌──────────────────┐              │
│  │  Web /    │───▶│ Next.js +    │──▶│   Orquestador    │──▶ Groq      │
│  │  Tienda   │    │ Payload CMS  │   │ (clasifica req.) │              │
│  └───────────┘    │              │   └──────┬─────┬─────┘              │
│                   │  /pedidos    │          │     │                    │
│                   │  /shop       │   ┌──────▼─┐ ┌─▼──────────┐        │
│  ┌───────────┐    │  /admin      │   │ Catálogo│ │Conversación│        │
│  │ Telegram  │    └──────────────┘   │ Agent  │ │  Agent     │        │
│  │ comprad.  │          │            │buscarPr.│ │derivarShir.│        │
│  └─────┬─────┘          │            └────┬───┘ └────┬───────┘        │
│        │                │                 │           │               │
│        │    ┌───────────▼──────┐    ┌─────▼──────┐   │               │
│        └───▶│ /telegram/webhook│    │ PostgreSQL │   ▼               │
│             │ POST · secret     │    │ products   │  Canal pedidos    │
│             │ dedup · routeAnd  │    │ orders     │  (Shirley lee)    │
│             └──────────────────┘    └────────────┘                   │
│                      │                                                 │
│                      └─────────────────────────────▶ Bot Asistente    │
│                                    REPLY (dashed)    (responde a comp.)│
└─────────────────────────────────────────────────────────────────────────┘

  FUTURO (Fase 3.3): Supabase pgvector + embeddings locales (Transformers.js)
  buscarProductos → búsqueda semántica sobre el catálogo
```

**Diagrama interactivo:** [`docs/arquitectura.html`](docs/arquitectura.html) — ver en browser para los colores.

### Flujo de pedido (core del negocio)

| Paso | Actor | Qué pasa |
|------|-------|----------|
| 1 | Compradora | Explora el catálogo, elige variantes (material, talla) |
| 2 | Compradora | Agrega notas de personalización al carrito |
| 3 | Compradora | Llena nombre + WhatsApp/email, acepta política Ley 1581 |
| 4 | Sistema | Guarda el pedido en Payload + envía mensaje estructurado a Telegram |
| 5 | Shirley | Lee el pedido, confirma precio y coordina envío por WhatsApp |

### Flujo del bot asistente (v3.2)

| Paso | Actor | Qué pasa |
|------|-------|----------|
| 1 | Compradora | Escribe al bot: "¿tienen aretes de plata?" |
| 2 | Webhook | Recibe POST, valida secreto, deduplica por `update_id` |
| 3 | Orquestador | Llama a Groq con temperatura=0, clasifica → `catalogo` |
| 4 | Agente Catálogo | Ejecuta skill `buscarProductos` → `payload.find(products)` |
| 5 | Bot Asistente | Responde a la compradora con piezas reales y precios COP |

**Guardarraíl:** si la compradora quiere comprar o personalizar, el Agente Conversación ejecuta `derivarAShirley` — notifica al canal de Shirley y le dice a la compradora que Shirley la va a contactar. El bot **nunca cobra, nunca cierra la venta**.

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
| Bot Telegram | Telegram Bot API | Dos bots: pedidos (one-way) + asistente (two-way) |
| Tests | Vitest + Playwright | Int + E2E |

---

## Inicio rápido

### Requisitos previos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL local)
- Cuenta en [console.groq.com](https://console.groq.com) (gratis) para el bot asistente

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

# ── Bot asistente (agentes IA, v3.2) ─────────────────────
# Otro bot diferente, también de @BotFather
TELEGRAM_ASSISTANT_BOT_TOKEN=123456:ABC-otro-token
# String aleatorio: openssl rand -hex 24
TELEGRAM_WEBHOOK_SECRET=tu-secreto-largo
# Gratis en console.groq.com
GROQ_API_KEY=gsk_tu_api_key
# GROQ_MODEL=llama-3.3-70b-versatile   # opcional

# ── Otros ───────────────────────────────────────────────
PREVIEW_SECRET=otro-string-aleatorio
```

### Activar el bot asistente

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

Ahora escríbele al bot asistente en Telegram y el sistema responderá.

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

# Webhook del bot asistente
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
| `/telegram/webhook` | Webhook del bot asistente (POST) |

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
│   │   ├── telegram/webhook/       # Webhook del bot asistente ← NUEVO
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

**Dos bots de Telegram separados** — el bot de pedidos (`TELEGRAM_BOT_TOKEN`) es de solo lectura para Shirley. El bot asistente (`TELEGRAM_ASSISTANT_BOT_TOKEN`) recibe mensajes de compradoras vía webhook. Mantenerlos separados asegura que el flujo de pedidos nunca se interrumpa.

**Agentes que asisten, no que venden** — los agentes IA están diseñados para responder preguntas y hacer handoff a Shirley. Nunca confirman precios, cierran ventas ni procesan pagos. La autonomía la tiene Shirley.

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
| [`docs/arquitectura.html`](docs/arquitectura.html) | Diagrama de arquitectura interactivo |
| [`CLAUDE.md`](CLAUDE.md) | Contexto técnico para agentes de IA |
| [`.claude/HANDOFF-agents.md`](.claude/HANDOFF-agents.md) | Handoff de estado para agentes — qué está hecho y qué sigue |

---

<div align="center">

Privado — © 2026 Nénufar · Hecho con cariño para Shirley 🌸

</div>
