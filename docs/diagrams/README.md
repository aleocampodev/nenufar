# Diagramas de Arquitectura e Ingeniería — Nénufar

Este directorio contiene los diagramas formales del sistema Nénufar organizados por categoría y accesibles mediante un visor interactivo:

---

### 🌐 Visualizador Unificado
* **[`index.html`](./index.html)** — Visualizador interactivo con pestañas de Casos de Uso, Estados, Secuencias y Arquitectura.

---

### 📑 Documentos Markdown con Diagramas Mermaid
| Documento | Tipo de Diagrama | Contenido Principal |
| :--- | :--- | :--- |
| **[`casos-de-uso.md`](./casos-de-uso.md)** | Casos de Uso (UML) | Actores (Compradora Web, Shirley Admin/Bot/WhatsApp, Telegram/LiteLLM) y sus límites operativos. |
| **[`estados.md`](./estados.md)** | Máquinas de Estado | Ciclo de vida del Pedido (`pending` → `confirmed` → `shipped`) y ciclo de vida del Runtime IA del Bot. |
| **[`interaccion.md`](./interaccion.md)** | Secuencia / Interacción | Flujo de compra y notificación web, y flujo de consulta del Bot de Shirley (Claude Agent SDK + LiteLLM + Groq). |

---

### 🗺️ Visualizadores de Sistema y Roadmap
* **[`../arquitectura.html`](../arquitectura.html)** — Mapa General del Sistema v3.2.
* **[`../diagrams-option-a-free.html`](../diagrams-option-a-free.html)** — Diagramas técnicos completos de la arquitectura $0 Cost.
* **[`../sdlc-roadmap.html`](../sdlc-roadmap.html)** — Roadmap SDLC 7 Fases y Matriz de Skills de Addy Osmani.
