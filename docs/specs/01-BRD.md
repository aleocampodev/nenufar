# BRD — Business Requirements Document

**Proyecto:** Bot Concierge de Nénufar
**Versión:** v1 · 2026-08-18
**Estado:** Borrador

---

## 1. Contexto de negocio

Nénufar es una tienda de **joyería artesanal colombiana** de Shirley (Cartagena).
El sitio (Payload CMS v3 + Next.js) **no tiene pasarela de pago online**: el comprador
llena un formulario → llega una notificación a un canal de Telegram → Shirley coordina
pago y envío **a mano por WhatsApp**.

Hoy el bot de Telegram es **unidireccional** (solo notifica). Toda la conversación y la
gestión de pedidos recae en Shirley manualmente.

## 2. Problema / oportunidad

- Los clientes no tienen forma de **preguntar** (precios, disponibilidad, cuidados,
  personalizaciones) sin que Shirley responda una por una.
- Shirley gestiona pedidos y estados **sin asistencia**: consulta, redacta, coordina.
- El fundador quiere **aprender** desarrollo de agentes de IA (Claude API, RAG, agentes
  con Node) con un caso real y acotado.

Oportunidad: un **único bot conversacional** en Telegram que atienda a clientes y asista a
Shirley, construido de forma incremental como proyecto de aprendizaje.

## 3. Objetivos de negocio

| # | Objetivo | Métrica de éxito |
|---|----------|------------------|
| O1 | Que el cliente resuelva dudas sin intervención manual | % de conversaciones que terminan sin que Shirley intervenga |
| O2 | Acelerar la toma de pedidos | Pedidos creados vía bot / total |
| O3 | Asistir a Shirley en la gestión | Tiempo de respuesta a pedidos pendientes |
| O4 | **Aprendizaje** del fundador | Completar las 3 etapas (agente → RAG → multiagente) funcionando |

> **Nota:** O4 es un objetivo de primera clase. Por eso se elige una arquitectura ambiciosa
> (Agent SDK + subagentes) aunque para el volumen actual sería técnicamente overkill.

## 4. Stakeholders

| Rol | Persona | Interés |
|-----|---------|---------|
| Dueña / operadora | **Shirley** | Vender, coordinar, no perder el toque personal |
| Cliente final | Compradores | Consultar y pedir piezas de forma simple |
| Fundador / desarrollador | (aprendiz) | Construir el bot y **aprender** agentes de IA |

## 5. Alcance (nivel negocio)

**Dentro:**
- Un bot de Telegram con dos roles: cliente y Shirley (admin).
- Consultas de catálogo, toma de pedidos, y asistencia de gestión.
- Base de conocimiento (cuidados, materiales, políticas) — Etapa 2.

**Fuera:**
- Pago online / pasarela (sigue siendo manual, por diseño del negocio).
- Otros canales (WhatsApp Business API, Instagram) — posible futuro.
- Logística / envíos automatizados.

## 6. Restricciones y supuestos

- **Privacidad (Ley 1581/2012, Colombia):** todo dato personal del cliente requiere
  **consentimiento explícito** antes de enviarse/persistirse. Ya implementado en el flujo web.
- **Costo:** infraestructura tan cercana a **$0** como sea posible (planes free); el gasto
  real son los **tokens** del modelo, que se acota con un *spend cap* y modelos baratos.
- **Sin reescribir el negocio:** el bot reusa el catálogo, pedidos y datos existentes de Payload.
- **Un solo bot:** se descarta tener bots separados por audiencia.

## 7. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Costo de tokens se dispara (subagentes ~15×) | Medio | Spend cap, modelos baratos (Haiku), `maxTurns`, fan-out en lotes |
| El agente da información incorrecta | Alto (marca) | RAG con grounding (Etapa 2); tools de solo lectura validadas |
| Fuga de datos personales | Alto (legal) | Gate de consentimiento; escritura solo vía tools validadas |
| Complejidad operativa (contenedor) | Medio | Empezar local; contenedor barato; observabilidad OTEL |

## 8. Criterio de éxito global

El proyecto es exitoso si: (a) un cliente puede consultar y armar un pedido por Telegram,
(b) Shirley puede gestionar desde el mismo bot, y (c) el fundador completó y entiende las
tres etapas (agente, RAG, multiagente).
