# Nénufar — Contexto para agentes (OpenCode)

Tienda de joyería artesanal colombiana (Shirley, Cartagena).
Stack: **Payload CMS v3 + Next.js App Router + PostgreSQL + TailwindCSS + shadcn/ui**.
Basado en `@payloadcms/plugin-ecommerce`. **Sin pasarela de pago**: el comprador llena un formulario → se envía un mensaje a Telegram → Shirley coordina pago y envío manualmente.

> Monorepo **pnpm**. La app (storefront + admin) vive en `apps/web/`. El bot agéntico irá en `apps/bot/` (a crear). Doc completa del negocio en `CLAUDE.md`.

## 🎯 Proyecto actual: Bot Concierge (agéntico, Claude Agent SDK)

**Empezá leyendo `docs/specs/HANDOFF.md`** — es el on-ramp: qué construir, estado de ramas, decisiones abiertas y por dónde arrancar. Los specs completos están en `docs/specs/`.

Leé con tu Read tool **según necesidad** (no todo de una):
- `docs/specs/HANDOFF.md` — arranque y decisiones (D1–D5).
- `docs/specs/04-TSD.md` — detalle técnico de la **Etapa 1** (lo primero a construir).
- `docs/specs/03-SDD.md` — arquitectura y modelos de datos.
- `docs/specs/05-seguridad-guardrails.md` — reglas de seguridad (leer antes de tocar `crear_pedido`).
- `docs/specs/09-estructura-proyecto.md` — monorepo y acceso a Payload.
- `docs/specs/10-operacion-y-costos.md` — Definición de Done por etapa.

### Subagentes disponibles
- `@tools-builder` — implementa el bot y sus tools siguiendo el TSD.
- `@reviewer` — revisa contra la Definición de Done + seguridad + evals (no edita).

## Flujo de pedido actual (core del negocio)
```
/shop → /products/[slug] → carrito → /pedidos/enviar → Telegram + Payload Order → /confirmacion
```
Archivos clave (en `apps/web/`):
- `apps/web/src/app/(app)/pedidos/enviar/OrderForm.tsx` — formulario
- `apps/web/src/app/(app)/pedidos/enviar/submitOrderAction.ts` — server action (valida, crea Order, envía a Telegram)
- `apps/web/src/lib/telegram.ts` — cliente Telegram (real)
- `apps/web/src/lib/order-formatter.ts` — formatea el mensaje HTML
- `apps/web/src/lib/consent.ts`, `apps/web/src/lib/idempotency.ts` — a extraer a `packages/core`

## Comandos (desde la raíz del monorepo)
```bash
docker-compose up -d    # PostgreSQL en :5433
pnpm dev                # dev server de web en :3002 (NO 3000) — delega a --filter web
pnpm build              # build producción (payload build)
pnpm generate:types     # regenera tipos de Payload
pnpm lint               # eslint
```

## Reglas para agentes
- **Nunca editar `main` directo.** Feature branch + worktree separado. Verificar build/tests antes de mergear.
- El dev server es el puerto **3002**, no 3000.
- **Errores TS pre-existentes** (44, no son regresiones): `slug` en tipos generados, `paymentMethod` en seed. No tocar sin entender el sistema de tipos del plugin.
- Sin Stripe: `payments.paymentMethods: []` es intencional.
- Moneda **COP** sin decimales: `Intl.NumberFormat('es-CO', { currency: 'COP' })`.
- Color de marca: violeta `#6A1B9A` = token `--brand` (`bg-brand`, `text-brand`, `hover:bg-brand-dark`).
- **Bot:** el monto del pedido lo calcula el **servidor**, nunca el modelo. Consentimiento (Ley 1581) antes de PII. Idempotencia siempre. Verificar firmas del Agent SDK contra la doc (no inventar).

## Env requeridas (ver `apps/web/.env.example`)
`PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`
Para el bot además: `ANTHROPIC_API_KEY`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`.
