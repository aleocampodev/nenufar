# Nénufar — Claude Code Context

## Qué es este proyecto

Tienda de joyería artesanal colombiana de Shirley (Cartagena). Stack: **Payload CMS v3 + Next.js App Router + PostgreSQL + TailwindCSS + shadcn/ui**.

Basado en el template `@payloadcms/plugin-ecommerce`. El flujo de compra es **sin pasarela de pago online**: el comprador llena un formulario → se envía un mensaje a Telegram con el detalle del pedido → Shirley coordina pago y envío manualmente.

## Flujo de pedido (core del negocio)

```
/shop → /products/[slug] → carrito → /pedidos/enviar → Telegram + Payload Order → /pedidos/enviar/confirmacion
```

- `src/app/(app)/pedidos/enviar/OrderForm.tsx` — formulario (nombre, contacto, nota, consentimiento)
- `src/app/(app)/pedidos/enviar/submitOrderAction.ts` — server action: valida, crea Order en Payload, envía a Telegram
- `src/lib/telegram.ts` — cliente Telegram (real, no stub)
- `src/lib/order-formatter.ts` — formatea el mensaje HTML para Telegram

## Configuración requerida

Variables de entorno mínimas (ver `.env.example`):

```
PAYLOAD_SECRET=         # secreto de Payload
DATABASE_URL=           # PostgreSQL (docker-compose da postgres en :5433)
NEXT_PUBLIC_SERVER_URL= # URL pública (ej: http://localhost:3002)
TELEGRAM_BOT_TOKEN=     # token del bot de Telegram (BotFather)
TELEGRAM_CHANNEL_ID=    # ID del canal Telegram (@nombre o -100xxxxxxxx)
```

## Comandos clave

```bash
docker-compose up -d    # levanta PostgreSQL en puerto 5433
pnpm dev                # dev server en puerto 3002 (no 3000)
pnpm build              # build producción (incluye payload build)
pnpm payload migrate    # corre migraciones en producción
```

Para seedear datos de prueba: ir a `/admin` → "Seed database" en el dashboard.

## Estructura de rutas frontend

```
/                    → home (CMS page builder, slug: 'home')
/shop                → catálogo con búsqueda y filtros
/products/[slug]     → detalle de producto con variantes
/blog                → listado de artículos
/blog/[slug]         → artículo individual (Lexical rich text)
/pedidos/enviar      → formulario de confirmación de pedido
/pedidos/enviar/confirmacion → pantalla de éxito post-pedido
/sobre-nenufar       → historia de la marca (estático)
/contacto            → info de contacto (estático)
/privacidad          → política de privacidad (Ley 1581/2012)
/terminos            → términos y condiciones
/eventos             → próximos eventos
/find-order          → buscar pedido por ID + email (invitados)
/(account)/          → cuenta de usuario, pedidos, direcciones
```

## Color de marca

El violeta Nénufar (`#6A1B9A`) está formalizado como token CSS:
- `bg-brand` / `text-brand` / `hover:bg-brand-dark`
- Definido en `globals.css` como `--brand: oklch(38% 0.2 307deg)`

## Notas de arquitectura

- **Sin Stripe**: comentado intencionalmente. `payments.paymentMethods: []` en el plugin.
- **Idempotencia**: in-memory Map (single-instance). Para multi-instancia → Vercel KV.
- **Moneda**: COP, sin decimales. `Intl.NumberFormat('es-CO', { currency: 'COP' })`.
- **Campos de comprador**: `buyerName` y `buyerContact` se guardan en `order.shippingAddress.firstName` y `.phone` (hack temporal, Fase 6 agrega campos propios).
- **Telegram splitting**: mensajes > 4000 chars no se parten (gap documentado).
