# ADR-001: Direct Human Sales Coordination over WhatsApp (No Automated Payment Gateway)

* **Status:** Accepted
* **Date:** 2026-08-21
* **Deciders:** Shirley (Store Owner), Engineering Team
* **Consulted:** Legal & Business Operations

---

## 1. Context and Problem Statement

Nénufar is an artisan handcrafted jewelry store in Cartagena, Colombia. Traditional e-commerce setups rely on automated payment gateways (e.g., Stripe, Wompi, PayU, MercadoPago) which deduct 3.5%–6% + fixed fees per transaction, require strict bank account registrations, and introduce cart abandonment when Colombian customers encounter unfamiliar gateway checkout modals.

Furthermore, handcrafted jewelry items often involve customization (ring sizing, chain length, gemstone variants, personalized gift notes) that automated gateways fail to handle gracefully.

How should customers submit orders and how should payments and physical dispatches be processed?

---

## 2. Decision Drivers

* **Zero Gateway Commission:** Preserve 100% of profit margins on handcrafted goods.
* **Cultural Alignment in Colombia:** Colombian buyers heavily prefer paying directly via P2P mobile transfers (**Nequi** and **Daviplata**) or direct Bancolombia bank transfers.
* **Human Warmth & Customization:** Direct touchpoint between Shirley and the customer to confirm customization details, gift wrapping, and courier delivery specifics.
* **Simplicity & Zero Stripe Dependency:** Setting `payments.paymentMethods: []` in `@payloadcms/plugin-ecommerce` removes external gateway SDK complexity.

---

## 3. Considered Options

* **Option 1: Automated Payment Gateway (Wompi / PayU / Stripe):** High fees, automated chargebacks, disconnected from WhatsApp customer relationship.
* **Option 2: WhatsApp Click-to-Chat without Persistent Orders:** Inability to track stock, lost metrics, order loss if chats are cleared.
* **Option 3 (Chosen): Hybrid Web Checkout → Persistent Payload Order → Instant Telegram Push → WhatsApp Closing:**
  1. The buyer selects items in the web store and fills a clean contact form (`/pedidos/enviar`).
  2. A server action (`submitOrderAction.ts`) persists the order in PostgreSQL (`orders` collection, `status: 'processing'`) with SHA256 idempotency protection.
  3. A formatted HTML notification is pushed instantly to Shirley's private Telegram channel (`@pedidos_nenufar`).
  4. Shirley initiates a personal WhatsApp conversation with the buyer to receive payment proof (Nequi/Daviplata) and coordinate shipping.

---

## 4. Decision Outcome

**Chosen Option:** **Option 3 (Hybrid Web Checkout with WhatsApp closing)**.

### Positive Consequences:
* **$0 Gateway Costs:** 0% transaction commission fees.
* **High Conversion Rate:** Fast checkout without forced registration or banking gateway redirects.
* **Safe State Persistence:** Every order is stored in PostgreSQL before Telegram notification occurs; if Telegram fails, the order is still safe in `/admin`.
* **Legal Compliance:** Validates explicit Colombian Habeas Data (Ley 1581 de 2012) consent before submission.

### Negative Consequences / Trade-offs:
* Requires Shirley's active participation to confirm payments and update order status manually (or via her Telegram bot).
* Potential delay between web submission and payment verification if Shirley is offline.

---

## 5. Pros and Cons of the Options

### Option 3 (Chosen)
* ✅ Full database audit trail in PostgreSQL.
* ✅ Instant push notification to Shirley's mobile phone via Telegram.
* ✅ Direct relationship building and repeat customer retention on WhatsApp.
* ❌ Manual reconciliation of Nequi/Daviplata payments.
