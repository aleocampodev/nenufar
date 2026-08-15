# Nénufar — Tienda de Joyería Artesanal

> Plataforma de e-commerce para joyería artesanal colombiana. Pedidos sin pasarela de pago — coordinación directa por WhatsApp vía notificación a Telegram.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Stack](https://img.shields.io/badge/stack-Payload%20CMS%20%2B%20Next.js-black)
![Lenguaje](https://img.shields.io/badge/idioma-Español-blue)
![Moneda](https://img.shields.io/badge/moneda-COP-green)

---

## ¿Qué es esto?

Nénufar es la tienda online de Shirley, artesana de joyería en Cartagena, Colombia. Los compradores exploran el catálogo, arman su pedido con variantes y personalización, y al confirmar — el pedido llega estructurado al Telegram de Shirley. Sin pasarela de pago. Sin bots. Shirley cierra la venta por WhatsApp como siempre.

## Flujo de compra

```
/shop → /products/[slug] → Carrito → /pedidos/enviar → Telegram de Shirley
```

1. Comprador elige productos y variantes
2. Agrega notas de personalización (grabado, talla, instrucciones)
3. Llena nombre + WhatsApp/email + acepta consentimiento (Ley 1581)
4. Sistema crea Order en Payload + envía mensaje a Telegram
5. Shirley coordina pago y envío por WhatsApp

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 15](https://nextjs.org) App Router |
| CMS | [Payload CMS v3](https://payloadcms.com) |
| Base de datos | PostgreSQL 16 |
| UI | TailwindCSS + [shadcn/ui](https://ui.shadcn.com) |
| Tipografía | Playfair Display + Inter + Geist Mono |
| Imágenes | Sharp — WebP automático calidad 92 |
| Notificaciones | Telegram Bot API (one-way) |
| Ecommerce | `@payloadcms/plugin-ecommerce` |

## Requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (o Docker)

## Setup local

```bash
# 1. Clonar
git clone https://github.com/aleocampodev/poc_agento.git nenufar
cd nenufar

# 2. Variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección Variables)

# 3. Base de datos con Docker
docker-compose up -d

# 4. Instalar dependencias
pnpm install

# 5. Desarrollo
pnpm dev
# → http://localhost:3002
# → http://localhost:3002/admin
```

## Variables de entorno

```env
# Payload
PAYLOAD_SECRET=string-largo-aleatorio
DATABASE_URL=postgres://postgres:postgres@localhost:5433/nenufar

# URLs
NEXT_PUBLIC_SERVER_URL=http://localhost:3002

# Telegram (notificaciones de pedidos)
TELEGRAM_BOT_TOKEN=     # Obtener con @BotFather en Telegram
TELEGRAM_CHANNEL_ID=    # ID del chat/canal de Shirley

# Preview
PREVIEW_SECRET=string-para-draft-preview
```

> Ver `.env.example` para la lista completa con instrucciones.

## Comandos

```bash
pnpm dev              # Dev server (puerto 3002)
pnpm build            # Build producción
pnpm start            # Servidor producción
pnpm payload migrate  # Correr migraciones (producción)
pnpm test:int         # Tests de integración (Vitest)
pnpm test:e2e         # Tests E2E (Playwright)
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (app)/          # Frontend público
│   │   ├── shop/       # Catálogo de productos
│   │   ├── blog/       # Blog de Shirley
│   │   ├── eventos/    # Eventos y ferias
│   │   ├── pedidos/    # Flujo de pedido → Telegram
│   │   └── (account)/  # Cuenta de usuario
│   └── (payload)/      # Admin de Payload
├── collections/
│   ├── Events.ts       # Eventos de Shirley
│   ├── Media.ts        # Imágenes con conversión WebP
│   ├── Posts.ts        # Blog
│   └── Products/       # Catálogo de joyas
├── blocks/
│   └── UpcomingEvents/ # Bloque de eventos para el home
├── lib/
│   ├── telegram.ts     # Cliente Telegram
│   ├── order-formatter.ts  # Formato del mensaje de pedido
│   └── idempotency.ts  # Deduplicación de pedidos
└── docs/
    ├── BRD.md          # Business Requirements
    └── PRD.md          # Product Requirements
```

## Imágenes

Al subir una foto al admin, Payload genera automáticamente:

| Variante | Tamaño | Uso |
|----------|--------|-----|
| `thumbnail` | 400×500 WebP | Carrito, miniaturas |
| `card` | 800×1000 WebP | Grilla de productos |
| `hero` | 1920×1080 WebP | Fondo de páginas |
| `og` | 1200×630 WebP | Redes sociales / SEO |

El original nunca se modifica.

## Documentación

- [`docs/BRD.md`](docs/BRD.md) — Requisitos de negocio
- [`docs/PRD.md`](docs/PRD.md) — Requisitos del producto
- [`CLAUDE.md`](CLAUDE.md) — Contexto técnico para desarrollo con IA

## Licencia

Privado — © 2026 Nénufar. Todos los derechos reservados.
