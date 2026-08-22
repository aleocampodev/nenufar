# Architecture Decision Records (ADRs) — Nénufar

This directory documents the foundational architectural decisions made for the Nénufar project following the [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) format.

---

## 📑 Index of Records

| ADR | Title | Status | Date |
| :--- | :--- | :--- | :--- |
| **[`ADR-001`](./ADR-001-no-payment-gateway-human-closing.md)** | Direct Human Sales Coordination over WhatsApp (No Automated Payment Gateway) | **Accepted** | 2026-08-21 |
| **[`ADR-002`](./ADR-002-claude-agent-sdk-litellm-groq.md)** | Zero-Cost Agent Runtime via Claude Agent SDK, LiteLLM Gateway & Groq Cloud | **Accepted** | 2026-08-21 |
| **[`ADR-003`](./ADR-003-payload-embedded-monolith-local-api.md)** | Single-Process Node.js Monolith with Next.js 15 & Embedded Payload CMS v3 Local API | **Accepted** | 2026-08-21 |

---

## 🧭 Why ADRs Matter
ADRs capture the context, trade-offs, and consequences of architectural choices so that current and future engineers understand *why* the system is structured this way rather than guessing or re-litigating settled decisions.
