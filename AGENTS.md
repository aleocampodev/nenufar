# Nénufar — Contexto para agentes

> 🏛️ **CONSTITUCIÓN Y REGLAS CANÓNICAS:** Consulta [`CONSTITUTION.md`](./CONSTITUTION.md) para los 7 Artículos Fundamentales que rigen todo el desarrollo (Git, política $0/mes, seguridad, arquitectura y estándares).

Tienda de joyería artesanal colombiana (Shirley, Cartagena).
Stack: **Payload CMS v3 + Next.js App Router + PostgreSQL + TailwindCSS + shadcn/ui**.
Basado en `@payloadcms/plugin-ecommerce`. **Sin pasarela de pago**: el comprador llena un formulario → se envía un mensaje a Telegram → Shirley coordina pago y envío manualmente.

> La documentación completa de arquitectura está en `CLAUDE.md` y `docs/specs/`. Este archivo es el índice rápido para agentes.

## Flujo de pedido (core del negocio)
```
/shop → /products/[slug] → carrito → /pedidos/enviar → Telegram + Payload Order → /pedidos/enviar/confirmacion
```
Archivos clave:
- `src/app/(app)/pedidos/enviar/OrderForm.tsx` — formulario
- `src/app/(app)/pedidos/enviar/submitOrderAction.ts` — server action (valida, crea Order, envía a Telegram)
- `src/lib/telegram.ts` — cliente Telegram (real)
- `src/lib/order-formatter.ts` — formatea el mensaje HTML

## Bot de gestión de Shirley (v3.2 — solo Shirley)
El mismo `TELEGRAM_BOT_TOKEN` también recibe mensajes vía webhook, pero **solo de Shirley** (auth por `TELEGRAM_ADMIN_CHAT_ID`). Es su herramienta para operar la tienda desde Telegram (ver pedidos, confirmar, actualizar stock). **Las compradoras NO le escriben al bot** — su recorrido es 100% web.
```
Shirley escribe → POST /telegram/webhook → chat_id==ADMIN? → orquestador (Groq) → skill sobre Payload → responde a Shirley
```
Archivos: `src/lib/groq.ts`, `src/lib/agents/*`, `src/app/(app)/telegram/webhook/route.ts`. Ver `docs/SDD.md §2.3` y `.claude/HANDOFF-agents.md`.

> **Migración en curso (leer antes de tocar el bot):** el orquestador hecho a mano se va a reemplazar por el **Claude Agent SDK** corriendo free sobre **Groq vía LiteLLM**. Plan completo y accionable en [`docs/HANDOFF-agent-sdk-migration.md`](docs/HANDOFF-agent-sdk-migration.md).

## Comandos
```bash
docker-compose up -d    # PostgreSQL en :5433
pnpm dev                # dev server en :3002 (NO 3000)
pnpm build              # build producción (payload build)
pnpm generate:types     # regenera tipos de Payload
pnpm lint               # eslint
pnpm payload migrate    # migraciones en producción
pnpm tsx scripts/set-telegram-webhook.ts <url>   # registrar webhook del bot
```

## Reglas para agentes
- El dev server es el puerto **3002**, no 3000.
- **Errores TS pre-existentes** (no son regresiones): `slug` en tipos generados, `paymentMethod` en seed. No tocar sin entender el sistema de tipos del plugin.
- Sin Stripe: `payments.paymentMethods: []` es intencional.
- Moneda COP sin decimales: `Intl.NumberFormat('es-CO', { currency: 'COP' })`.
- Color de marca: violeta `#6A1B9A` = token `--brand`. Usar clases `bg-brand`, `text-brand`, `hover:bg-brand-dark`.
- Subir contenido (productos, fotos, blog) se hace desde `/admin` (panel de Payload). El bot de gestión (v3.2) irá cubriendo tareas puntuales por Telegram (stock, confirmar pedidos), pero el admin sigue siendo la fuente principal.
- El bot de Telegram es **solo de Shirley**. No hay canal conversacional para compradoras ni widget de chat en la web (sin Chat SDK / Vercel AI SDK).

## Env requeridas (ver `.env.example`)
`PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `GROQ_API_KEY`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ADMIN_CHAT_ID`
