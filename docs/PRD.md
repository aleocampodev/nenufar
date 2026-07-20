# PRD — Product Requirement Document
**Project:** Nénufar (Handmade Jewelry)
**Version:** 3.0 (Shopify headless pivot — self-service order → Telegram)
**Date:** July 2026
**Supersedes:** v2.1 (Payload + Next.js + Telegram command center — frozen)

> **Scope note:** this document describes **product behavior** (what users see
> and do). Technology choices (framework, APIs, exact routes, data shapes,
> caching) live in the TSD (`docs/TRD.md`); the conceptual architecture lives in
> the SDD (`docs/SDD`).

---

## 1. Product Vision

Nénufar.com is Shirley's professional storefront. Buyers browse her catalog and
blog, **assemble and personalize an order themselves**, and on "Send order" the
order is delivered to Shirley as one structured message in a Telegram channel.
There is no checkout, no payment on site, and no chatbot. Shirley closes on
WhatsApp as she always has — but the buyer did the intake work, structured.

---

## 2. User Stories

### Storefront + Catalog (Cap 01, 02)

| As a... | I want to... | So that... |
|---|---|---|
| End buyer | browse the catalog on the web | see photos, materials, and COP prices without asking |
| End buyer | open a product detail page | see all photos, description, and available options |
| End buyer | read the blog | feel trust and connection before ordering |
| Shirley | manage products in the Shopify admin | keep the catalog current without a developer |

### Blog (Cap 03)

| As a... | I want to... | So that... |
|---|---|---|
| Shirley | write articles in the Shopify admin | publish content without touching code |
| End buyer | read articles with cover, author, date | navigate and read editorially |

### Cart + personalization (Cap 04)

| As a... | I want to... | So that... |
|---|---|---|
| End buyer | pick product options (material, size) | get exactly the variant I want |
| End buyer | add a personalization note (engraving, instructions) | make the piece mine |
| End buyer | see my cart and adjust quantities | review before sending |
| End buyer | see the COP total | know the cost before committing |

### Order submission (Cap 05)

| As a... | I want to... | So that... |
|---|---|---|
| End buyer | enter my name + contact + consent | Shirley can reach me |
| End buyer | click "Send order" | the order reaches Shirley |
| End buyer | see a confirmation screen | know it was sent |
| Shirley | receive one structured message per order in the channel | read and act from my phone |

---

## 3. Functional Requirements

### 3.1 Storefront (Cap 01)

- The site renders: home, catalog, product detail, blog list, blog article,
  cart, order form, and confirmation pages. Spanish copy, COP.
- Public; no login.
- Responsive on mobile, tablet, desktop.
- Performance target in NFRs; caching strategy in the TSD.

### 3.2 Catalog (Cap 02)

- Products and variants are sourced from Shopify and rendered on the site.
- **Unpublished / unavailable products are excluded** from all public listings.
- Product detail shows: images, name, description, materials, COP price, and the
  available variants.
- Prices are displayed in COP (`es-CO` formatting).

### 3.3 Blog (Cap 03)

- Articles are sourced from the Shopify blog; a list page and an article page
  are rendered.
- An article shows: cover image, title, author, date, content, category.
- Each article emits SEO metadata and Open Graph tags.

### 3.4 Cart + personalization (Cap 04)

- A buyer can add a product to the cart with a chosen variant.
- A buyer can add **free-text personalization per line** (engraving,
  instructions) — captured as line attributes.
- A buyer can set a **cart-level note**.
- A buyer can change quantities and remove items; the total recalculates.
- The cart shows line items, personalization, and the COP total.
- **No payment, no shipping-address form** — only what is needed to assemble the
  order.

### 3.5 Order submission → Telegram (Cap 05)

- An order-form page collects: buyer name, contact (phone or WhatsApp), and
  **explicit consent** (see §3.6).
- "Send order" reads the full cart + buyer info + consent, formats **one
  structured message**, and posts it to the Telegram channel.
- The message includes: items (name, variant, quantity, personalization), cart
  note, buyer name + contact, COP total, and a timestamp.
- Submission is **idempotent**: a duplicate click within a short window does not
  produce a second message.
- On success the buyer sees a confirmation screen.
- On failure the buyer sees an error and can retry.

### 3.6 Privacy (cross-cutting — Ley 1581 de 2012)

- A `/privacidad` page explains: what data the order collects, why, who sees it
  (Shirley via the channel), and how long it is kept (the channel history).
- The order form has a consent checkbox, **unchecked by default**; submission is
  blocked until it is checked.
- **Data minimization:** the form asks only for what Shirley needs to fulfill
  (name, contact, and the order itself). No mandatory fields beyond those.

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Language & currency | Storefront copy and the Telegram message are Spanish; all money is COP. |
| Performance | Storefront pages load with LCP < 2s (caching strategy in the TSD). |
| Mobile-first | Responsive at 375 / 768 / 1280 px. Shirley's buyers are on phones. |
| Accessibility | WCAG 2.1 AA target for the storefront (contrast, keyboard, alt text). |
| Privacy | Ley 1581 de 2012 — consent + minimization + a public privacy notice. |
| Idempotency | Order submission dedupes by cart id within a short window. |
| Availability | The storefront is a cacheable site; order submission is a server endpoint. |
| Cost | Shopify subscription + hosting (concrete tiers in the TSD). |

---

## 5. Wireframes / UX

- **Wireframes: PENDING** — to be produced before implementation. Reference
  layout:
  - **Home** — hero → catalog grid → blog section.
  - **Product detail** — gallery → options → personalization → "Add to cart".
  - **Cart** — line items (with personalization) → COP total → "Send order".
  - **Order form** — name / contact / consent checkbox → submit.
  - **Confirmation** — "order sent ✓" + order reference + Shirley's WhatsApp link.
- **Brand:** Nénufar. The v2.1 Krafti palette is dropped with the clone; final
  palette/typography to be chosen by Shirley.
- **Tone:** editorial, premium, high-contrast, minimal animation.

---

## 6. Acceptance Criteria

### Storefront + Catalog (Cap 01, 02)

- **AC-01.1** Given the home page renders, then hero, catalog grid, and blog
  section all hydrate from Shopify — not from hardcoded arrays.
- **AC-01.2** Given a product is unpublished in Shopify, when any listing
  renders, then that product does NOT appear.
- **AC-01.3** Given any product price displayed, when it renders, then it shows
  COP with `es-CO` formatting.
- **AC-01.4** Given the site is viewed at 375px width, when it renders, then all
  sections are responsive without horizontal scrolling.
- **AC-01.5** Given a product detail page, then images, name, description,
  materials, COP price, and the available variants all display.

### Blog (Cap 03)

- **AC-02.1** Given the blog list, then articles show cover image, title,
  author, date, and category.
- **AC-02.2** Given an article page, then cover, metadata, and content render,
  and the HTML head includes title, meta description, and Open Graph tags.
- **AC-02.3** Given more articles than fit one page, then pagination controls
  appear and navigate correctly.

### Cart + personalization (Cap 04)

- **AC-04.1** Given a product detail, when the buyer selects a variant and clicks
  "Add to cart", then the cart contains that line with the chosen variant.
- **AC-04.2** Given a line in the cart, when the buyer adds personalization text,
  then it is stored on that line and displayed in the cart.
- **AC-04.3** Given the cart, when the buyer changes a quantity or removes a
  line, then the COP total recalculates.
- **AC-04.4** Given the cart, then the COP total is shown.

### Order submission (Cap 05)

- **AC-05.1** Given the cart has items, when the buyer opens the order form,
  then name, contact, and consent fields appear.
- **AC-05.2** Given the consent checkbox is unchecked, when the buyer clicks
  "Send order", then submission is blocked with a clear error.
- **AC-05.3** Given a valid form, when the buyer clicks "Send order", then one
  structured message is posted to the Telegram channel containing items,
  variants, personalization, cart note, buyer info, COP total, and timestamp.
- **AC-05.4** Given a successful submission, when it completes, then the buyer
  sees a confirmation screen.
- **AC-05.5** Given the buyer clicks "Send order" twice in quick succession, then
  only one message is posted to the channel (idempotency).
- **AC-05.6** Given the submission fails (e.g. a delivery error), when it
  completes, then the buyer sees an error and can retry.

### Privacy (Cap 06 cross-cutting)

- **AC-06.1** Given `/privacidad`, when the page renders, then a notice describes
  the data collected, the purpose, who sees it, and the retention.
- **AC-06.2** Given the order form, when it renders, then the consent checkbox is
  unchecked by default and clearly labelled.

---

## 7. Dependencies & Milestones

### Dependencies

- A **Shopify store** with products and variants configured.
- A **Telegram channel** plus a bot added as admin of that channel.
- Shirley's **WhatsApp Business** number (the closing channel).
- A **domain** (e.g. `nenufar.co`).

### Milestones (indicative)

- **M1** — Storefront skeleton (home, catalog, product detail) reading from
  Shopify.
- **M2** — Blog (list + article, SEO/OG).
- **M3** — Cart + personalization.
- **M4** — Order submission → Telegram + privacy (consent + `/privacidad`).
- **M5** — Polish: accessibility, SEO, performance, deploy.

---

## ChangeLog

### v2.1 → v3.0
- **Cart introduced** (v2.1 had none — WhatsApp link only).
- **Order submission → Telegram** replaces the entire Telegram command bot
  (commands, digest, photo-to-draft, webhook).
- **Buyer journey fully specified** — was a single `wa.me` line in v2.1; now
  user stories + RFs + ACs for browse → variant → personalization → cart → send
  → confirm.
- **Privacy (Ley 1581)** added as a cross-cutting RF + ACs.
- **CRM / Payload** user stories removed (no admin of our own).
- **Krafti-rebrand** user stories removed (fresh starter, brand TBD by Shirley).
- **Wireframes** and **Dependencies & Milestones** sections added (per the PRD
  standard).
- AC count: 15 (5 storefront/catalog + 3 blog + 4 cart + 6 order submission +
  2 privacy) — down from v2.1's 30 because the Telegram command surface is gone.
