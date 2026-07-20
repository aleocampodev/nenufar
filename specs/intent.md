# Intent — Nénufar

> Seeds the v3.0 specification. Answers **what** and **why** — never **how**.
> The how (framework, APIs, credentials) lives in `specs/constitution.md`.
> Formerly known internally as "Agento"; renamed to Nénufar (the brand name)
> because the MVP is deterministic and the old name implied an agentic system
> that is not built in this iteration.

## Hypothesis

A solopreneur jeweler who runs her entire business from her phone (Shirley,
Nénufar — handmade jewelry in Cartagena, Colombia) can give her brand a real
storefront where buyers browse her catalog, read her blog, and **assemble a
personalized order themselves** — without Shirley installing software, running a
database, or maintaining a custom admin.

If her storefront is a Shopify headless site (Hydrogen + Storefront API) and each
submitted order lands as one structured message in a Telegram channel she reads
from her phone, she will:

- Stop losing orders to messy WhatsApp threads — the order arrives structured
  (items, variants, personalization, total), not as free text she has to parse.
- Give her brand a fast, professional, SEO-friendly web presence (catalog +
  blog) without building a traditional e-commerce backend.
- Remove herself from being the order-intake bottleneck — the buyer assembles
  the order; Shirley only closes and fulfills.
- Keep fulfillment manual and human — no payment gateway, no automated closing,
  no chatbot talking to her customers.

No LLM runs in the runtime path. The agentic layer (LLM-assisted intake, catalog
Q&A, photo-to-product) is **deferred to a later phase** and documented as a
maturity ladder in the constitution — not implemented in this MVP.

## User Problem

Shirley designs and crafts high-value pieces (emeralds, gold, silver) and sells
them through WhatsApp and Instagram. She has no physical store and no staff —
her phone is her office. Today her buyers cannot assemble an order themselves:
they message her, she replies, she tries to remember who wanted what, and orders
get lost in chat history. She has no catalog on the web, no blog, and no
structured record of what people ask for.

She does **not** need a full e-commerce engine with checkout and online payments.
She needs:

1. A professional storefront where buyers see her catalog and blog.
2. A way for a buyer to assemble and personalize an order themselves.
3. For that order to reach her as **one structured message** she can act on from
   her phone.

## Target Audience

- **Shirley (owner-operator).** Solopreneur. Designs, crafts, sells, packs,
  ships. Primary device: phone. Manages her catalog and blog in the Shopify
  admin. Reads incoming orders in a Telegram channel and closes them manually on
  WhatsApp.
- **End buyer (B2C).** Tourist, gift shopper, or repeat customer looking for
  high-value Colombian artisan jewelry. Discovers Nénufar on the web or via
  Instagram, browses the catalog, assembles a personalized order, and submits
  it. There is **no checkout and no payment on the site** — the buyer is routed
  to Shirley for fulfillment.

## Scope & In-Scope

- **Storefront** — a single Hydrogen app (React Router / Remix) rebranded to
  Nénufar, rendering catalog and blog from the Shopify Storefront API. Spanish
  copy, COP. Shopify Checkout is **not** part of the flow.
- **Catalog** — products and variants managed in the Shopify admin; rendered
  headless via Storefront API. Personalization (e.g. engraving, size, material)
  captured as Shopify variants (structured options) and cart line `attributes`
  (free text).
- **Blog** — articles written in the Shopify admin, rendered via Storefront API
  (`blog` / `articleByHandle`). Editorial layout, SEO/OG metadata.
- **Cart + order assembly** — a Storefront API cart carries items, variants, and
  personalization attributes. No payment, no shipping address collection beyond
  what the buyer types as a note.
- **Order submission** — a "Send order" action reads the full cart, formats a
  structured message, and posts it to a Telegram channel via the Bot API
  `sendMessage`. The Telegram channel is the **only** record of the order in
  this MVP.
- **Single Hydrogen app** — one app, one deploy. No monorepo, no separate
  backend, no database. Server-side Remix actions hold the Telegram Bot API
  token; only the Storefront API public token is exposed client-side.

## Non-Goals

- **No Shopify Checkout, no payment gateway.** The cart never redirects to
  Shopify Checkout. Payment is settled externally (Nequi, transfer, cash) by
  Shirley, manually, on WhatsApp.
- **No Payload, no database, no ORM.** Catalog and blog live in Shopify; orders
  are **not persisted in a DB** — the Telegram channel is the only source.
- **No Telegram command bot.** Telegram is a one-way notification channel, not
  an interactive bot. No `/nuevo`, `/pagado`, `/despachado`, no webhook, no
  daily digest, no cron.
- **No order state machine.** Orders are not tracked through PAID / DISPATCHED
  states. Fulfillment happens entirely outside the system.
- **No customer authentication / accounts / order history.** The storefront is
  public; buyers submit orders anonymously.
- **No LLM in runtime.** The agentic layer (catalog Q&A, LLM-enriched intake,
  photo-to-product) is deferred — see the maturity ladder in the constitution.
- **No website-clone / Krafti port.** The storefront starts from the official
  Hydrogen starter, rebranded to Nénufar.
- **No Admin API usage in this MVP.** Only the Storefront API public token is
  used (no Draft Orders, no server-side Shopify mutations). Admin API may appear
  in the agentic phase.

## Known limitations (explicit, tracked)

- **Telegram-channel-only is a debt.** Because orders are not persisted, Shirley
  has no searchable history ("what did this customer order last month?"). This
  is acceptable for the MVP's low order volume, but it weakens the future
  agentic path (an agent needs persistent state). Resolution at agentic level 3+:
  re-introduce Shopify Draft Orders or a lightweight store.
- **PII in a Telegram channel.** Orders may carry customer name/phone/address.
  Whoever is a member of the channel sees that PII. Channel membership must be
  restricted to Shirley, and a privacy/consent treatment (Colombia Ley 1581 de
  2012) is a gap to address in the PRD.
