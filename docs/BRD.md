# BRD — Business Requirement Document
**Proyecto:** Nénufar — Joyería Artesanal
**Versión:** 3.2 (Payload CMS + Next.js + Bot multiagente)
**Fecha:** Agosto 2026
**Supersede:** v3.0 (Shopify headless — archivado en `docs/archive/v3.0/BRD.md`)

---

## 1. Executive Summary

**Nénufar** es una operación de joyería artesanal en Cartagena, Colombia, dirigida por su dueña Shirley. Ella diseña y fabrica piezas de alto valor (esmeraldas, oro, plata) y las vende principalmente por WhatsApp e Instagram. No tiene local físico ni empleados — su teléfono es su oficina.

El problema central: los compradores no pueden armar un pedido solos. Le escriben por chat, ella responde, intenta recordar quién quería qué, y los pedidos se pierden en el historial de conversaciones. No tiene catálogo en la web ni registro estructurado de lo que le piden.

**Nénufar v3.1** le da una **tienda profesional** (catálogo + blog + cuenta de usuario) donde los compradores exploran su trabajo y **arman su pedido solos**. Al hacer clic en "Confirmar pedido", el pedido llega como **un mensaje estructurado al canal de Telegram** que Shirley lee desde su teléfono. Ella coordina pago y envío por WhatsApp — como siempre lo ha hecho, pero sin ser el cuello de botella del proceso.

**No hay checkout online ni pasarela de pago.** El catálogo y el blog se administran desde el **admin de Payload CMS** que Shirley maneja desde el navegador. El sistema vive en un servidor propio (self-hosted) sin costos de plataforma recurrentes como Shopify.

---

## 2. Business Goals & KPIs

### Objetivos de negocio

| # | Objetivo | Descripción |
|---|----------|-------------|
| 1 | Presencia web profesional | Nénufar tiene una URL propia, SEO, y una cara pública que genera confianza antes de la primera conversación. |
| 2 | Catálogo autogestionable | Shirley sube fotos, agrega productos y precios desde su celular sin necesitar un desarrollador. |
| 3 | Pedidos estructurados | Cada pedido llega a Telegram con todos los datos en orden: qué, cuánto, quién, cómo contactar. |
| 4 | Eliminar el cuello de botella de intake | El comprador arma el pedido solo — Shirley solo recibe y cierra. |
| 5 | Registro en el admin | Los pedidos quedan guardados en Payload como órdenes consultables, no solo en el chat. |

### KPIs (mes 1)

| Métrica | Tipo | Definición | Meta |
|---------|------|------------|------|
| Pedidos enviados | Contable | Mensajes de pedido en el canal Telegram | Establecer línea base |
| Claridad del pedido | Cualitativo | Shirley reporta que los pedidos llegan sin necesitar aclaraciones | ≥ 80% |
| Tiempo ahorrado | Cualitativo | Estimación de Shirley vs. transcribir desde WhatsApp | ≥ 5 min/pedido |
| Productos publicados | Contable | Nuevos productos en el admin/mes | ≥ 5 en mes 1 |
| Fallos de envío | Contable | Pedidos fallidos / total enviados | < 1% |
| Tráfico al catálogo | Contable | Visitas a `/shop` (requiere analytics — pendiente) | Establecer base |

---

## 3. Scope

### 3.1 Incluido en v3.1 (actual)

| # | Capacidad | Descripción de negocio |
|---|-----------|------------------------|
| 01 | Tienda | Sitio web profesional: home, catálogo, detalle de producto. En español, precios en COP. |
| 02 | Catálogo | Productos con fotos, variantes (talla, material), inventario e precios en COP. Shirley los gestiona desde el admin de Payload. |
| 03 | Blog | Shirley escribe artículos en el admin; se publican en `/blog` con SEO y redes sociales. |
| 04 | Carrito + personalización | El comprador elige variantes, agrega notas por producto y una nota general del pedido. Sin pago ni checkout. |
| 05 | Pedido → Telegram | Al confirmar, el pedido llega a Telegram con todos los datos estructurados. |
| 06 | Cuenta de usuario | Compradores registrados pueden ver su historial de pedidos y direcciones. |
| 07 | Privacidad (Ley 1581) | Página `/privacidad`, checkbox de consentimiento en el formulario de pedido. |
| 08 | Admin Payload | Shirley gestiona productos, pedidos, blog y medios desde `/admin`. |
| 09 | Imágenes WebP | Fotos de cámara profesional se convierten automáticamente a WebP (calidad 92) en 4 tamaños al subir. |

### 3.2 Incluido en v3.2 (bot multiagente de gestión — solo Shirley)

El bot multiagente es la **herramienta de gestión conversacional de Shirley**: opera su tienda desde Telegram sin abrir el admin en el navegador. **Las compradoras no interactúan con el bot** — su recorrido sigue siendo 100% web (ver §3.4).

| # | Capacidad | Descripción de negocio |
|---|-----------|------------------------|
| 10 | Admin conversacional | Shirley le escribe al bot en Telegram para consultar y gestionar su tienda: pedidos, inventario, productos. |
| 11 | Orquestador + agentes IA con skills | Groq (Llama 3.3, free tier) interpreta lo que Shirley pide y ejecuta la skill correspondiente sobre Payload (buscar producto, listar pedidos, etc.). |
| 12 | Autenticación por `chat_id` | El bot **solo responde al `chat_id` de Shirley**. Cualquier otro remitente se ignora en silencio. |

> **Estado de implementación (slice 1):** ya está el runtime — orquestador, loop de tool-calling, webhook con deduplicación por `update_id`, cliente Groq y la skill `buscarProductos`. La reorientación completa a Shirley (auth por `chat_id` + skills de gestión de pedidos e inventario) es el siguiente slice.

### 3.3 Explícitamente fuera de alcance (v3.2)

- **Pago online.** Sin pasarela de pago (Stripe, Wompi, etc.). El pago se coordina externamente por Nequi, transferencia o efectivo.
- **Chat comprador ↔ bot.** La compradora **no le escribe al bot**. No hay asistente conversacional para compradoras ni widget de chat en la web. El bot es exclusivamente de Shirley.
- **Analytics.** No hay Google Analytics ni similar todavía — gap conocido.
- **App móvil.** El sitio es responsive; no hay app nativa.
- **Envíos automatizados.** Sin integración con transportadoras. El envío se coordina manualmente.

---

## 4. Stakeholders

| Rol | Descripción | Interés principal |
|-----|-------------|-------------------|
| Shirley (dueña-operadora) | Soloprenuer. Diseña, fabrica, vende, empaca y envía. Opera todo desde su celular. Gestiona catálogo en el admin **o por el bot de Telegram**; recibe pedidos en Telegram; cierra en WhatsApp. | Presencia web profesional, recibir pedidos ordenados, gestionar sin depender del navegador. |
| Comprador final (B2C) | Turista, persona buscando regalo, o cliente habitual. Descubre Nénufar en la web o Instagram, explora el catálogo, arma y envía su pedido **desde la web**, dejando su WhatsApp para contacto. | Ver fotos reales con precios en COP, sentir confianza, armar un pedido sin hablar con nadie primero. |
| Equipo de producto | Diseño y evolución del MVP. | Validar que Payload + Telegram es suficiente para que Shirley pase de "memoria + WhatsApp" a un intake estructurado. |

---

## 5. Hipótesis central a validar

Si una joyera solopreneur tiene (1) un sitio web profesional con catálogo y blog, (2) una forma para que compradores armen y personalicen un pedido solos, y (3) cada pedido llegando estructurado a su Telegram, ella va a:

- Dejar de perder pedidos en hilos de WhatsApp.
- Salir del cuello de botella del intake (el comprador hace el trabajo).
- Ahorrar horas por semana que hoy gasta transcribiendo pedidos desde el chat.
- Darle a su marca una presencia web que genera tráfico calificado.

La hipótesis agéntica (un asistente que reemplaza a Shirley en el cierre de ventas) **no se prueba en este MVP**. Está documentada como una fase futura.

---

## 6. Supuestos y Riesgos

### 6.1 Supuestos

- Shirley tiene cuenta de Telegram y puede crear un bot con `@BotFather`.
- Shirley tiene acceso a un computador o tablet para administrar el CMS (aunque el admin funciona en móvil).
- El volumen de pedidos en el mes 1 es manejable manualmente por Shirley.
- Las fotos de producto son de cámara profesional (JPEG/PNG, alta resolución).

### 6.2 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Shirley no adopta el admin del CMS | Media | Alto | Capacitación presencial + video corto de uso. El admin de Payload es simple para tareas básicas. |
| Telegram falla al recibir un pedido | Baja | Alto | El pedido igual queda guardado en Payload. Shirley puede verlo en `/admin/collections/orders`. |
| PII del comprador en el canal de Telegram | Media | Medio | El canal es privado para Shirley. Consentimiento (Ley 1581) en el formulario. |
| Abuso del formulario de pedidos (spam) | Baja | Bajo | Idempotencia por `cartId` — duplicados se ignoran. Rate limiting es trabajo futuro. |
| Imágenes de baja calidad en pantalla | Baja | Alto | Sistema de conversión WebP q92 implementado; original siempre preservado. |
| Costo de hosting | Baja | Bajo | Self-hosted en VPS; sin costos de plataforma (sin Shopify). |

---

## 7. ChangeLog

### v3.1 → v3.2 (bot multiagente de gestión — solo Shirley)
- **Admin conversacional:** el mismo bot de pedidos (`TELEGRAM_BOT_TOKEN`) ahora también recibe mensajes vía webhook, pero **solo de Shirley** — es su herramienta para gestionar la tienda desde Telegram.
- **La compradora se queda en la web:** decisión de producto — no hay chat comprador ↔ bot ni widget de chat en el sitio. La compradora arma su pedido en la web y deja su WhatsApp.
- **Sistema de agentes:** orquestador (Groq) + skills sobre Payload. El slice 1 dejó el runtime y `buscarProductos`; las skills de gestión (pedidos, inventario) siguen.
- **Un solo bot:** notificaciones de pedidos + admin conversacional, ambos con `TELEGRAM_BOT_TOKEN`.
- **Nuevas variables de entorno:** `GROQ_API_KEY`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ADMIN_CHAT_ID` (el `chat_id` de Shirley).

### v3.0 → v3.1 (Payload CMS pivot)
- **Stack:** Shopify headless → Payload CMS v3 + Next.js App Router autopropelido. Sin costo de plataforma recurrente.
- **Catálogo:** de Shopify como backend → Payload como CMS propio.
- **Blog:** de blog de Shopify → colección `Posts` en Payload con rich text Lexical.
- **Cuenta de usuario:** agregada (pedidos, direcciones, perfil).
- **Registro de pedidos:** los pedidos ahora quedan en Payload (colección `Orders`) además de llegar a Telegram.
- **Imágenes:** conversión automática a WebP (calidad 92, 4 tamaños) via Sharp integrado en Payload.
- **Color de marca:** violeta Nénufar (`#6A1B9A`) formalizado como token CSS (`--brand`).
