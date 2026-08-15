# 🌸 Nénufar — Joyería Artesanal Colombiana

<div align="center">

*Cada pieza cuenta una historia. Hecha a mano en Cartagena.*

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=flat-square)](https://github.com/aleocampodev/nenufar)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload-v3-7C3AED?style=flat-square)](https://payloadcms.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)

</div>

---

## ¿Qué es Nénufar?

Nénufar es la tienda online de Shirley, artesana de joyería en Cartagena, Colombia. Esta plataforma le permite mostrar su catálogo de piezas únicas hechas a mano — anillos, aretes, collares — y recibir pedidos directamente en su Telegram, sin depender de pasarelas de pago, sin comisiones, sin intermediarios.

**El flujo es simple a propósito:** el comprador elige sus piezas, agrega notas de personalización (grabado, talla, instrucciones), llena sus datos de contacto — y Shirley recibe todo organizado en Telegram. Ella cierra la venta por WhatsApp, como siempre lo ha hecho. La plataforma no reemplaza su forma de trabajar; la potencia.

## Cómo funciona un pedido

```
Catálogo → Producto → Carrito → Formulario → Telegram de Shirley → WhatsApp
```

| # | Quién | Qué pasa |
|---|-------|----------|
| 1 | Comprador | Explora el catálogo, elige variantes (material, talla) |
| 2 | Comprador | Agrega notas de personalización al carrito |
| 3 | Comprador | Llena nombre + WhatsApp o email, acepta política de datos (Ley 1581) |
| 4 | Sistema | Guarda el pedido en Payload + envía resumen a Telegram |
| 5 | Shirley | Recibe el pedido, confirma precio y coordina envío por WhatsApp |

Sin pasarela. Sin checkout complejo. Sin fricción.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 15](https://nextjs.org) App Router + TypeScript |
| CMS & API | [Payload CMS v3](https://payloadcms.com) |
| Base de datos | PostgreSQL 16 |
| UI | TailwindCSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Tipografía | Playfair Display · Inter · Geist Mono |
| Imágenes | Sharp — WebP automático calidad 92, original intacto |
| Notificaciones | Telegram Bot API (mensajes de pedidos a Shirley) |
| Ecommerce | `@payloadcms/plugin-ecommerce` (adaptado sin Stripe) |

## Setup local

### Requisitos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL)

### Instrucciones

```bash
# 1. Clonar el repo
git clone https://github.com/aleocampodev/nenufar.git
cd nenufar

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Levantar la base de datos
docker-compose up -d

# 4. Instalar dependencias
pnpm install

# 5. Arrancar el servidor de desarrollo
pnpm dev
```

**Frontend** → http://localhost:3002  
**Admin** → http://localhost:3002/admin

> En el admin, ir a Dashboard → **"Seed database"** para cargar productos y páginas de ejemplo.

### Variables de entorno

```env
# Payload
PAYLOAD_SECRET=string-largo-aleatorio-min-32-chars
DATABASE_URL=postgres://postgres:postgres@localhost:5433/nenufar

# URL pública
NEXT_PUBLIC_SERVER_URL=http://localhost:3002

# Telegram (pedidos llegan aquí)
TELEGRAM_BOT_TOKEN=       # Crear con @BotFather en Telegram
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
pnpm generate:types       # Regenerar tipos desde Payload
```

## Páginas del sitio

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero y bloques CMS |
| `/shop` | Catálogo con búsqueda y filtros |
| `/products/[slug]` | Detalle de producto con variantes |
| `/blog` | Blog de Shirley |
| `/blog/[slug]` | Artículo con rich text y fotos |
| `/eventos` | Próximas ferias y eventos |
| `/pedidos/enviar` | Formulario de pedido |
| `/pedidos/enviar/confirmacion` | Confirmación post-pedido |
| `/sobre-nenufar` | Historia de la marca |
| `/contacto` | Información de contacto |
| `/privacidad` | Política de privacidad (Ley 1581/2012) |
| `/terminos` | Términos y condiciones |
| `/(account)/` | Cuenta del usuario, pedidos, direcciones |
| `/admin` | Panel de administración (Payload CMS) |

## Imágenes

Al subir una foto al admin, Payload genera automáticamente variantes en WebP (calidad 92) **sin tocar el original**:

| Variante | Dimensiones | Uso |
|----------|-------------|-----|
| `thumbnail` | 400 × 500 | Carrito, miniaturas |
| `card` | 800 × 1000 | Grilla de productos |
| `hero` | 1920 × 1080 | Fondos de páginas |
| `og` | 1200 × 630 | Redes sociales y SEO |

## Estructura del proyecto

```
src/
├── app/
│   ├── (app)/              # Frontend público (Next.js App Router)
│   │   ├── shop/           # Catálogo de joyas
│   │   ├── products/       # Detalle de producto
│   │   ├── blog/           # Blog
│   │   ├── eventos/        # Eventos y ferias
│   │   ├── pedidos/        # Flujo de pedido → Telegram
│   │   └── (account)/      # Cuenta del usuario
│   └── (payload)/          # Admin de Payload
├── collections/
│   ├── Events.ts           # Eventos y ferias de Shirley
│   ├── Media.ts            # Imágenes con WebP automático
│   ├── Posts.ts            # Blog
│   └── Products/           # Catálogo de joyas
├── blocks/
│   └── UpcomingEvents/     # Bloque de próximos eventos (home)
└── lib/
    ├── telegram.ts         # Envío de pedidos a Telegram
    ├── order-formatter.ts  # Formato del mensaje HTML
    └── idempotency.ts      # Deduplicación de pedidos
```

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/BRD.md`](docs/BRD.md) | Requisitos de negocio (qué necesita Shirley) |
| [`docs/PRD.md`](docs/PRD.md) | Requisitos del producto con criterios de aceptación |
| [`CLAUDE.md`](CLAUDE.md) | Contexto técnico para desarrollo asistido por IA |

## Decisiones de diseño

- **Sin pasarela de pago** — intencional. El cobro es manual, como Shirley siempre lo ha manejado. Agregar Stripe agregaría fricción y comisiones innecesarias para su volumen actual.
- **Telegram como notificación** — no es un bot interactivo. Solo recibe el pedido organizado. Shirley responde por WhatsApp donde ya tiene a sus clientes.
- **COP sin decimales** — `Intl.NumberFormat('es-CO', { currency: 'COP' })`. Los pesos colombianos no usan centavos.
- **WebP en el servidor** — Sharp convierte al subir. El original nunca se toca; las variantes se sirven según el contexto.

---

<div align="center">

Privado — © 2026 Nénufar · Hecho con cariño para Shirley 🌸

</div>
