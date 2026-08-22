# Technical Specifications — Nénufar

This directory contains the detailed engineering specifications for each subsystem of Nénufar, defining acceptance criteria, data contracts, security rules, and error handling.

---

## 📑 Specification Index

| Specification | Subsystem | Scope & Key Components |
| :--- | :--- | :--- |
| **[`SPEC-001`](./SPEC-001-storefront-checkout.md)** | Storefront & Checkout | Form validation, Colombian Habeas Data (Ley 1581), SHA256 idempotency, Order persistence, and Telegram HTML push. |
| **[`SPEC-002`](./SPEC-002-management-bot-runtime.md)** | Management Bot Runtime | `chat_id` security guard, Claude Agent SDK execution loop, LiteLLM (:4000) bridge, and Zod schemas for catalog tools. |
| **[`SPEC-003`](./SPEC-003-catalog-landing-blocks.md)** | Catalog & Landing Page | Payload modular blocks (Hero, Carousel, Events, Masonry Grid), live preview revalidation, and Sharp WebP media pipeline. |
