# Master Implementation Plan — Nénufar

Index of Phase 04 (Coding & Implementation) implementation plans.

---

## 📚 Implementation Plan Index (IPs)

| IP ID | Module / Feature | Designated Branch | Worktree | Detailed Document | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IP-001** | **Shirley Bot Migration to Claude Agent SDK + LiteLLM** | `feature/bot/claude-agent-sdk-migration` | `../nenufar-bot-sdk` | [`tasks/IP-001-bot-claude-agent-sdk.md`](file:///home/ale/Work/nenufar/tasks/IP-001-bot-claude-agent-sdk.md) | 🟢 **Done (PR #14)** |
| **IP-002** | **Storefront & Checkout Hardening** | `feature/storefront/checkout-hardening` | `../nenufar-checkout` | [`tasks/IP-002-storefront-checkout-hardening.md`](file:///home/ale/Work/nenufar/tasks/IP-002-storefront-checkout-hardening.md) | 🟢 **Done (PR #16)** |
| **IP-003** | **Modular Landing & Catalog Blocks** | `feature/catalog/modular-blocks` | `../nenufar-catalog` | [`tasks/IP-003-catalog-landing-modular-blocks.md`](file:///home/ale/Work/nenufar/tasks/IP-003-catalog-landing-modular-blocks.md) | 🟢 **Done** |
| **IP-004** | **Storefront UI/UX, Accessibility & Performance** | `feat/storefront/audit-ui-ux-improvements` | `/home/ale/Work/nenufar` | [`tasks/IP-004-storefront-ui-ux-accessibility-improvements.md`](file:///home/ale/Work/nenufar/tasks/IP-004-storefront-ui-ux-accessibility-improvements.md) | 🟢 **Done** |
| **IP-005** | **Outbound Calendar Feed (Admin → Google Calendar)** | `feature/calendar/outbound-feed` | `/home/ale/Work/nenufar` | [`tasks/IP-005-calendar-outbound-feed.md`](file:///home/ale/Work/nenufar/tasks/IP-005-calendar-outbound-feed.md) | 🟡 **Implemented in working tree (uncommitted)** |
| **IP-006** | **Architecture Deepening (C1–C6)** | `feature/architecture-deepening-c1-c6` | `/home/ale/Work/nenufar` | [`tasks/IP-006-architecture-deepening-c1-c6.md`](file:///home/ale/Work/nenufar/tasks/IP-006-architecture-deepening-c1-c6.md) | 🟡 **In Progress (S1 done)** |

---

## 🛡️ Global Agent Execution Rules

1. **Never `git push origin main` nor commit onto `main`:**  
   Always create a Git worktree for the corresponding feature branch.
2. **Dev server on port 3002 (NOT 3000):**  
   Run with `pnpm dev` (`cross-env NODE_OPTIONS=--no-deprecation next dev --webpack -p 3002`).
3. **Respect the fixed $0/month policy (#253):**  
   No paid LLM services; all inference runs on Groq free tier via LiteLLM.
4. **Respect pre-existing TypeScript errors documented in `AGENTS.md`:**  
   Do not break the build trying to "fix" inherited ecommerce-plugin types (`slug`, `paymentMethod`).
5. **Track progress:**  
   Mark completed tasks in [`tasks/todo.md`](file:///home/ale/Work/nenufar/tasks/todo.md).
