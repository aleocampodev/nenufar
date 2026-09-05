# 🏛️ The Engineering Constitution of Nénufar

**Canonical Source of Truth & Governance Standard**  
*Version:* 1.0.0  
*Effective Date:* 2026-08-22  
*Authority:* Approved by Ale & Core Engineering  

---

## Preamble

We, the engineers, maintainers, and autonomous AI agents contributing to **Nénufar**, establish this Constitution as the supreme operational and technical standard for the codebase. Every line of code, pull request, architecture proposal, and agent execution must strictly comply with the articles set forth herein.

---

## Article I — Business Model & Operating Philosophy

1. **Brand Identity & Origin:** Nénufar is an artisan handcrafted jewelry atelier founded by Shirley in Cartagena de Indias, Colombia.
2. **Physical-Digital Synergy:** The web storefront (`nenufar.co`) serves as an interactive showcase, catalog, and post-fair re-order mechanism for clients who meet Shirley in person at artisan fairs and pop-ups.
3. **The Zero-Stripe Human Closing Model (ADR-001):** 
   - No automated credit card payment gateway is integrated.
   - The checkout journey is strictly: `Cart (/shop) → Order Form (/pedidos/enviar) → Telegram Channel Push (@pedidos_nenufar) + Payload Order Record → Human closing via WhatsApp by Shirley`.
   - Shirley coordinates payment (Nequi, Daviplata, Bancolombia transfer) and logistics manually.

---

## Article II — The Zero-Cost Financial Policy ($0/mo Policy #253)

1. **Zero Recurring SaaS Costs:** Under no circumstance shall any dependency or architectural decision introduce paid per-token LLM charges or fixed monthly software subscriptions.
2. **Inference Gateway Architecture (ADR-002):**
   - The AI management bot engine is powered by `@anthropic-ai/claude-agent-sdk`.
   - All Anthropic Messages API traffic is routed through a local **LiteLLM Universal Proxy (`:4000`)** pointing to **Groq Cloud Free Tier (`groq/llama-3.3-70b-versatile`)**.
   - Automated secondary fallback is configured to **Google Gemini 2.0 Flash** via LiteLLM.
   - `drop_params: true` is mandatory in LiteLLM config to prevent non-Anthropic parameter rejection.
   - Use of paid Anthropic/OpenAI API keys is strictly prohibited.

---

## Article III — Git & Branching Governance (Zero-Tolerance Policy)

1. **Absolute Push & Merge Ban on `main`:**
   - It is strictly forbidden to run `git push origin main` or commit directly to the `main` branch.
   - Any attempt to push or merge to `main` without an external Pull Request is a critical breach of protocol.
2. **Worktree Isolation Standard:**
   - All feature development, refactors, documentation, and bug fixes must occur exclusively on dedicated feature branches (`feature/<scope>/<desc>` or `fix/<scope>/<desc>`) hosted within isolated Git Worktrees (e.g., `../nenufar-<feature>`).
3. **PR-Only Integration:** Merges to `main` must occur solely via Pull Request review on the remote Git platform.

---

## Article IV — Architectural Invariants & Stack Standards

1. **Embedded Monolith (ADR-003):** Next.js 15 App Router and Payload CMS v3 run within the same Node.js process.
2. **Payload Local API First:** Internal business logic and agent tools must invoke Payload Local API (`getPayload({ config })`) with zero HTTP network overhead.
3. **Port Invariant:** The Next.js development server strictly runs on **port 3002** (`-p 3002`), never port 3000.
4. **Webhook Routing Invariant:** Shirley's bot webhook endpoint is strictly located at `/telegram/webhook`, never under `/api/...` (to avoid collision with Payload's catch-all router).

---

## Article V — Security, Legal & Privacy Hardening

1. **Colombian Habeas Data Compliance (Ley 1581 de 2012):**
   - The checkout form must require explicit customer consent (`consent === 'on'`) prior to persisting customer contact data.
2. **Telegram Bot Single-Admin Guard:**
   - The management bot is **exclusively for Shirley**.
   - Incoming webhook messages must validate `x-telegram-bot-api-secret-token` and verify that `chat_id === Number(process.env.TELEGRAM_ADMIN_CHAT_ID)`.
   - Unauthorized senders must be rejected silently with HTTP `200 OK` (to prevent Telegram retry storms).
3. **Checkout Idempotency:** Duplicate checkout submissions must be prevented using an in-memory SHA256 hash window of 5 minutes (`cartId + buyerContact`).

---

## Article VI — Engineering Standards, Localization & Definition of Done (DoD)

1. **Language Separation Boundary (Bilingual Architecture):**
   - **User-Facing Layer (Strictly Spanish `es-CO`):** All customer-facing storefront UI, product catalog details, cart, checkout form, confirmation screens, validation toasts, and Shirley's Telegram management bot messages must be written in Spanish.
   - **Engineering & Project Layer (Strictly English):** All source code, variable/function identifiers, code comments, commit messages, PR descriptions, SDLC technical specifications, Architecture Decision Records (ADRs), and this Constitution must be written in English.
2. **Colombian Currency & Symbol Invariant:**
   - Prices must always be displayed formatted as Colombian Pesos using the currency symbol (`$`) with period thousands separators and **zero decimal places**:
     `new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })` (renders as `$ 45.000`).
   - **Prohibition of "COP" Suffix in UI:** Never render or append the literal string `"COP"` in user-facing text, storefront prices, or Telegram messages (e.g., render `$ 120.000`, never `120.000 COP` or `$120.000 COP`).
3. **Brand Tokenization:** All UI magenta styling must utilize the CSS token `--brand: var(--brand-primary)` (`#E91E8C`, secondary `#3B032F`) via Tailwind classes `bg-brand`, `text-brand`, and `hover:bg-brand-dark`.
4. **Pre-Existing TypeScript Exceptions:**
   - Known pre-existing typing issues in Payload ecommerce generated types (`slug`, `paymentMethod` in seed) must be respected and preserved as documented. Agents must not waste cycles attempting to refactor upstream plugin types.
5. **Quality Gates for Pull Requests:**
   - Clean `pnpm lint`.
   - Clean `pnpm build` (ignoring documented pre-existing TS plugin exceptions).
   - No sensitive `.env` secrets committed.

---

## Article VII — Multi-Agent SDLC & Execution Protocol

1. **Vertical Task Slicing:** Complex features must be broken into small, testable tasks of size **S** (1-2 files) or **M** (3-5 files) following `planning-and-task-breakdown`.
2. **Plan & Backlog Tracking:** All active execution must maintain and update `tasks/plan.md` and `tasks/todo.md`.
3. **Handoff Artifacts:** Major architectural migrations must provide a dedicated handoff specification (e.g., `docs/HANDOFF-*.md`) before code execution.
