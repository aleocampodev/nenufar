# Glosario — Lenguaje ubicuo

**Proyecto:** Bot Concierge de Nénufar
**Versión:** v1 · 2026-08-18

> Un solo término por concepto, usado igual en todos los documentos y en el código.

---

## Dominio (negocio)

| Término | Definición |
|---------|------------|
| **Pieza** | Una joya del catálogo. En el código/Payload es un `product`. (Preferir "pieza" en textos de cara al cliente; `product` en código.) |
| **Variante** | Opción de una pieza (material, largo, talla). En Payload, `variant` de un `product`. |
| **Pedido** | Solicitud de compra de una o más piezas. En Payload, un `order`. |
| **Personalizado** | Pedido con requerimientos a medida (colores, texto, talla) descritos por el cliente en texto libre. |
| **Carrito** | Conjunto de piezas antes de confirmarse como pedido. En Payload, `cart`. "El carrito ES el pedido" (constitución §2.7). |
| **Consentimiento** | Autorización explícita del cliente (Ley 1581) para procesar sus datos. Gate obligatorio antes de persistir PII. |
| **Aviso** | Notificación saliente al canal de Telegram de Shirley cuando entra un pedido. |
| **Shirley** | Dueña/operadora de Nénufar; rol **admin** del bot. |

## Roles

| Término | Definición |
|---------|------------|
| **Cliente** | Cualquier usuario del bot que no sea Shirley. Resuelto por `chat.id`. |
| **Admin** | Rol de Shirley. Se otorga **solo** si `chat.id === TELEGRAM_ADMIN_CHAT_ID`. |

## Técnico

| Término | Definición |
|---------|------------|
| **Edge** | Capa de ingreso liviana y stateless (Vercel) que recibe el webhook, verifica el secret, resuelve el rol y reenvía. No corre el agente. |
| **Agente** | El `query()` del Claude Agent SDK que razona y llama tools. |
| **Orquestador** | El agente principal que, en Etapa 3, delega en subagentes. |
| **Subagente** | Agente especializado (catálogo, pedido, gestión) invocado por el orquestador (`AgentDefinition`). |
| **Tool / herramienta** | Función que el agente puede invocar (buscar productos, crear pedido). Puente validado a la Payload Local API. |
| **MCP** | Model Context Protocol; forma de exponer tools/datos al agente. En Etapa 1, in-process. |
| **RAG** | Retrieval-Augmented Generation; recupera conocimiento indexado para fundamentar respuestas (Etapa 2). |
| **pgvector** | Extensión de PostgreSQL para guardar y buscar embeddings. Base del RAG sin infra nueva. |
| **Embedding** | Representación numérica (vector) de un texto, para búsqueda por similitud. |
| **SessionStore** | Mecanismo del Agent SDK para persistir el transcript de una sesión entre reinicios. |
| **maxTurns** | Tope de vueltas del agent loop; defensa de costo y contra loops. |
| **Idempotencia** | Propiedad de que reenviar la misma acción no produzca duplicados. |
| **Rol (resolución)** | `resolveRole(chatId)` → `"cliente" | "admin"`. |
| **Spend cap** | Tope de gasto de tokens configurado en la consola de Anthropic. |

## Documentos

| Sigla | Nombre | Responde |
|-------|--------|----------|
| **BRD** | Business Requirements Document | ¿Por qué? |
| **PRD** | Product Requirements Document | ¿Qué? |
| **SDD** | Software Design Document | ¿Cómo (general)? |
| **TSD** | Technical Specification Document | ¿Cómo (exacto)? |
