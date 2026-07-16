# PRD — Product Requirement Document
**Project:** Agento — Nénufar (Handmade Jewelry)
**Version:** 2.1 (MVP pivot — catalog + blog + CRM + Telegram command center)
**Date:** July 2026
**Supersedes:** v1.1 (agentic chat MVP, frozen) · v2.0 (audited, fixes applied)

---

## 1. Product Vision

Nénufar.com is a professional editorial storefront for Shirley's handmade
jewelry brand. It showcases her catalog and blog, routes interested buyers to
her WhatsApp via `wa.me`, and gives her a lightweight CRM (Payload admin) to
track orders. **Her phone is her office** — so a Telegram bot acts as her
mobile command center: she gets pinged when orders arrive, confirms payments
with `/pagado`, marks dispatches with `/despachado`, checks status with
`/pedido`, sends photos to create product drafts, and gets a daily digest at
9am. No chatbot talks to her customers. No LLM runs in runtime. The system is
Shirley's operational backbone, not her replacement.

---

## 2. User Stories

### Storefront (Capability 01)

| As a... | I want to... | So that... |
|---|---|---|
| End buyer | browse Nénufar's jewelry catalog on the web | see product photos, names, materials, and prices in COP without needing to ask |
| End buyer | read blog posts about the craft and the brand | feel trust and connection before contacting Shirley |
| End buyer | click a "Contactar por WhatsApp" button on any product | start a conversation with Shirley directly without a cold checkout form |
| Shirley | have my products shown beautifully in masonry/gallery layout | my brand looks premium and professional |
| Shirley | have a blog where I can tell the story of each collection | attract organic search traffic and build brand loyalty |

### Blog (Capability 02)

| As a... | I want to... | So that... |
|---|---|---|
| Shirley | write blog posts in the Payload admin with a rich text editor | publish content without touching code |
| Shirley | choose between standard, quote, and audio post formats | vary the editorial style of my blog |
| End buyer | see blog posts with cover images, author, date, and category | navigate and read content pleasantly |

### CRM — Payload Admin (Capability 03)

| As a... | I want to... | So that... |
|---|---|---|
| Shirley | log in to /admin and see two panels: Catalog and Dispatches | not be overwhelmed by a full e-commerce dashboard |
| Shirley | create and edit products (name, description, price COP, materials, images, available toggle) | keep my catalog up to date |
| Shirley | see all orders with their status (CHECKOUT_READY, PAID, DISPATCHED) | know what to pack and what to chase |
| Shirley | confirm a payment by clicking "Confirmar pago" on an order | the order moves to PAID and appears in the dispatch queue |
| Shirley | mark an order as dispatched | the order moves to DISPATCHED and leaves the active queue |
| Shirley | cancel an order (admin only, no Telegram command for this) | remove a mistaken or fraudulent order from the active queue |

### Telegram Command Center (Capability 04)

| As a... | I want to... | So that... |
|---|---|---|
| Shirley | receive a Telegram ping when a new order is created | know instantly without opening the laptop |
| Shirley | reply `/pagado AX-XXXX` in Telegram | confirm the payment from my phone, wherever I am |
| Shirley | reply `/despachado AX-XXXX` in Telegram | mark the order as dispatched in seconds |
| Shirley | send `/pedido AX-XXXX` in Telegram | check the full status and details of an order |
| Shirley | send `/pendientes` in Telegram | see all orders still pending payment or dispatch |
| Shirley | send `/help` in Telegram | see all available commands and their format at any time |
| Shirley | send a photo to the Telegram bot | create a product draft in Payload automatically (photo saved, available=false, name="Draft — {date}") so I can fill the details later |
| Shirley | send `/nuevo` with order details (customer name, address, products, total) | register an order manually from my phone when a customer writes me on WhatsApp |
| Shirley | receive a daily digest at 9am with yesterday's summary and today's pending items | get the pulse of my business in 5 seconds |

---

## 3. Functional Requirements

### 3.1 Storefront (Capability 01)

- The storefront UI was cloned from the Krafti reference site using the
  `ai-website-cloner-template` tool (JCodesMore,
  https://github.com/JCodesMore/ai-website-cloner-template). The resulting
  Next.js codebase is part of the Nénufar monorepo and lives at
  `apps/web/src/{components,hooks,lib,types}` and
  `apps/web/src/app/(app)/`. The clone is in its unbranded state — it still
  carries Krafti branding, English copy, and USD demo data — and MUST be
  rebranded to Nénufar (terracota `#a55e3f`, cream `#f4f2ee`, navy `#0d1e64`,
  Alegreya/Lato), translated to Spanish, and switched to COP. It is the
  storefront of Nénufar, not an external dependency.
- All storefront data MUST hydrate from Payload headless via Next.js server
  components (`getPayload({ config })`). NO hardcoded product/blog arrays.
  Components currently carrying static demo arrays from the clone
  (`HeroSection`, `ProductsCarousel`, `ShopMasonryList/ShopMasonryGrid`,
  `BlogHome/BlogPostCard`, `BlogSection`, `PortfolioGrid`, `TeamSection`,
  `StatsSection`, `TestimonialsSection`) MUST be refactored to consume
  Payload `products` / `posts`. Editorial sections from the Krafti reference
  that do not fit a Nénufar jewelry storefront (`SkillsSection`,
  `FeaturesSplitSection`, `FindStoreSection`, `TeamSection`, `StatsSection`,
  `CTABanner` if it does not route to `wa.me`) SHOULD be removed or
  repurposed; the per-component decision is documented in
  `specs/constitution.md` §8.
- The Navbar MUST show: Nénufar logo, "Inicio" → `/`, "Tienda" → `/tienda`,
  "Blog" → `/blog`, and a "WhatsApp" link to Shirley's number
  (`https://wa.me/{WHATSAPP_BUSINESS_NUMBER}`). There MUST be NO "Cart" or
  "Cart(0)" element — there is no cart in this MVP. The clone's Navbar still
  points to the reference routes `/blog-home` and `/product-list/masonry-list`
  — these are HARDBLOCKERS and MUST be updated to `/blog` and `/tienda`
  respectively. The Krafti logo image (`/images/main-logo.png`) MUST be
  replaced with the Nénufar wordmark/logo.
- The home page MUST render: Navbar → Hero → Masonry/Carousel of products
  (hydrated from `products` collection) → Blog section (hydrated from `Posts`)
  → Footer. Editorial section components inherited from the Krafti reference
  that are not part of this required home composition
  (`IntroductionSection`, `PortfolioGrid`, `TestimonialsSection`,
  `ShopCategoriesSection`, `FeaturesSplitSection`, `TeamSection`,
  `SkillsSection`, `StatsSection`, `CTABanner`, `FindStoreSection`) are
  EXCESS from the reference layout and MUST be either removed from
  `app/(app)/page.tsx` or repurposed only if they add real value to a
  jewelry storefront (e.g. `TestimonialsSection` repurposed as client
  reviews). The per-component decision is documented in
  `specs/constitution.md` §8.
- Each product card in the masonry/carousel MUST show: image (from
  `products.images` URL), name, materials, and price in COP
  (`Intl.NumberFormat('es-CO', {style:'currency', currency:'COP'})`). The
  clone's `ProductsCarousel` currently ships with USD demo prices
  (`$37.99`, "Wool Scarf", "Cinnamon Alba", "Organic food") — these hardcoded
  arrays MUST be replaced with Payload hydration; price formatting MUST
  switch from USD literal to COP via `Intl.NumberFormat('es-CO', ...)`.
- Each product card MUST have a CTA button: "Contactar por WhatsApp" that
  opens `https://wa.me/{WHATSAPP_BUSINESS_NUMBER}?text=Hola+Shirley,+vi+{productName}+en+nenufar.co`.
  There MUST be NO "Add to cart" action. The clone has no `wa.me` CTA —
  adding it to product cards in both `ProductsCarousel` and
  `ShopMasonryList/ShopMasonryGrid` is a MANDATORY refactor.
- Products with `available = false` MUST NOT appear on the storefront
  (masonry, carousel, or any public listing).
- The storefront MUST be in Spanish. All currency in COP. The clone ships in
  English with USD; copy AND currency formatting MUST be replaced.
- The storefront MUST be a public site with NO customer authentication.
- Storefront pages MUST use Next.js **ISR (Incremental Static Regeneration)**
  or on-demand revalidation to ensure sub-2s LCP without hitting the database
  on every request. Product/blog detail pages revalidate on Payload
  `afterChange` hook.
- Demo assets inherited from the Krafti reference under
  `apps/web/public/images/` (`main-rev-img-N.jpg`, `product-N.jpg`,
  `main-logo.png`) are placeholder-only. They MUST be replaced with Nénufar
  product photos before production deploy; keeping them in dev is acceptable
  for layout validation.

### 3.2 Blog (Capability 02)

- Payload MUST expose a `Posts` collection with fields: `title` (text),
  `excerpt` (textarea), `content` (Lexical rich text), `coverImage` (upload
  field, stored in Supabase Storage or local media during dev), `author`
  (text), `category` (text), `format` (select: `standard | quote | audio`),
  `audioUrl` (text URL to external hosting — e.g. Spotify, SoundCloud, or
  self-hosted audio file in Supabase Storage — shown only when format=audio),
  `quoteText` and `quoteAuthor` (text, shown only when format=quote),
  `publishedAt` (date), `slug` (text, auto-generated from title).
- The storefront MUST render blog routes: `/blog` (list with sidebar +
  pagination) and `/blog/[slug]` (single post, format-aware rendering).
- Blog list MUST show: cover image, title, author, date, category, excerpt,
  and "Leer más" link.
- Blog list pagination MUST show page numbers and "next/prev" navigation.
- Standard format MUST render: cover image + metadata + Lexical content.
- Quote format MUST render: blockquote (styled) + citation, no cover image.
- Audio format MUST render: cover image + metadata + audio player widget +
  Lexical content body.
- Blog posts MUST generate SEO metadata: `<title>`, meta description,
  Open Graph tags (og:title, og:description, og:image).
- Blog rendering MUST be responsive on mobile, tablet, and desktop.

### 3.3 CRM — Payload Admin (Capability 03)

- Payload admin (`/admin`) MUST be authenticated (collection `users` with
  `auth: true`). Shirley logs in with email + password.
- Payload MUST expose two operator-facing collections: `products` (Catalog) and
  `orders` (Dispatches). No "leads," no "funnel stages," no "Kanban."
- The `products` collection MUST include fields: `name`, `description`,
  `price_cop`, `materials` (array of text), `images` (array of {url}),
  `available` (checkbox, default true), `handoff_ttl_hours` (DEPRECATED, can
  remain in schema but unused in this MVP), `is_upsell` (checkbox, default
  false — unused in this MVP but available for the agentic phase).
- The `orders` collection MUST include fields: `sessionCode` (unique text,
  format `AX-XXXX`), `customerName` (text), `customerPhone` (text),
  `customerAddress` (textarea), `items` (array of {productId, name,
  price_cop, quantity}), `totalPrice` (number), `status` (select:
  `CHECKOUT_READY | PAID | DISPATCHED | CANCELLED`), `paymentMethod` (select:
  `Nequi | Transferencia | Efectivo`), `paidAt` (date), `dispatchedAt` (date).
- `orders.items` stores a **snapshot** of the product name and price at the
  moment the order was created. If a product's price changes later, existing
  orders MUST NOT be affected — the snapshot is immutable.
- `orders.status` MUST mutate ONLY via:
  - Admin "Confirmar pago" or Telegram `/pagado` → `PAID`
  - Admin "Marcar despachado" or Telegram `/despachado` → `DISPATCHED`
  - Admin "Cancelar" (admin only, no Telegram command) → `CANCELLED`
  - Admin "Crear order" or Telegram `/nuevo` creates order with
    `status = CHECKOUT_READY`
- The admin Dispatches view MUST show orders sorted by `status` priority:
  `CHECKOUT_READY` (urgent) → `PAID` (dispatch queue) → `DISPATCHED` /
  `CANCELLED` (history).
- Admin access control: Shirley can read, create, update everything. No
  public access to admin. (Simple `read: () => true` is a known limitation
  for MVP; formalized roles deferred.)

### 3.4 Telegram Command Center (Capability 04)

- A Telegram bot MUST be created via @BotFather (token stored in
  `TELEGRAM_BOT_TOKEN` env var).
- The bot MUST be a single Next.js route handler:
  `POST /api/webhooks/telegram` that receives Telegram updates.
- Telegram webhook MUST be registered on deploy via `setWebhook` API call,
  including a `secret_token` for request validation.
- **AUTH:** Only Shirley's Telegram user ID (stored in
  `SHIRLEY_TELEGRAM_CHAT_ID` env var) is authorized. Any message from other
  users MUST be ignored with a polite "No autorizado" response.

#### 3.4.1 Commands (Tier 1 — essential)

- **`/help`** — Lists all available commands with their format and a 1-line
  description. This is the fallback when Shirley forgets a command.
  ```
  Comandos disponibles:
  /nuevo — Registrar pedido (multiples líneas)
  /pagado AX-XXXX — Confirmar pago
  /despachado AX-XXXX — Marcar despachado
  /pedido AX-XXXX — Ver estado de pedido
  /pendientes — Ver pedidos pendientes
  /help — Ver esta ayuda
  📸 Foto — Crear draft de producto
  ```

- **`/nuevo`** — Register a new order manually. Format:
  ```
  /nuevo
  María Quintana
  Cartagena, Calle 123, 3214567890
  Collar Esmeralda — 180000
  Aros complementarios — 90000
  ```
  Bot parses lines: line 1 = customer name, line 2 = address + phone, lines 3+
  = items (name + separator + price). Bot creates `order` in Payload with
  `status: CHECKOUT_READY`, auto-generates `sessionCode` (AX-XXXX),
  responds with confirmation + code.
  **Error handling:** if the parse fails (wrong format, missing lines, invalid
  price), the bot responds with an error message + the correct format example:
  ```
  ❌ No entendí el formato. Ejemplo:
  /nuevo
  María Quintana
  Cartagena, Calle 123, 3214567890
  Collar Esmeralda — 180000
  Aros complementarios — 90000
  ```
  **Parser tolerance:** the separator between name and price accepts `—`,
  `-`, `:`, or `|` (any of these characters). Leading/trailing whitespace is
  trimmed. Price is parsed as integer (strip `$`, `.`, `,`, `COP`).
  If a product name in the item line matches an existing `products` document,
  the bot links `items[].productId` to it; otherwise `productId = null` and
  the item is free-text.

- **`/pagado AX-XXXX`** — Transitions order to `PAID`. Sets `paidAt = now`,
  `paymentMethod` prompted via follow-up (or defaults to `Nequi` if not
  specified). Responds: "✅ AX-XXXX marcado como PAID. A empacar 🌸"
  **Idempotency:** if already `PAID`, responds "Ya está confirmado ✅" without
  mutating.

- **`/despachado AX-XXXX`** — Transitions order to `DISPATCHED`. Sets
  `dispatchedAt = now`. Responds: "📦 AX-XXXX → DISPATCHED. ¡Buen envío!"
  **Idempotency:** if already `DISPATCHED`, responds "Ya está despachado 📦"
  without mutating.

- **`/pedido AX-XXXX`** — Returns full order details: customer name, address,
  phone, items (with names + prices), total, status, paid/dispatch timestamps
  if applicable.

- **`/pendientes`** — Returns a list of all `CHECKOUT_READY` and `PAID` (not
  dispatched) orders with their codes, customer names, and totals. Sorted by
  `CHECKOUT_READY` first, `PAID` second. If no pending orders, responds
  "✨ Todo al día. No hay pedidos pendientes."

#### 3.4.2 Passive pings (Tier 1 — essential)

- **New order ping:** When an order is created (via `/nuevo` or admin), the
  bot MUST send Shirley a Telegram message:
  ```
  🔔 Nuevo pedido
  Código: AX-H3B9
  Cliente: María Quintana
  Items: Collar Esmeralda + Aros
  Total: $270.000 COP
  → Confirmar pago: /pagado AX-H3B9
  ```

#### 3.4.3 Daily digest (Tier 1 — essential)

- A scheduled task (external cron service or Upstash QStash calling a Next
  route handler) MUST trigger at 09:00 America/Bogota daily.
- Digest message format:
  ```
  🌼 Buenos días, Shirley. Resumen de ayer:

  📦 Pedidos nuevos: 3
  ⏳ Por cobrar: 2 ($540.000 COP)
  ✅ Pagados ayer: 1 ($270.000 COP)
  📤 Pendientes despacho: 1 (AX-H3B9)

  → Ver pendientes: /pendientes
  ```
- If there was no activity yesterday, digest still sends with zeros:
  "Ayer sin movimiento. ¡Día tranquilo! 🌿"

#### 3.4.4 Photo-to-draft (Tier 2 — high value)

- When Shirley sends a photo to the bot (not a command), the bot MUST:
  - Download the photo via Telegram `getFile` API.
  - Store it in **Supabase Storage** (bucket: `product-drafts`) at path
    `draft-{timestamp}.jpg`. (`/public/` is NOT writable at runtime on
    Vercel — Supabase Storage is the required media store in production.)
  - Create a `products` document in Payload with `available: false`, `name` =
    `Draft — {YYYY-MM-DD}`, `images: [{url: "<supabase-storage-url>"}]`,
    all other fields empty (price_cop = 0, materials = [], description = "").
  - Respond: "📸 Producto creado como draft (ID: 47). Completá los datos en
    nenufar.co/admin/products/47"

#### 3.4.5 Telegram webhook security

- The webhook MUST validate the `X-Telegram-Bot-Api-Secret-Token` header
  against `TELEGRAM_WEBHOOK_SECRET` env var. Requests with invalid/missing
  secret MUST be rejected with 401.
- All commands that accept `AX-XXXX` MUST validate the format via regex
  `^AX-[A-Z2-9]{4}$` before touching the DB. Invalid format responds:
  "Código inválido. Formato esperado: AX-XXXX"
- The bot MUST respond to all messages (commands, photos, unrecognized text).
  Unrecognized text gets: "No entendí. Envía /help para ver comandos."

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Language & currency | Storefront copy: Spanish. Currency: COP. Telegram bot messages: Spanish. |
| Performance | Storefront pages MUST load in < 2s (LCP) using Next.js ISR + Turbopack. |
| Mobile-first | Storefront MUST be responsive (mobile, tablet, desktop). Shirley's primary device is her phone. |
| Type safety | End-to-end TypeScript across the monorepo. `payload-types.ts` and Drizzle schemas imported directly. `tsc --noEmit` blocks merge. |
| Security | Payload admin authenticated. Telegram webhook validates secret token + authorized chat ID. No public write access to `orders` or `products` collections. |
| Idempotency | `/pagado` and `/despachado` are idempotent — a second command on an already-PAID order returns "Ya está confirmado" without mutating. |
| Availability | Storefront is a static-ish Next.js app (ISR). Telegram webhook is a serverless route. No real-time WebSocket required. |
| Maintainability | No external orchestration tools (no n8n). All async work via Next route handlers + external cron (QStash or similar). |
| Cost | Zero recurring infrastructure cost in MVP. Next.js on Vercel free tier, Supabase free tier, Telegram Bot API is free, Payload is open-source. |

---

## 5. UI/UX Requirements

- **Storefront:** editorial design derived from the UI cloned out of the
  Krafti reference site (via the `ai-website-cloner-template` tool) and
  rebranded Nénufar — terracota `#a55e3f` + cream `#f4f2ee` + navy `#0d1e64`,
  Alegreya (headings) + Lato (body), zigzag borders, scalloped badges, masonry
  grid. Minimalist, high-contrast, no excessive animation. Reuse the cloned
  structural components (Navbar, HeroSection, Footer, ShopMasonryGrid,
  BlogHome/BlogPostCard, BlogSidebar) as the visual base; drop or repurpose
  editorial sections from the reference that do not fit a jewelry storefront
  (SkillsSection, FeaturesSplitSection, TeamSection, StatsSection,
  FindStoreSection).
- **No "Add to cart":** there is no cart icon in the Navbar, no cart count, no
  cart page. The only purchase path is "Contactar por WhatsApp."
- **Product cards:** photo, name, materials tags, price COP, CTA button
  "Contactar por WhatsApp" with WhatsApp icon.
- **Blog:** editorial list with sidebar (recent posts, categories), single
  post with format-aware rendering.
- **Admin (Payload):** utilitarian and functional, optimized for Shirley's
  operations (not customer-facing). Shows only Catalog, Dispatches, and Posts
  collections. Layout clarity > brand polish.
- **Telegram bot:** messages are short, structured, emoji-fronted, and
  actionable. Commands are 1-line. No menus, no inline keyboards (for MVP).

---

## 6. Acceptance Criteria

### Storefront (Capability 01)

- **AC-01.1** Given the storefront home renders, then Navbar, Hero,
  ProductsMasonry, BlogSection, Footer all hydrate from Payload via server
  components — NOT from hardcoded arrays.
- **AC-01.2** Given a product card in the masonry, when the user clicks
  "Contactar por WhatsApp", then `wa.me/{SHIRLEY_NUMBER}?text=Hola+Shirley,+vi+{productName}+en+nenufar.co` opens in a new tab.
- **AC-01.3** Given the Navbar, then there is NO cart icon, NO cart count,
  NO "Add to cart" button anywhere on the storefront.
- **AC-01.4** Given any product price displayed on the storefront, when it
  renders, then it shows COP formatted via `Intl.NumberFormat('es-CO',
  {style:'currency', currency:'COP'})`.
- **AC-01.5** Given a product with `available = false` in Payload, when the
  storefront masonry/carousel renders, then that product does NOT appear.
- **AC-01.6** Given the storefront is viewed on a mobile device (375px width),
  when it renders, then all sections (Navbar, Hero, Masonry, Blog, Footer)
  are responsive and legible without horizontal scrolling.
- **AC-01.7** Given the storefront renders, when the Navbar is inspected,
  then all navigation links point to `/` (Inicio), `/tienda` (Tienda),
  `/blog` (Blog), and `https://wa.me/{WHATSAPP_BUSINESS_NUMBER}` (WhatsApp)
  — NOT to the original reference routes `/blog-home` or
  `/product-list/masonry-list` that the clone inherited from Krafti. The
  Krafti logo image (`/images/main-logo.png`) is replaced with the Nénufar
  wordmark/logo.
- **AC-01.8** Given the cloned UI components inherited from the Krafti
  reference, when the storefront is reconciled against Nénufar's scope,
  then: (a) no component renders hardcoded USD demo prices or English copy
  from the clone's static arrays (e.g. `ProductsCarousel`'s `$37.99` "Wool
  Scarf" / "Cinnamon Alba" are GONE); (b) every product card surfaces data
  hydrated from Payload `products`; (c) every product card includes a
  "Contactar por WhatsApp" CTA; (d) editorial sections from the reference
  that do not match a jewelry storefront (`SkillsSection`,
  `FeaturesSplitSection`, `FindStoreSection`, `TeamSection`,
  `StatsSection`) are either removed from `app/(app)/page.tsx` or
  repurposed with content sourced from Payload, with the per-component
  decision documented in `specs/constitution.md` §8.

### Blog (Capability 02)

- **AC-02.1** Given Shirley creates a `Posts` document with `format = 'quote'`
  in Payload, when the blog page renders, then the post displays as a
  blockquote + citation (no cover image, no article body).
- **AC-02.2** Given a standard blog post with a cover image, when the
  `/blog/[slug]` page renders, then the cover image, metadata (author, date,
  category), and Lexical content all display correctly.
- **AC-02.3** Given the `/blog` list page with more than 10 published posts,
  when it renders, then pagination controls (page numbers + next/prev) appear
  and navigate correctly.
- **AC-02.4** Given any published blog post, when the `/blog/[slug]` page
  renders, then the HTML `<head>` includes `<title>`, meta description, and
  Open Graph tags (og:title, og:description, og:image) with correct values
  from the post.

### CRM — Payload Admin (Capability 03)

- **AC-03.1** Given Shirley navigates to `/admin`, when she is not logged in,
  then she sees a login form. When she logs in, then she sees the Payload
  dashboard with Catalog and Dispatches collections.
- **AC-03.2** Given an order in `CHECKOUT_READY` status, when Shirley clicks
  "Confirmar pago" in the admin, then the order transitions to `PAID` and
  `paidAt` is set to now.
- **AC-03.3** Given an order in `PAID` status, when Shirley clicks "Marcar
  despachado", then the order transitions to `DISPATCHED` and `dispatchedAt`
  is set to now.
- **AC-03.4** Given the Dispatches view in admin, orders are sorted by status
  priority: `CHECKOUT_READY` first, `PAID` second, `DISPATCHED`/`CANCELLED`
  last.
- **AC-03.5** Given an order created with an item "Collar Esmeralda — $180.000",
  when the product's price is later changed to $200.000 in Payload, then the
  existing order's item price remains $180.000 (snapshot is immutable).

### Telegram Command Center (Capability 04)

- **AC-04.1** Given Shirley sends `/nuevo` with customer name, address, and
  item lines, when the bot parses the message, then an `order` is created in
  Payload with status `CHECKOUT_READY`, a unique `AX-XXXX` code is generated,
  and a confirmation ping is sent back to Shirley.
- **AC-04.2** Given Shirley sends `/nuevo` with a malformed payload (missing
  lines, invalid price, wrong structure), when the bot parses it, then it
  responds with an error message and a format example — and NO order is
  created.
- **AC-04.3** Given an order `AX-H3B9` in `CHECKOUT_READY`, when Shirley sends
  `/pagado AX-H3B9`, then the order transitions to `PAID`, `paidAt` is set,
  and the bot responds with a success message.
- **AC-04.4** Given an order `AX-H3B9` already in `PAID`, when Shirley sends
  `/pagado AX-H3B9` again, then the bot responds "Ya está confirmado ✅"
  without mutating the order (idempotency).
- **AC-04.5** Given an order `AX-H3B9` in `PAID`, when Shirley sends
  `/despachado AX-H3B9`, then the order transitions to `DISPATCHED`.
- **AC-04.6** Given Shirley sends `/pedido AX-H3B9`, when the bot processes it,
  then the response includes customer name, address, phone, items, total,
  status, and relevant timestamps.
- **AC-04.7** Given Shirley sends `/pendientes`, when the bot processes it,
  then the response lists all `CHECKOUT_READY` and `PAID` (not DISPATCHED)
  orders with codes, customer names, and totals — or "✨ Todo al día" if none.
- **AC-04.8** Given Shirley sends `/help`, when the bot processes it, then it
  responds with a list of all available commands and their format.
- **AC-04.9** Given a new order is created (via `/nuevo` or admin), when the
  creation completes, then the bot sends Shirley a Telegram ping with order
  summary and the `/pagado` command hint.
- **AC-04.10** Given it is 09:00 America/Bogota, when the scheduled task fires,
  then Shirley receives the daily digest message with yesterday's summary and
  today's pending items.
- **AC-04.11** Given Shirley sends a photo (not a command) to the bot, when the
  bot processes it, then the photo is downloaded and stored in Supabase
  Storage, a `products` document is created in Payload with `available: false`
  and `name = "Draft — {date}"`, and the bot responds with the admin edit URL.
- **AC-04.12** Given a Telegram webhook request with an invalid
  `X-Telegram-Bot-Api-Secret-Token` header, when it arrives, then it is
  rejected with 401 and no further processing occurs.
- **AC-04.13** Given a Telegram message from a chat ID that is NOT Shirley's
  authorized ID, when the bot processes it, then it responds "No autorizado"
  and ignores the command.
- **AC-04.14** Given Shirley sends unrecognized text (not a command, not a
  photo), when the bot processes it, then it responds "No entendí. Envía
  /help para ver comandos."

---

## ChangeLog

### v2.0 → v2.1 (audit fixes)

- **B1 fixed (cloned UI integration):** §3.1, §5, BRD §3.1 Cap 01 now
  describe the storefront as a UI cloned from the Krafti reference site via
  the `ai-website-cloner-template` tool (JCodesMore). The cloned code is
  part of the Nénufar monorepo at `apps/web/src/{components,hooks,lib,types}`
  with routes under `apps/web/src/app/(app)/`. Refactor requirements against
  the unbranded clone state (Navbar links `/blog-home` → `/blog`,
  `/product-list/masonry-list` → `/tienda`; Krafti logo → Nénufar;
  hardcoded USD demo arrays → Payload hydration; no `wa.me` CTA → add on
  every product card; English copy → Spanish COP) are now explicit MUSTs.
- **B2 fixed:** §3.1 lists the cloned components to REUSE structurally
  (Navbar, HeroSection, Footer, ShopMasonryGrid, BlogHome/BlogPostCard,
  BlogSidebar) and the editorial sections inherited from the reference to
  DROP or REPURPOSE (SkillsSection, FeaturesSplitSection, TeamSection,
  StatsSection, FindStoreSection, TestimonialsSection, CTABanner,
  PortfolioGrid, ShopCategoriesSection). The per-component decision is
  deferred to `specs/constitution.md` §8.
- **B3 fixed:** AC-01.7 and AC-01.8 added to lock the post-rebrand state
  (Navbar routes, logo replacement, no hardcoded USD/demo copy, Payload
  hydration, `wa.me` CTA presence, excess-section handling). AC count is now
  30 (8 storefront + 4 blog + 5 CRM + 13 Telegram).
- **E3 fixed:** `/cancelar` command removed from Telegram. Order cancellation
  is admin-only (no Telegram command). PRD §3.3 and §3.4 corrected.
- **E4 fixed:** Photo-to-draft storage changed from `/public/` (read-only on
  Vercel) to Supabase Storage. PRD §3.4.4 corrected.
- **E5 fixed:** Changelog direction arrow corrected (v2.0 → v2.1, not v2.0 → v1.1).
- **E6 fixed:** AC count recalculated — 30 ACs total after B3 (was 28): 8
  storefront + 4 blog + 5 CRM + 13 Telegram.
- **G1 fixed:** `/help` command added to §3.4.1, user stories, and AC-04.8.
- **G2 fixed:** `/nuevo` error handling specified — bot responds with format
  example on parse failure. AC-04.2 added.
- **G3 fixed:** `/nuevo` parser tolerance documented: accepts `—`, `-`, `:`,
  `|` as separators; strips `$ . , COP` from price; trims whitespace;
  free-text fallback if product not found. PRD §3.4.1 updated.
- **G4 fixed:** `available: false` products explicitly excluded from
  storefront. AC-01.5 added.
- **G5 fixed:** ISR / on-demand revalidation specified for storefront pages.
  PRD §3.1 updated.
- **G6 fixed:** `coverImage` specified as upload field (Supabase Storage).
  `audioUrl` specified as external URL (Spotify/SoundCloud or self-hosted in
  Supabase). PRD §3.2 updated.
- **G7 fixed:** `orders.items` snapshot semantics documented — immutable
  price snapshot, not a live FK. AC-03.5 added.
- **G8 fixed:** ACs added for blog pagination (AC-02.3), SEO metadata
  (AC-02.4), mobile responsiveness (AC-01.6), `/help` (AC-04.8), unrecognized
  text fallback (AC-04.14).
- **M3 fixed:** Masonry route unified to `/tienda` (not `/product-list/masonry-list`).
  PRD §3.1 Navbar uses "Tienda" → `/tienda`.
- **M4 fixed:** `paymentMethod` changed from free text to `select: Nequi |
  Transferencia | Efectivo`. PRD §3.3 updated.
- **M5 fixed:** Admin UI description changed from "brutalist style kept" to
  "utilitarian and functional, optimized for Shirley's operations (not
  customer-facing). Layout clarity > brand polish." PRD §5 updated.

### v1.1 → v2.0 (pivot)

- **Agentic features REMOVED from MVP.** No discovery agent, no closing agent,
  no `streamText`, no tool cards, no `useChat`, no `/chat` route, no
  `<DiscoveryChat />`, no handoff sessions, no `finalizeOrder`, no RAG, no
  pgvector, no Gemini in runtime.
- **Storefront simplified.** No "chat declarative" CTA — replaced by direct
  `wa.me` WhatsApp link. Masonry is a browseable gallery, not a funnel entry.
- **Blog ADDED as a capability.** v1.1 had storefront but not blog as a
  spec'd capability. Now spec 02 covers it fully.
- **CRM simplified.** No `upsell_pairings`, no `token_usage_logs`, no
  Catalog Analyst, no Conversation Compressor. Just `products` + `orders` +
  `posts`.
- **Telegram introduced.** v1.1 had Telegram rejected as a customer channel.
  v2.0 reframes it as Shirley's command center — a completely different use
  case with Tier 1 + Tier 2 features.
- **`/nuevo` manual input.** Shirley IS the context layer: she bridges
  WhatsApp/Instagram → system by typing `/nuevo` in Telegram. No social
  media API integrations.
- **Photo-to-draft.** New feature not present in any prior version. Removes
  the laptop friction of catalog management.
- **Daily digest.** New passive feature. Shirley gets business pulse at 9am.
- **Commands.** `/pagado`, `/despachado`, `/pedido`, `/pendientes`, `/nuevo`,
  photo upload — all new in v2.0.
- **No LLM in MVP.** Removed all `maxSteps`, token-cost, `streamText`,
  `searchCatalog`, `createHandoff`, `finalizeOrder`, `recommendUpsell`
  requirements.
- **Channel for customer: WhatsApp manual.** Customer clicks `wa.me` on the
  storefront, writes to Shirley on WhatsApp, Shirley manually inputs the
  order via `/nuevo` in Telegram. No automation, no bot for customers.
- **ACs rewritten.** v1.1 had ACs for discovery, handoff, closing, Catalog
  Analyst, observability. v2.0 has ACs for storefront, blog, CRM, and
  Telegram commands.
- **NFRs simplified.** No `maxSteps`, no token-cost NFR, no Pre-LLM Guardian.
  Added mobile-first NFR (Shirley's primary device). Added zero-recurring-cost
  NFR.