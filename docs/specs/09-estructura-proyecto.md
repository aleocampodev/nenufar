# Estructura del Proyecto

**Proyecto:** Bot Concierge de Nénufar
**Versión:** v1 · 2026-08-18
**Relacionado:** [SDD](./03-SDD.md), [TSD](./04-TSD.md)

---

## 1. Situación actual

Una **sola app** Next.js + Payload (sin workspaces):

```
nenufar/
  src/
    app/(app)/       # storefront: /shop, /products/[slug], /pedidos, blog, cuenta...
    app/(payload)/   # panel admin de Payload
    collections/     # Products, Posts, Pages, Categories, Events, Users, Media
    lib/             # consent · idempotency · order-formatter · telegram · constants
    ...
  docs/
```

El **bot todavía no existe**. Necesita ser un proceso **long-running** (contenedor, por el
Agent SDK) y a la vez reusar lógica de `src/lib` y datos de Payload.

## 2. Problema

- El bot vive en un **contenedor separado** del Next app.
- Debe reusar `consent`, `idempotency`, `order-formatter`, `telegram` (hoy en `src/lib`).
- Debe leer/escribir datos de Payload.

Compartir código entre dos procesos/despliegues pide una estructura de **monorepo**.

## 3. Decisión: monorepo con pnpm workspaces

```
nenufar/
  apps/
    web/            # el Next.js + Payload actual (storefront + admin)
    bot/            # servicio del Agent SDK (contenedor long-running)
  packages/
    core/           # dominio compartido: consent, idempotency, order-formatter, telegram
    payload/        # payload.config + collections + tipos generados
  docs/
    specs/          # estos documentos
```

- `@nenufar/core` — funciones puras y clientes reutilizables por `web` y `bot`.
- `@nenufar/payload` — el `payload.config` y colecciones, importable por ambos.

## 4. Acceso a datos desde el bot (corrige el SDD)

> **La Payload Local API corre en cualquier proceso Node** con el `payload.config` +
> `DATABASE_URL`. **No está atada a Next.js.**

Dos opciones:

| Opción | Cómo | Trade-off |
|--------|------|-----------|
| **A — Local API (recomendada)** | El bot importa `@nenufar/payload` y hace `getPayload({ config })` | Reusa tipos y lógica; sin hop de red. Requiere el config compartido |
| **B — REST/GraphQL** | El bot llama la API HTTP de `apps/web` | Más aislado; suma latencia + auth de servicio |

**Recomendación:** Opción A vía el paquete `@nenufar/payload`.

**Migraciones de DB:** las corre **solo `apps/web`** (un único dueño del schema). El bot es
un cliente más de la misma base; nunca corre migraciones.

## 5. Edge / runtime (aclara el SDD)

- El **webhook** (verifica secret + resuelve rol + reenvía) **no toca Payload** → puede ser
  función **serverless (Node)** o **Edge runtime** de Vercel. Cualquiera sirve.
- El trabajo pesado (Agent SDK, tools, Payload) va **siempre en el contenedor `apps/bot`**,
  nunca en el edge.

## 6. Frontend / storefront (fuera del alcance de estos specs)

El rediseño del storefront (referencia visual: **Krafti masonry** — grilla *masonry*, cards con
imagen/título/categoría/precio/"add to cart", filtros, *quick-add*, estética artesanal) vive en
`apps/web` y **merece su propio PRD + spec de diseño**. Estos documentos cubren el **bot**, no el
storefront. → *Pendiente: `docs/specs/frontend/` cuando se aborde.*

## 7. Migración a monorepo (tarea dedicada, no destructiva)

Mover `src/` a `apps/web/` es un refactor grande (paths, `tsconfig`, alias `@/…`, config de
Payload, imports). **No se hace de un saque.** Se aborda en su propia branch con estos pasos:

1. Crear `apps/web/` y mover el `src/` actual + configs (Next, Payload, Tailwind).
2. Definir `pnpm-workspace.yaml` y `packages/core`, `packages/payload`.
3. Extraer `src/lib/*` reutilizable a `@nenufar/core`; el config de Payload a `@nenufar/payload`.
4. Actualizar imports/alias y verificar `build` + tests verdes.
5. Recién entonces crear `apps/bot` consumiendo los paquetes.

> Alternativa mínima si no se quiere monorepo aún: `apps/bot` como carpeta hermana que importe
> `@nenufar/*` por path relativo, difiriendo el split formal. Menos limpio, pero desbloquea la
> Etapa 1 sin migrar todo.
