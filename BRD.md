# BRD-001: Business Vision & Commercial Infrastructure - Project Agento

## Status
Accepted

## Purpose
Define the business justification, strategic value, operational constraints, success metrics, and risks for the Agento platform. This document acts as the supreme business authority; it guarantees that the engineering team does not execute complex automations, AI investments, or sensitive architectural changes without traceable and mathematically profitable commercial alignment.

## Business Context
Agento was born to solve a critical inefficiency in niche e-commerce, specifically modeled for high-value handicrafts and custom manufacturing operations in Cartagena (Shirley's operation). 

The current market presents an insurmountable friction:
1. **The Failure of Passive E-commerce:** Customers purchasing items with a strong aesthetic, cultural, or customized component rarely buy through a traditional web cart flow ("cold self-service"). They demand a consultative sales process to validate dimensions, wood types, or engravings.
2. **The Collapse of the Conversational Channel:** To satisfy this need, businesses redirect traffic to WhatsApp. This generates a bottleneck where the human operator wastes up to 60% of their time responding to "curious window shoppers" with basic catalog or price questions, losing focus on customers with real buying intent.

Agento transforms this friction into a **Two-Phase Agentic Commerce** model. It deploys a system where Artificial Intelligence acts as an autonomous sales closer that absorbs 100% of the qualification on the web and executes the final negotiation on WhatsApp, isolating the human from any interaction other than dispatching paid merchandise.

## Impacted Users or Actors
The system is designed to serve two profiles with radically different needs:

1. **The End Buyer (B2C Customer / Tourist / Corporate Client):**
   * **Profile:** Impulse buyers, domestic/international tourists, or clients looking for corporate gifts. 
   * **Pain Point:** They seek zero friction. They are not willing to navigate complex menus, create accounts with passwords, or fill out long shipping forms on an unknown local website.
   * **Expectation:** Instant VIP attention (< 3 seconds of latency), natural language responses (adaptable to their native language without setup), and payment completion in a high-trust environment (WhatsApp).

2. **The Business Operator (B2B Administration):**
   * **Profile:** Solopreneurs or small manufacturing teams who do not have time to be "data analysts."
   * **Pain Point:** They hate traditional management software (CRMs) because it requires manual data entry (creating contacts, moving Kanban cards, logging orders). 
   * **Expectation:** An "Intrinsic CRM". A system that operates like a simple cash register. They only want to interact with the platform to upload new inventory and review a list of "Technical Dispatch Sheets" with paid orders ready to be packaged.

## Problem / Opportunity (Viability & Unit Economics)
The core opportunity of Agento lies in manipulating operating margin through AI, but it is subject to non-negotiable mathematical constraints.

**The Infrastructure Cost Equation:**
Each transaction managed by Agento generates a variable cost composed of Vercel AI SDK tokens (OpenAI) and the Meta Cloud API connectivity fee. A complete interaction up to closing consumes approximately **~$0.20 USD (approx. 800 COP)**.

**The High AOV (Average Order Value) Opportunity:**
* If a product is sold for 40,000 COP (e.g., a utilitarian handicraft), the transactional cost of 800 COP represents exactly **2% of the sale**. This cost is lower than traditional bank commissions, fully justifying delegating the sale to AI.
* **The Upselling Multiplier:** By freeing the human from customer service, the LLM has the commercial directive to perform conversational upselling. If a base piece costs 40,000 COP, the agent will actively offer a personalized engraving for an additional 15,000 COP, maximizing the contribution margin of every intercepted lead.

## MVP Scope
The scope of the Minimum Viable Product (MVP) to be implemented in the monolithic architecture (Next.js) strictly includes:

1. **Web Semantic Discovery (Zero Passive Menus):**
   * Elimination of traditional navigation.
   * Implementation of "Intent Chips" tied to a deterministic taxonomy (e.g., *Decor, Utilitarian, Teak Wood, Resin*).
   * Real-time UI generation based on RAG (Vector Search) to display only what the customer wants.
2. **State Bridge (Transactional Handoff):**
   * Ability to "freeze" user intent in the database, generating a unique short code (e.g., `AX-892`).
   * Frictionless redirection to WhatsApp carrying this state.
3. **Omnichannel Autonomous Closing (WhatsApp):**
   * Automatic context rehydration: the agent knows what the customer saw on the web without asking.
   * Logistical negotiation, handling objections, and dispatching payment links (Wompi/Stripe).
4. **Intrinsic CRM & Strict Taxonomy:**
   * Use of Payload CMS 3.0 to govern inventory.
   * Configuration of the commercial flag `isCustomizable: true` to mathematically enable upselling in the agent.
   * Automatic generation of "Technical Dispatch Sheets" after payment verification.

## Out of Scope
To protect the business vision and avoid over-engineering (anti-patterns), Agento **WILL NOT** include:
* **Low-Ticket Models (Commodities):** Prohibited to adapt the system to sell low-margin products (e.g., phone cases for 10,000 COP) where the 800 COP of AI costs destroy profitability.
* **Manual Lead Management:** Prohibited to build Kanban boards, visual sales funnels, or require the human operator to manually assign commercial states. State mutates via code.
* **Fragmented Orchestration (No-Code):** Prohibited to use third-party tools (n8n, Make, Zapier) to manage webhooks or flows. Everything must reside in the monolith to avoid network latency and loss of type context.
* **Native Web Shopping Carts:** Payment is not completed on the web domain; the web only qualifies and intercepts, and the transaction is invariably executed in the conversational environment.

## Success Metrics
* **Omnichannel Response SLA:** Latency under 3 seconds in WhatsApp interactions.
* **Human Intervention (Automation Rate):** 0% human participation in quoting, sending catalog photos, and billing cycles.
* **Financial Efficiency:** The consolidated cost of LLM + Meta API must not exceed 2.5% of the value of any order closed by the system.

## Operational Risks
* **API Budget Drain (Token Drain):** Users using the commercial WhatsApp number as a general AI chatbot, consuming tokens without purchase intent. This will be mitigated by limiting the LLM's context and setting a cap on interactions per session.
* **Commercial Hallucinations:** The model offering out-of-stock products or inventing discounts. This will be mitigated through strict validation schemas (Zod) linked to the real-time database; if it does not exist in Drizzle ORM, the AI cannot offer it.
* **Serverless Environment Limitations:** The time for text generation and omnichannel routing exceeding the timeout limits (10-15s) of the cloud provider's Edge/Serverless functions.

## Assumptions
* The Latin American end-user's trust in completing economic transactions through links shared on WhatsApp is higher than conversion in web carts of unknown local brands.
* Commercial administration of inventory (binary availability and photo uploads) will be rigorously executed by business staff through Payload CMS, ensuring the source of truth is always clean.

## Open Questions
* What will be the exact fallback protocol (transfer to a human operator) if the payment link validation in Wompi/Stripe takes longer than expected or fails due to bank rejection?
* How will the Handoff code expiration (e.g., `AX-892`) be structured if the customer generates intent on the web but takes more than 24 hours to send the WhatsApp message?