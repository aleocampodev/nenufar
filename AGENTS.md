# Nénufar — Contexto para agentes

Tienda de joyería artesanal colombiana (Shirley, Cartagena).
Stack: **Payload CMS v3 + Next.js App Router + PostgreSQL + TailwindCSS + shadcn/ui**.
Basado en `@payloadcms/plugin-ecommerce`. **Sin pasarela de pago**: el comprador llena un formulario → se envía un mensaje a Telegram → Shirley coordina pago y envío manualmente.

> La documentación completa está en `CLAUDE.md` (misma raíz). Este archivo es el índice para OpenCode.

## Flujo de pedido (core del negocio)
```
/shop → /products/[slug] → carrito → /pedidos/enviar → Telegram + Payload Order → /pedidos/enviar/confirmacion
```
Archivos clave:
- `src/app/(app)/pedidos/enviar/OrderForm.tsx` — formulario
- `src/app/(app)/pedidos/enviar/submitOrderAction.ts` — server action (valida, crea Order, envía a Telegram)
- `src/lib/telegram.ts` — cliente Telegram (real)
- `src/lib/order-formatter.ts` — formatea el mensaje HTML

## Comandos
```bash
docker-compose up -d    # PostgreSQL en :5433
pnpm dev                # dev server en :3002 (NO 3000)
pnpm build              # build producción (payload build)
pnpm generate:types     # regenera tipos de Payload
pnpm lint               # eslint
pnpm payload migrate    # migraciones en producción
```

## Reglas para agentes
- El dev server es el puerto **3002**, no 3000.
- **Errores TS pre-existentes** (no son regresiones): `slug` en tipos generados, `paymentMethod` en seed. No tocar sin entender el sistema de tipos del plugin.
- Sin Stripe: `payments.paymentMethods: []` es intencional.
- Moneda COP sin decimales: `Intl.NumberFormat('es-CO', { currency: 'COP' })`.
- Color de marca: violeta `#6A1B9A` = token `--brand`. Usar clases `bg-brand`, `text-brand`, `hover:bg-brand-dark`.
- Subir contenido (productos, fotos, blog) se hace desde `/admin` (panel de Payload), no por Telegram.

## Env requeridas (ver `.env.example`)
`PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`
