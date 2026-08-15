# Nénufar — Joyería Artesanal Colombiana

<div align="center">

**Tienda online para joyería hecha a mano en Cartagena, Colombia**

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=flat-square)](https://github.com/aleocampodev/nenufar)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload-v3-7C3AED?style=flat-square)](https://payloadcms.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Moneda](https://img.shields.io/badge/moneda-COP-green?style=flat-square)](https://github.com/aleocampodev/nenufar)

</div>

---

## Qué es

Nénufar es la tienda online de Shirley, artesana de joyería en Cartagena. Los compradores exploran el catálogo, arman su pedido con variantes y personalización, y al confirmar — el pedido llega estructurado al Telegram de Shirley. Sin pasarela de pago. Sin intermediarios. Shirley cierra la venta por WhatsApp como siempre.

## Flujo de compra

```
/shop → /products/[slug] → Carrito → /pedidos/enviar → Telegram de Shirley → WhatsApp
```

| Paso | Quién | Qué pasa |
|------|-------|----------|
| 1 | Comprador | Elige productos, variantes y agrega notas (grabado, talla) |
| 2 | Comprador | Llena nombre + WhatsApp/email + acepta Ley 1581 |
| 3 | Sistema | Crea `Order` en Payload + envía mensaje HTML a Telegram |
| 4 | Shirley | Recibe el pedido, coordina pago y envío por WhatsApp |

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 15](https://nextjs.org) App Router + TypeScript |
| CMS & API | [Payload CMS v3](https://payloadcms.com) |
| Base de datos | PostgreSQL 16 |
| UI | TailwindCSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Tipografía | Playfair Display · Inter · Geist Mono |
| Imágenes | Sharp — WebP automático calidad 92 |
| Notificaciones | Telegram Bot API (one-way) |
| Ecommerce | `@payloadcms/plugin-ecommerce` (sin Stripe) |

## Setup local

### Requisitos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL)

### Instrucciones

```bash
# 1. Clonar
git clone https://github.com/aleocampodev/nenufar.git
cd nenufar

# 2. Variables de entorno
cp .env.example .env
# Completar con tus valores (ver tabla abajo)

# 3. Base de datos
docker-compose up -d          # PostgreSQL en puerto 5433

# 4. Dependencias
pnpm install

# 5. Dev server
pnpm dev
```

Abrir → **http://localhost:3002** · Admin → **http://localhost:3002/admin**

Ir al admin → Dashboard → **"Seed database"** para cargar datos de prueba.

### Variables de entorno

```env
# Payload
PAYLOAD_SECRET=string-largo-aleatorio-min-32-chars
DATABASE_URL=postgres://postgres:postgres@localhost:5433/nenufar

# URLs
NEXT_PUBLIC_SERVER_URL=http://localhost:3002

# Telegram (notificaciones de pedidos — ver docs/setup-telegram.md)
TELEGRAM_BOT_TOKEN=       # Crear con @BotFather
TELEGRAM_CHANNEL_ID=      # ID del chat de Shirley

# Draft preview
PREVIEW_SECRET=otro-string-aleatorio
```

## Comandos

```bash
pnpm dev                  # Dev server → localhost:3002
pnpm build                # Build de producción
pnpm start                # Servidor en producción
pnpm payload migrate      # Migraciones de DB (producción)
pnpm generate:types       # Regenerar tipos de Payload
```

## Rutas del sitio

| Ruta | Descripción |
|------|-------------|
| `/` | Home (CMS page builder) |
| `/shop` | Catálogo con búsqueda y filtros |
| `/products/[slug]` | Detalle de producto con variantes |
| `/blog` | Blog de Shirley |
| `/blog/[slug]` | Artículo individual (Lexical rich text) |
| `/eventos` | Próximas ferias y eventos |
| `/pedidos/enviar` | Formulario de confirmación del pedido |
| `/pedidos/enviar/confirmacion` | Pantalla de éxito post-pedido |
| `/sobre-nenufar` | Historia de la marca |
| `/contacto` | Información de contacto |
| `/privacidad` | Política de privacidad (Ley 1581/2012) |
| `/terminos` | Términos y condiciones |
| `/(account)/` | Cuenta del usuario, pedidos, direcciones |
| `/admin` | Panel de administración (Payload) |

## Imágenes

Al subir una foto al admin, Payload genera automáticamente estas variantes en WebP (calidad 92) sin modificar el original:

| Variante | Dimensiones | Uso |
|----------|-------------|-----|
| `thumbnail` | 400 × 500 | Carrito, miniaturas |
| `card` | 800 × 1000 | Grilla de productos |
| `hero` | 1920 × 1080 | Fondos de páginas |
| `og` | 1200 × 630 | Redes sociales / SEO |

## Estructura

```
src/
├── app/
│   ├── (app)/              # Frontend público
│   │   ├── shop/           # Catálogo
│   │   ├── products/       # Detalle de producto
│   │   ├── blog/           # Blog
│   │   ├── eventos/        # Eventos
│   │   ├── pedidos/        # Flujo de pedido → Telegram
│   │   └── (account)/      # Cuenta del usuario
│   └── (payload)/          # Admin de Payload
├── collections/
│   ├── Events.ts           # Eventos y ferias
│   ├── Media.ts            # Imágenes (WebP automático)
│   ├── Posts.ts            # Blog
│   └── Products/           # Catálogo de joyas
├── blocks/
│   └── UpcomingEvents/     # Bloque de próximos eventos para el home
├── lib/
│   ├── telegram.ts         # Cliente Telegram
│   ├── order-formatter.ts  # Formato del mensaje de pedido
│   └── idempotency.ts      # Deduplicación de pedidos
└── docs/
    ├── BRD.md              # Requisitos de negocio
    └── PRD.md              # Requisitos del producto
```

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/BRD.md`](docs/BRD.md) | Requisitos de negocio |
| [`docs/PRD.md`](docs/PRD.md) | Requisitos del producto con criterios de aceptación |
| [`CLAUDE.md`](CLAUDE.md) | Contexto técnico para desarrollo asistido por IA |

## Arquitectura — decisiones clave

- **Sin pasarela de pago**: `payments.paymentMethods: []` — intencional. El cobro es manual por WhatsApp.
- **Idempotencia de pedidos**: Map en memoria (single-instance). Para multi-instancia → Vercel KV.
- **Moneda COP**: `Intl.NumberFormat('es-CO', { currency: 'COP' })` — sin decimales.
- **Color de marca**: token CSS `--brand: oklch(38% 0.2 307deg)` → clases `bg-brand`, `text-brand`, `hover:bg-brand-dark`.

---

<div align="center">

Privado — © 2026 Nénufar. Todos los derechos reservados.

</div>
