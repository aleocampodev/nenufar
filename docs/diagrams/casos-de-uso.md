# Diagramas de Casos de Uso — Nénufar

Este documento modela formalmente los actores del sistema y los casos de uso disponibles para cada uno.

---

## 1. Principio Arquitectónico de Fronteras

* **Compradora (Web):** Su recorrido es **100% web**. No interactúa con el bot de Telegram ni con la IA.
* **Shirley (Dueña/Artesana):** Opera el negocio a través de 3 superficies:
  1. Panel `/admin` (Payload CMS).
  2. Bot de Gestión privado de Telegram (`TELEGRAM_ADMIN_CHAT_ID`).
  3. WhatsApp (cierre manual de ventas, recepción de comprobantes y envío de guías).
* **Telegram & LiteLLM:** Infraestructura de mensajería y proxy de inferencia gratuita sobre Groq.

---

## 2. Diagrama de Casos de Uso (UML / Mermaid)

```mermaid
flowchart LR
    subgraph Actores
        C["👤 Compradora (Web)"]
        S["👑 Shirley (Dueña)"]
        SYS["🤖 Telegram / LiteLLM"]
    end

    subgraph StorefrontWeb["1. Storefront Web (Next.js 15 App Router)"]
        UC1(["Explorar Catálogo & Filtros (/shop)"])
        UC2(["Ver Detalle de Joya (/products/slug)"])
        UC3(["Gestionar Carrito (Drawer)"])
        UC4(["Enviar Pedido (/pedidos/enviar + Ley 1581)"])
        UC5(["Consultar Mis Pedidos (/find-order)"])
    end

    subgraph AdminCMS["2. Panel Admin (/admin - Payload CMS)"]
        UC6(["Gestionar Productos, Precios & Variantes"])
        UC7(["Subir & Optimizar Fotos WebP (Media)"])
        UC8(["Gestionar Pedidos & Cambiar Estado"])
        UC9(["Publicar Blog & Eventos"])
    end

    subgraph BotTelegram["3. Bot de Gestión (Telegram Privado)"]
        UC10(["Consultar Pedidos Pendientes (pedidosPendientes)"])
        UC11(["Confirmar Pedido Pagado (confirmarPedido)"])
        UC12(["Actualizar Inventario (actualizarInventario)"])
        UC13(["Buscar Joyas por Lenguaje Natural (buscarProducto)"])
        UC14(["Generar Captions de Instagram (generarCaption)"])
    end

    subgraph VentaHumana["4. Cierre Humano (WhatsApp)"]
        UC15(["Coordinar Pago (Nequi / Daviplata / Transferencia)"])
        UC16(["Enviar Guía de Envío Físico (Transportadora)"])
    end

    %% Relaciones Compradora
    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    C --> UC5

    %% Relaciones Shirley
    S --> UC6
    S --> UC7
    S --> UC8
    S --> UC9
    S --> UC10
    S --> UC11
    S --> UC12
    S --> UC13
    S --> UC14
    S --> UC15
    S --> UC16

    %% Relaciones Sistema / Notificaciones
    UC4 -.->|Notificación Push HTML| SYS
    SYS -.->|Mensaje al Canal @pedidos_nenufar| S
    UC10 & UC11 & UC12 & UC13 & UC14 <-->|Inferencia $0 Llama 3.3| SYS
```

---

## 3. Matriz de Casos de Uso por Actor

| Actor | Caso de Uso | Superficie | Destino en Base de Datos |
| :--- | :--- | :--- | :--- |
| **Compradora** | `Explorar Catálogo` | `/shop` | Lectura `products` (`_status = published`) |
| **Compradora** | `Enviar Pedido` | `/pedidos/enviar` | Escritura `orders` (`status = pending`) + Notificación Telegram |
| **Shirley** | `Gestionar Catálogo` | `/admin` | CRUD `products`, `categories` |
| **Shirley** | `Subir Fotos` | `/admin` | CRUD `media` (Auto WebP 4 tamaños vía Sharp) |
| **Shirley** | `Consultar Pedidos` | Bot Telegram | Lectura `orders` vía Claude Agent SDK tool |
| **Shirley** | `Confirmar Pedido` | Bot Telegram | Actualización `orders.status = confirmed` |
| **Shirley** | `Actualizar Stock` | Bot Telegram | Actualización `products.stock` o variante |
| **Shirley** | `Coordinar Pago` | WhatsApp | Sin DB (trato humano directo con la clienta) |
