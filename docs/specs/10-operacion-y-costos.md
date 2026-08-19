# Operación, Costos y Release

**Proyecto:** Bot Concierge de Nénufar
**Versión:** v1 · 2026-08-18
**Relacionado:** [SDD](./03-SDD.md), [Seguridad](./05-seguridad-guardrails.md), [Evals](./07-evals.md)

---

## 1. Presupuesto de tokens (estimación)

> Estimaciones, no medidas. Confirmar con telemetría real (§2). Precios de referencia:
> **Haiku 4.5** ≈ $1 / 1M input · $5 / 1M output. Sonnet ≈ $3 / $15. (Verificar tarifas vigentes.)

**Conversación de cliente típica (Etapa 1, Haiku):**

| Concepto | Estimación |
|----------|------------|
| Turnos por conversación | 5–8 |
| Input acumulado (historial + prompt + tools) | ~25–35K tokens |
| Output total | ~2–4K tokens |
| **Costo por conversación** | **~$0.03–0.05** (con prompt caching, menos) |

**Proyección mensual:**

| Volumen | Costo aprox. |
|---------|--------------|
| 100 conversaciones/mes | ~$3–5 |
| 500 conversaciones/mes | ~$15–25 |

**Etapa 3 (multiagente):** las tareas de fan-out de Shirley multiplican tokens (~15×), pero son
**esporádicas y disparadas por ella**, no en cada chat. Acotar con `maxTurns` y lotes chicos.

**Controles de costo:** spend cap en la consola de Anthropic · Haiku por defecto · prompt
caching del system prompt · `maxTurns` · rate-limit por chat.

## 2. Observabilidad

Registrar **por turno** (sin PII en texto plano):

| Señal | Detalle |
|-------|---------|
| Tool calls | qué tool, args (sanitizados), resultado ok/error, duración |
| Tokens | input / output / cache por turno |
| Latencia | tiempo total del turno |
| Errores | tipo, dónde, stack (sin datos personales) |
| Rol | cliente / admin (para segmentar) |

- **Dev:** logs estructurados.
- **Prod (contenedor):** exportar **OTEL** (traces/métricas/logs) a un colector.
- Alertas sobre: tasa de error, gasto por hora, loops que tocan `maxTurns`.

## 3. Definición de "Done" por etapa

**Etapa 1 — Agente + tools**
- [ ] Webhook con secret verificado; rol resuelto por `chat.id`.
- [ ] `buscar_productos` y `crear_pedido` funcionando end-to-end.
- [ ] Consentimiento (Ley 1581) exigido antes de crear pedido.
- [ ] Idempotencia verificada (reenvío no duplica).
- [ ] Aviso al canal de Shirley conservado.
- [ ] Set de evals E1–E10 corriendo, seguridad ≥ 0.95.
- [ ] Logs de tool calls + tokens.

**Etapa 2 — RAG**
- [ ] Ingesta/indexado de conocimiento (pgvector) desde Payload.
- [ ] `buscar_conocimiento` responde con fundamento y cita fuente.
- [ ] Evals de *groundedness* (no alucina sin contexto).

**Etapa 3 — Multiagente**
- [ ] Orquestador delega en subagentes correctos.
- [ ] Fan-out en lotes; sin pegar rate limits.
- [ ] Tools admin (`cambiar_estado`, `resumen_dia`, etc.) operativas.

## 4. Release y rollback

**Convivencia con el bot actual.** El notificador de una vía de hoy (`submitOrderAction` →
Telegram) **sigue funcionando**. El nuevo bot es **aditivo**: se activa registrando el webhook
del bot conversacional. No se toca el flujo web existente.

**Estrategia de rollout (Etapa 1):**
1. Desplegar `apps/bot` (contenedor) y el edge webhook, apuntando a un bot de Telegram de
   **prueba** primero.
2. Validar con las evals + pruebas manuales (Shirley y un cliente de prueba).
3. Cambiar el `setWebhook` al bot de producción.

**Rollback:** `deleteWebhook` (o apuntarlo de nuevo al de prueba) → el bot conversacional deja
de recibir; el flujo web + notificación siguen intactos. Cero pérdida de datos (los pedidos ya
creados quedan en Payload).

**Feature flag opcional:** una variable para deshabilitar `crear_pedido` (dejar el bot en modo
solo-consulta) si algo se comporta mal en producción.
