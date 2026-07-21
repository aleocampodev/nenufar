# BRD — Business Requirement Document
**Project:** Nénufar (Handmade Jewelry)
**Version:** 3.0 (Shopify headless pivot — self-service order → Telegram)
**Date:** July 2026
**Supersedes:** v2.1 (Payload + Next.js + Telegram command center — frozen)

> **Language note:** this is a business document. It describes **what** and
> **why** in non-technical terms. The technology choices (framework, APIs,
> routes, data shapes) live in the TSD (`docs/TRD.md`); the conceptual design
> lives in the SDD (`docs/SDD`).

---

## 1. Executive Summary

**Nénufar** is a small handmade jewelry operation in Cartagena, Colombia, run by
its owner Shirley. She designs and crafts high-value pieces (emeralds, gold,
silver) and sells them mainly through WhatsApp and Instagram DMs. She has no
physical store and no staff — her phone is her office.

Today her buyers cannot assemble an order themselves: they message her, she
replies, she tries to remember who wanted what, and orders get lost in chat
history. She has no catalog on the web and no structured record of what people
ask for.

**Nénufar MVP v3.0** gives her a **professional website** (catalog + blog) where
buyers browse her work and **assemble and personalize an order themselves**. On
"Send order", the order lands as **one structured message in a Telegram channel**
Shirley reads from her phone. She then closes and fulfills manually on WhatsApp
— the way she always has, but without being the order-intake bottleneck.

There is **no checkout, no online payment, no customer account, and no
chatbot.** The catalog and blog are managed in **Shopify** (the commerce platform
Shirley already pays for); the website presents them. The agentic layer (an
assistant that helps close sales) is deferred — see the maturity ladder in
`specs/constitution.md` §5.

---

## 2. Business Objectives

- Give Nénufar a **professional, fast, SEO-friendly web presence** (catalog +
  blog) so her brand has a public face and her work is discoverable.
- Let buyers **assemble and personalize an order themselves** (choose options,
  add engravings/notes) so Shirley stops being the order-intake bottleneck.
- Deliver each order to Shirley as **one structured message** in a Telegram
  channel she reads from her phone — no laptop required.
- **Keep fulfillment manual and human** — no payment gateway, no automated
  closing. Shirley closes on WhatsApp as she does today.
- Lay a foundation (Shopify catalog + a real storefront) on which an **agentic
  assistant** can be added later without rework (maturity ladder).

---

## 3. Scope

### 3.1 Included in the MVP (v3.0)

| # | Capability | Business description |
|---|---|---|
| 01 | Storefront | A professional website for Nénufar (home, catalog, blog) in Spanish, with prices in COP. Buyers discover the brand and browse the work. |
| 02 | Catalog | A product catalog Shirley manages comfortably from the Shopify admin; her products appear on the website. Unpublished products are hidden. |
| 03 | Blog | A blog Shirley writes in the Shopify admin; articles publish on the website with good SEO and social sharing. |
| 04 | Cart + personalization | A buyer builds an order: chooses product options (material, size) and adds personalization (engraving, notes). No payment, no shipping checkout — just order assembly. |
| 05 | Order submission → Telegram | On "Send order", the assembled order is sent as one structured message to a Telegram channel Shirley reads from her phone. The channel is the only order record. |

### 3.2 Explicitly out of scope (v3.0)

- **Online checkout / payment.** No card flow, no payment gateway. Payment
  settles externally (Nequi, transfer, cash) on WhatsApp.
- **A database or admin of our own.** Catalog/blog live in Shopify; orders are
  not stored in a system — only in the Telegram channel.
- **A command bot or daily digest.** Telegram is one-way notification only; no
  commands Shirley types, no automated summaries.
- **Order status tracking.** No PAID/DISPATCHED pipeline. Fulfillment is
  off-system.
- **Customer accounts or order history.** The site is public; buyers submit
  orders without logging in.
- **A chatbot or AI assistant.** Deferred to a later phase (maturity ladder).
- **Porting the old website clone.** The storefront starts fresh and is
  rebranded to Nénufar.

---

## 4. Stakeholders

| Role | Description | Primary interest |
|---|---|---|
| Shirley (owner-operator) | Solopreneur. Designs, crafts, sells, packs, ships. Runs everything from her phone. Manages catalog/blog in Shopify; reads orders in a Telegram channel; closes on WhatsApp. | Professional web presence, stop being the intake bottleneck, receive structured orders on her phone. |
| End buyer (B2C) | Tourist, gift shopper, or repeat customer. Discovers Nénufar on the web/Instagram, browses, assembles a personalized order, submits it. | See real photos/prices in COP, feel trust, assemble an order without a cold checkout. |
| Product team | Design and evolution of the MVP. | Validate that a Shopify-backed storefront + a Telegram order channel is enough to move Shirley from "memory + WhatsApp" to a structured self-service intake. |

---

## 5. Core Hypothesis to Validate

If a solopreneur jeweler has (1) a professional website showing her catalog and
blog, (2) a way for buyers to assemble and personalize an order themselves, and
(3) each order arriving structured in a Telegram channel she reads from her
phone, she will:

- Stop losing orders to messy WhatsApp threads (orders arrive structured).
- Remove herself from the order-intake bottleneck (buyers self-serve).
- Save hours per week (no manual order transcription from chat).
- Give her brand a professional web presence that convenes qualified traffic.

The agentic hypothesis (an assistant that replaces Shirley in closing) is NOT
tested in this MVP. It is deferred and documented as a maturity ladder.

---

## 6. Success Metrics

> **Honesty note:** the MVP has no analytics instrumentation. The metrics below
> are split into **countable** (from the Telegram channel + Shopify admin) and
> **qualitative / self-reported** (Shirley). Adding lightweight analytics is
> tracked as a known gap in the constitution §6.

| Metric | Type | Definition | Target (month 1) |
|---|---|---|---|
| Storefront traffic | Countable | Unique visitors/month (needs analytics — gap) | Establish baseline |
| Orders submitted | Countable | Messages posted to the Telegram channel | Establish baseline |
| Order clarity | Qualitative | Shirley reports orders arrive parseable without follow-up | ≥ 80% |
| Time saved per order | Qualitative | Shirley's estimate vs transcribing from WhatsApp chat | ≥ 5 min/order |
| Catalog freshness | Countable | New products published in Shopify admin/month | ≥ 5 in month 1 |
| Submission failures | Countable | Failed order deliveries / total submissions | < 1% |

> No AI-token-cost metric — there is no AI in the runtime path.

---

## 7. Assumptions and Risks

### 7.1 Assumptions

- Shirley has (or will open) a **Shopify store** and is willing to manage her
  catalog/blog in the Shopify admin.
- Shirley has a **Telegram** account and can create a channel and add the
  notification bot as admin.
- Shirley has a **WhatsApp Business** number to close orders manually.
- Order volume in month 1 is low enough that Telegram-channel-only (no
  searchable order history) is acceptable.

### 7.2 Risks

- **Recurring cost:** Shopify charges a monthly subscription (unlike a fully
  self-hosted stack). Mitigation: lowest Shopify tier; the catalog/blog value
  and the familiar admin justify it for a non-technical owner.
- **No order history (debt):** orders live only in the channel. Mitigation:
  acceptable for MVP volume; resolved at agentic L3+.
- **PII in channel:** customer name/phone/address visible to channel members.
  Mitigation: restrict the channel to Shirley; the PRD specifies a consent
  checkbox + a `/privacidad` page (Colombia **Ley 1581 de 2012**).
- **Public submission abuse:** the "Send order" action is public; a malicious
  actor could spam the channel. Mitigation: idempotency + (deferred) rate limit.
- **No payments on-site:** buyers submit intent but pay off-platform; some may
  drop. Mitigation: the structured order gives Shirley a warm lead to close on
  WhatsApp.

---

## ChangeLog

### v2.1 → v3.0 (Shopify headless pivot)
- **Storefront stack changed:** Next.js + Payload → Shopify (catalog/blog
  backend) + a fresh storefront. Tech detail now lives in the TSD, not here.
- **Order flow inverted:** from "Shirley types the order manually" → "buyer
  assembles and personalizes the order themselves".
- **Cart introduced:** v2.1 had no cart (WhatsApp link only). v3.0 has order
  assembly with personalization.
- **Telegram repurposed:** from Shirley's command center (commands, digest,
  photo) → one-way notification channel.
- **Persistence removed:** no database; orders live only in the Telegram channel
  (known debt).
- **Monorepo collapsed:** a single app.
- **Renamed:** "Nenúfar" / `nenufar`.
- **This document de-teched:** capabilities described in business language per
  the BRD standard; framework/API/route detail moved to the TSD.
