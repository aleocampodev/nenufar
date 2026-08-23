# IP-002: Storefront & Checkout Hardening

> **Autonomous Agent Implementation Document**  
> **Date:** 2026-08-23  
> **Status:** In Progress  
> **Branch:** `feature/storefront/checkout-hardening`  
> **Worktree:** `/home/ale/Work/nenufar-checkout`  
> **Related specifications:**  
> - [`docs/specs/SPEC-001-storefront-checkout.md`](file:///home/ale/Work/nenufar/docs/specs/SPEC-001-storefront-checkout.md)  
> - [`docs/specs/PRD.md`](file:///home/ale/Work/nenufar/docs/specs/PRD.md)  
> - [`CONSTITUTION.md`](file:///home/ale/Work/nenufar/CONSTITUTION.md) (Articles I, V, VI)  
> - [`docs/adr/ADR-001-no-payment-gateway-human-closing.md`](file:///home/ale/Work/nenufar/docs/adr/ADR-001-no-payment-gateway-human-closing.md)  

---

## 1. Executive Summary and Objective

Harden the checkout and order submission pipeline in Nénufar. Enforce strict SHA256 idempotency hashing (5-minute window), real-time stock verification against Payload Local API before order creation, robust Colombian WhatsApp contact validation, and resilient error recovery.

### Hard Constraints (Constitution):
1. **Article I / ADR-001:** Zero-Stripe model. Form submissions create an `Order` record with status `processing` and send notifications to Shirley's Telegram channel for human closing on WhatsApp.
2. **Article V § 1:** Colombian Habeas Data (Ley 1581 de 2012) explicit consent requirement.
3. **Article V § 3:** Duplicate checkout submissions must use an in-memory SHA256 hash window of 5 minutes (`cartId + buyerContact`).
4. **Article VI § 1:** User-facing text in Spanish (`es-CO`), technical code/comments in English.
5. **Article VI § 2:** Currency formatted as COP (`$ 45.000`), never render literal `"COP"` suffix in UI.

---

## 2. Detailed Task Breakdown (Vertical Slices)

### 🔹 Phase 1: SHA256 Idempotency Engine
* **Task 1.1:** Refactor `src/lib/idempotency.ts` to implement `generateIdempotencyKey(cartId, buyerContact)` using `crypto.createHash('sha256')` with 5-minute TTL (`5 * 60 * 1000`).
* **Task 1.2:** Write unit/integration tests for idempotency key generation, collision prevention, and expiration cleanup in `tests/int/idempotency.int.spec.ts`.

### 🔹 Phase 2: Checkout Server Action & Inventory Hardening
* **Task 2.1:** Update `src/app/(app)/pedidos/enviar/submitOrderAction.ts` to:
  * Integrate SHA256 idempotency with `cartId` and `buyerContact`.
  * Validate Colombian WhatsApp contact formats (`+57` / 10-digit mobile).
  * Validate inventory availability for all items in the cart before order creation. Return clear Spanish error messages when stock is insufficient.
  * Populate Payload `Order` with `status: 'processing'` and full shipping/contact details.
* **Task 2.2:** Update `src/app/(app)/pedidos/enviar/OrderForm.tsx` with enhanced form validation UX and accessibility attributes.

### 🔹 Phase 3: Integration Test Suite & Verification
* **Task 3.1:** Implement `tests/int/checkout.int.spec.ts` covering:
  * Valid submission flow (Order created + Telegram notification + Idempotency registered).
  * Duplicate submission detection (Redirects to existing order confirmation).
  * Out-of-stock validation rejection.
  * Missing consent (Ley 1581) rejection.
  * Invalid phone number format rejection.
* **Task 3.2:** Execute full test suite `pnpm test:int` and verify quality gates.

---

## 3. Definition of Done (DoD)
- [ ] SHA256 idempotency with 5-minute window implemented.
- [ ] Stock availability check active in `submitOrderAction.ts`.
- [ ] Colombian WhatsApp validation active.
- [ ] All integration tests passing (`pnpm test:int`).
- [ ] `tasks/plan.md` and `tasks/todo.md` updated.
