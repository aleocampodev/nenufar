# Diagramas de Interacción e Integración (Secuencia) — Nénufar

Este documento contiene los diagramas de secuencia e interacción de componentes para:
1. **Flujo de Compra y Notificación** (Storefront Web → Telegram Channel → WhatsApp).
2. **Flujo de Gestión con IA** (Shirley ↔ Telegram ↔ Claude Agent SDK ↔ LiteLLM Proxy ↔ Groq ↔ Payload CMS).

---

## 1. Flujo de Compra y Notificación de Pedido

Muestra cómo la compradora envía su carrito en la web, cómo se persiste en PostgreSQL sin pasarela de pago y cómo Shirley recibe la notificación en su canal de Telegram.

```mermaid
sequenceDiagram
    autonumber
    actor C as Compradora (Web)
    participant F as Next.js Storefront (/pedidos/enviar)
    participant SA as Server Action (submitOrderAction)
    participant P as Payload CMS (PostgreSQL)
    participant TG as Canal Telegram (@pedidos_nenufar)
    actor S as Shirley (Dueña)
    actor WA as Compradora (WhatsApp)

    C->>F: Llena formulario (Nombre, WhatsApp, Dirección, Consentimiento Ley 1581)
    C->>SA: Clic en 'Confirmar Pedido'
    SA->>SA: Validar idempotencia (hash sha256 de carrito + contacto)
    SA->>P: payload.create('orders', { status: 'pending', items, total, ... })
    P-->>SA: Retorna Order #1042 creado
    SA->>TG: POST sendMessage (HTML formateado con datos del pedido)
    TG-->>S: Notificación en Telegram: "🌸 Nuevo pedido #1042 de María..."
    SA-->>F: Redirige a /pedidos/enviar/confirmacion?orderId=1042
    F-->>C: Muestra pantalla de éxito ("Shirley te contactará por WhatsApp")

    Note over S,WA: Cierre y coordinación manual
    S->>WA: Shirley escribe por WhatsApp: "Hola María, recibí tu pedido #1042..."
    WA->>S: Envía comprobante de pago por Nequi/Daviplata
    S->>S: Shirley confirma en Telegram Bot: 'confirmarPedido 1042'
```

---

## 2. Flujo de Consulta y Gestión del Bot de Shirley (Claude Agent SDK + LiteLLM + Groq)

Muestra cómo un mensaje de Shirley en Telegram viaja a través del SDK, se traduce por LiteLLM hacia Groq de forma gratuita y ejecuta herramientas directas sobre Payload CMS.

```mermaid
sequenceDiagram
    autonumber
    actor S as Shirley (Telegram)
    participant TG as Telegram Bot API
    participant W as Webhook (/telegram/webhook)
    participant RSA as runShirleyAgent()
    participant SDK as Claude Agent SDK (query)
    participant LLM as LiteLLM Proxy (:4000)
    participant G as Groq API (Llama 3.3 70B)
    participant T as SDK Tools (createShirleyTools)
    participant DB as Payload Local API / Postgres

    S->>TG: "pon el collar luna en 3" (chat_id: 123456)
    TG->>W: POST /telegram/webhook { update_id, message: { text, chat: { id } } }
    W->>W: Verificar secreto + chat.id == TELEGRAM_ADMIN_CHAT_ID + dedupe update_id
    
    alt chat_id != ADMIN (No es Shirley)
        W-->>TG: 200 OK (Ignorado silenciosamente)
    else es Shirley
        W->>RSA: runShirleyAgent("pon el collar luna en 3", ctx)
        RSA->>SDK: query({ prompt, mcpServers: { nenufar: tools }, model: 'nenufar-bot' })
        
        SDK->>LLM: POST /v1/messages (Anthropic API format)<br/>tools: [actualizarInventario, buscarProducto...]
        LLM->>LLM: drop_params: true (elimina parámetros no soportados por Groq)
        LLM->>G: POST /openai/v1/chat/completions (OpenAI format, model: llama-3.3-70b-versatile)
        G-->>LLM: { tool_calls: [{ name: "actualizarInventario", args: { slug: "collar-luna", stock: 3 } }] }
        LLM-->>SDK: Traduce a Anthropic tool_use
        
        SDK->>T: Invoca handler de actualizarInventario({ slug: "collar-luna", stock: 3 })
        T->>DB: payload.update({ collection: 'products', where: { slug: 'collar-luna' }, data: { stock: 3 } })
        DB-->>T: Retorna producto actualizado (stock = 3)
        T-->>SDK: Content: "Stock del Collar Luna actualizado a 3 unidades."
        
        SDK->>LLM: POST /v1/messages (con resultado de la tool)
        LLM->>G: POST /openai/v1/chat/completions
        G-->>LLM: { content: "Listo Shirley, el stock del Collar Luna quedó en 3 unidades 💜" }
        LLM-->>SDK: Traduce a Anthropic message text
        SDK-->>RSA: Retorna string de respuesta final
        RSA-->>W: reply string
        W->>TG: sendTelegramReply(chatId, "Listo Shirley, el stock del Collar Luna quedó en 3 unidades 💜")
        TG-->>S: Mensaje en Telegram: "Listo Shirley, el stock del Collar Luna quedó en 3 unidades 💜"
    end
```

---

## 3. Diagrama de Topología de Infraestructura Local (Docker)

```mermaid
flowchart TB
    subgraph Host["Máquina Local / VPS"]
        App["Next.js 15 + Payload CMS Monolito (:3002)"]
        LiteLLM["LiteLLM Proxy Container (:4000)"]
        Postgres["PostgreSQL 16 Container (:5433)"]
        
        App <-->|Local API / Drizzle| Postgres
        App <-->|Anthropic Messages API| LiteLLM
    end

    subgraph Externo["Servicios Externos"]
        Telegram["Telegram Bot API"]
        Groq["Groq API (Llama 3.3 70B - Free)"]
    end

    Telegram <-->|Webhook Inbound / Notif Outbound| App
    LiteLLM <-->|OpenAI API (GROQ_API_KEY)| Groq
```
