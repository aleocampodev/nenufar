# HANDOFF — Implementación del Bot Concierge (para otro agente)

> Onboarding para un agente de implementación **en frío** (OpenCode u otro). Leé esto primero,
> después los specs. No asumas contexto previo.

---

## 1. Qué se va a construir

Convertir el notificador de Telegram de Nénufar en un **bot concierge agéntico** con el
**Claude Agent SDK**. Es un proyecto con **doble objetivo**: producto útil **y aprendizaje**
(Claude API, RAG, agentes con Node). Por eso se elige la versión ambiciosa (multiagente).

## 2. Empezá leyendo (en orden)

Todo en `docs/specs/`:
1. `00-README.md` — índice + diagrama (Mermaid inline).
2. `01-BRD` → `02-PRD` → `03-SDD` → `04-TSD` — el blueprint (por qué → qué → cómo → detalle).
3. Transversales: `05-seguridad-guardrails`, `06-diseno-conversacion`, `07-evals`, `08-glosario`,
   `09-estructura-proyecto`, `10-operacion-y-costos`.
4. `frontend/` — storefront (track aparte, no bloquea el bot).

## 3. Estado del repo (IMPORTANTE)

- **Monorepo ya hecho** en branch `feature/monorepo`: la app vive en `apps/web/` (pnpm workspace).
  Verificado: `pnpm install` OK, **0 errores TS nuevos** (44 = baseline de `main`). **No se corrió
  `pnpm build` completo** (pesado; correlo una vez antes de mergear).
- **Specs** en branch `feature/bot-agentico-specs`.
- **Ambas branches están sin mergear.** Primer paso operativo: mergearlas (o trabajar sobre
  `feature/monorepo`, que ya tiene la estructura).
- `packages/core` y `packages/payload` **todavía no existen** — se extraen al construir el bot.

## 4. Reglas de trabajo (del proyecto)

- **Nunca editar `main` directo.** Siempre feature branch + worktree separado.
- Verificar `build` + tests verdes antes de mergear.
- Moneda **COP** sin decimales. Español.
- Cumplir **Ley 1581** (consentimiento explícito antes de PII).

## 5. Decisiones abiertas que DEBÉS resolver antes de codear

| # | Decisión | Recomendación del spec |
|---|----------|------------------------|
| D1 | Acceso a Payload desde el bot: **Local API con config compartido** vs **REST/GraphQL** | Opción A (Local API vía `packages/payload`) — ver `09` |
| D2 | Modelo de embeddings para RAG (Etapa 2) | **Gemini** (ya hay branch `feat/vector-indexing-gemini`, dim 768) |
| D3 | Ubicación del bot | `apps/bot` en el monorepo |
| D4 | Firmas exactas del Agent SDK | **Verificar** en code.claude.com/docs/en/agent-sdk (no inventar) |
| D5 | Hosting del bot | **Oracle Cloud Always Free — Ampere A1 (ARM)**; verificar binario del SDK en **linux/arm64** (ver SDD §7) |

## 6. Por dónde empezar: Etapa 1

Seguí `04-TSD.md` (detalla la Etapa 1). Mínimo viable:
1. Extraer `packages/core` (consent, idempotency, order-formatter, telegram) y `packages/payload`.
2. Crear `apps/bot`: entrypoint long-running + webhook + `resolveRole(chatId)`.
3. `query()` del Agent SDK con dos tools: `buscar_productos` (lectura) y `crear_pedido`
   (con gate de consentimiento + idempotencia + aviso al canal).
4. Responder por Telegram.

**Reusar** (no reescribir): `consent.ts`, `idempotency.ts`, `order-formatter.ts`, `telegram.ts`,
Payload Local API. Modelo por defecto: `claude-haiku-4-5`.

## 7. Definición de Done (Etapa 1)

Ver `10-operacion-y-costos.md §3`. En resumen: webhook con secret, rol por `chat.id`, ambas tools
end-to-end, consentimiento exigido, idempotencia, aviso conservado, evals E1–E10 (seguridad ≥ 0.95),
logs de tool calls + tokens.

## 8. No olvidar

- **Spend cap** en la consola de Anthropic antes de correr nada.
- `maxTurns` en `query()` (defensa de costo).
- El monto del pedido lo calcula el **servidor**, no el modelo (ver `05-seguridad`).
- El bot **no** corre en serverless (Agent SDK = long-running → contenedor).
