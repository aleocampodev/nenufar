# Master Implementation Plan — Nénufar

Documento índice de planes de implementación de la Fase 04 (Coding & Implementation).

---

## 📚 Índice de Planes de Implementación (IPs)

| IP ID | Módulo / Feature | Branch Designada | Worktree | Documento Detallado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IP-001** | **Migración Bot Shirley a Claude Agent SDK + LiteLLM** | `feature/bot/claude-agent-sdk-migration` | `../nenufar-bot-sdk` | [`tasks/IP-001-bot-claude-agent-sdk.md`](file:///home/ale/Work/nenufar/tasks/IP-001-bot-claude-agent-sdk.md) | 🟢 **Completado (PR #14)** |
| **IP-002** | **Storefront & Checkout Hardening** | `feature/storefront/checkout-hardening` | `../nenufar-checkout` | [`tasks/IP-002-storefront-checkout-hardening.md`](file:///home/ale/Work/nenufar/tasks/IP-002-storefront-checkout-hardening.md) | 🟢 **Completado (PR #16)** |
| **IP-003** | **Bloques Modulares Landing y Catálogo** | `feature/catalog/modular-blocks` | `../nenufar-catalog` | [`tasks/IP-003-catalog-landing-modular-blocks.md`](file:///home/ale/Work/nenufar/tasks/IP-003-catalog-landing-modular-blocks.md) | 🟢 **Completado** |

---

## 🛡️ Reglas Globales de Ejecución para Agentes

1. **Jamás realizar `git push origin main` ni commits sobre `main`:**  
   Siempre crear un Git Worktree para la rama de feature correspondiente.
2. **Dev Server en puerto 3002 (NO 3000):**  
   Ejecutar con `pnpm dev` (`cross-env NODE_OPTIONS=--no-deprecation next dev --webpack -p 3002`).
3. **Respetar la política $0/mes fijo (#253):**  
   No integrar servicios LLM de pago; toda inferencia corre sobre Groq free tier vía LiteLLM.
4. **Respetar errores TypeScript pre-existentes documentados en `AGENTS.md`:**  
   No romper el build intentando "reparar" tipos heredados del plugin ecommerce (`slug`, `paymentMethod`).
5. **Seguimiento del progreso:**  
   Marcar las tareas completadas en [`tasks/todo.md`](file:///home/ale/Work/nenufar/tasks/todo.md).
