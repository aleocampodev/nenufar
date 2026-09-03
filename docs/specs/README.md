# Specifications & System Documentation — Nénufar

This directory contains the canonical specifications, requirements, and design documents for Nénufar, structured according to the 7-phase SDLC.

---

## 🏛️ Foundational Specification Documents

| Document | Name | Phase | Scope |
| :--- | :--- | :--- | :--- |
| **[`BRD.md`](./BRD.md)** | **Business Requirements Document** | Phase 01 (Planning) | Business model, artisan jewelry context, zero-Stripe model, and WhatsApp closing. |
| **[`PRD.md`](./PRD.md)** | **Product Requirements Document** | Phase 02 (Analysis) | User personas, journey maps, catalog features, checkout UX, and bot functional requirements. |
| **[`SDD.md`](./SDD.md)** | **Software Design Document** | Phase 03 (Design) | High-level system architecture, monolith design, Claude Agent SDK + LiteLLM bridge, and Local API. |
| **[`TRD.md`](./TRD.md)** | **Technical Requirements Document** | Phase 03 (Design) | Non-functional requirements, security hardening, database schema, performance, and env vars. |
| **[`SKILLS.md`](./SKILLS.md)** | **Bot Skills Catalog** | Phase 02 & 04 | Full specification of Shirley's Telegram bot tools for catalog attraction, events, and orders. |
| **[`GLOSSARY.md`](./GLOSSARY.md)** | **Project Glossary** | All Phases | Ubiquitous language, domain terms (COP, Ley 1581, Payload local API, LiteLLM). |

---

## 📐 Subsystem Technical Specifications (SPECs)

| Specification | Subsystem | Focus Area |
| :--- | :--- | :--- |
| **[`SPEC-001`](./SPEC-001-storefront-checkout.md)** | Storefront & Checkout | Form validation, Ley 1581 Habeas Data, SHA256 idempotency, and Telegram HTML push. |
| **[`SPEC-002`](./SPEC-002-management-bot-runtime.md)** | Management Bot Runtime | `chat_id` security guard, Claude Agent SDK execution loop, and Zod tool schemas. |
| **[`SPEC-003`](./SPEC-003-catalog-landing-blocks.md)** | Catalog & Landing Blocks | Payload modular blocks, Masonry layout, and Sharp WebP media optimization. |
| **[`SPEC-005`](./SPEC-005-landing-refinements-and-google-calendar.md)** | Landing & Calendar Sync | Slider Hero animations, direct WhatsApp closing, and Google Calendar iCal sync. |

---

## 📑 Architecture Decision Records (ADRs)
All architectural decisions and trade-offs are formally recorded in **[`../adr/`](../adr/)**.
