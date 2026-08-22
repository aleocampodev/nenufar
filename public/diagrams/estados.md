# Diagramas de Estado (State Machines) — Nénufar

Este documento detalla las máquinas de estado finitas para los dos ciclos de vida fundamentales de Nénufar:
1. **Ciclo de Vida del Pedido (`Order`)** — Estado del negocio y del dinero.
2. **Ciclo de Vida del Bot de Gestión (`Claude Agent SDK Runtime`)** — Estado del bucle de inferencia y herramientas.

---

## 1. Máquina de Estados del Pedido (`Order`)

Muestra cómo evoluciona una orden desde que la clienta agrega piezas al carrito hasta su entrega final.

```mermaid
stateDiagram-v2
    [*] --> Carrito: Clienta añade joyas en /shop
    Carrito --> Formulario: Pasa a /pedidos/enviar
    
    state "Pendiente (pending)" as Pending {
        [*] --> GuardadoDB: submitOrderAction crea Order en Payload
        GuardadoDB --> NotificadoTelegram: Envía HTML a @pedidos_nenufar
        NotificadoTelegram --> ContactoWhatsApp: Shirley abre chat con la clienta
    }
    
    Formulario --> Pending: Envío de pedido (Submit)
    
    Pending --> Confirmed: Pago recibido (Nequi/Daviplata)\nShirley usa bot: 'confirmarPedido' o /admin
    Pending --> Cancelled: No responde / Desiste / Sin stock
    
    state "Confirmado (confirmed)" as Confirmed {
        [*] --> Empaque: Shirley alista la joya y empaque de regalo
    }
    
    Confirmed --> Shipped: Paquete despachado (Transportadora)\nShirley usa bot: 'marcarEnviado' o /admin
    Confirmed --> Cancelled: Reembolso solicitado antes de despacho
    
    state "Enviado (shipped)" as Shipped {
        [*] --> GuiaEnviada: Guía compartida por WhatsApp
        GuiaEnviada --> Entregado: Paquete recibido por la clienta
    }
    
    Shipped --> [*]: Venta completada exitosamente
    Cancelled --> [*]: Pedido cerrado sin venta
```

### Reglas de Transición del Pedido:
* `pending` → `confirmed`: Solo Shirley puede confirmar una vez verificado el comprobante de pago en su banco o Nequi.
* `confirmed` → `shipped`: Ocurre cuando Shirley entrega el paquete a la transportadora (Interrapidísimo, Envía, etc.) y genera la guía de rastreo.
* `cancelled`: Puede ocurrir en cualquier punto antes del despacho físico.

---

## 2. Máquina de Estados del Bot de Gestión (Claude Agent SDK)

Muestra el procesamiento de cada mensaje entrante en `POST /telegram/webhook`.

```mermaid
stateDiagram-v2
    [*] --> POSTRecibido: POST /telegram/webhook (Update JSON)
    
    state "Validación & Autenticación" as Auth {
        POSTRecibido --> ValidarSecreto: Comprobar X-Telegram-Bot-Api-Secret-Token
        ValidarSecreto --> Retornar403: Secreto incorrecto
        ValidarSecreto --> ValidarChatId: Secreto válido
        ValidarChatId --> Ignorar200: chat_id != TELEGRAM_ADMIN_CHAT_ID (No es Shirley)
        ValidarChatId --> ValidarDedupe: chat_id == Shirley
        ValidarDedupe --> IgnorarDedupe200: update_id ya visto en memoria (Set 1000)
        ValidarDedupe --> IniciarAgente: Mensaje autorizado y nuevo
    }
    
    state "Bucle Claude Agent SDK" as SDKLoop {
        IniciarAgente --> MontarToolsMCP: createSdkMcpServer([buscarProducto, pedidosPendientes...])
        MontarToolsMCP --> QuerySDK: query({ prompt, model: 'nenufar-bot' })
        
        state "Bridge LiteLLM & Groq" as Bridge {
            QuerySDK --> ProxyLiteLLM: HTTP :4000 (Anthropic Messages API)
            ProxyLiteLLM --> GroqLlama: HTTP (OpenAI API, drop_params: true)
            GroqLlama --> EvaluarPaso: ¿Tool Call o Respuesta Final?
        }
        
        EvaluarPaso --> EjecutarToolPayload: Modelo solicita ejecutar Tool
        EjecutarToolPayload --> LocalAPI: payload.find() / payload.update()
        LocalAPI --> InyectarObservacion: Datos reales de PostgreSQL
        InyectarObservacion --> QuerySDK: Continúa el bucle (max 4 turnos)
        
        EvaluarPaso --> GenerarTextoFinal: Respuesta final lista
    }
    
    GenerarTextoFinal --> EnviarTelegram: sendTelegramReply(chatId, reply)
    EnviarTelegram --> [*]: 200 OK
    Retornar403 --> [*]: 403 Forbidden
    Ignorar200 --> [*]: 200 OK (Silencioso)
    IgnorarDedupe200 --> [*]: 200 OK (Silencioso)
```
