# SPEC-005: Landing Page Refinements, Direct WhatsApp Closing & Google Calendar Synchronization

* **Author:** Engineering Team
* **Status:** Implemented & Verified
* **Related ADR:** [ADR-001](../adr/ADR-001-no-payment-gateway-human-closing.md), [ADR-003](../adr/ADR-003-payload-embedded-monolith-local-api.md)
* **Primary Source Files:**
  * `src/heros/SliderHero/Component.client.tsx`
  * `src/heros/SliderHero/Component.tsx`
  * `src/blocks/CallToAction/Component.tsx`
  * `src/blocks/UpcomingEvents/Component.tsx`
  * `src/blocks/UpcomingEvents/Calendar.client.tsx`
  * `src/blocks/UpcomingEvents/config.ts`
  * `src/lib/google-calendar.ts`
  * `src/app/(app)/api/calendar/sync/route.ts`
  * `src/app/(app)/pedidos/enviar/OrderForm.tsx`
  * `src/components/Footer/index.tsx`

---

## 1. System Overview

This specification details the frontend refinement and external calendar synchronization delivered for Nénufar:
1. **Slider Hero Prismara Redesign:** Luxury two-column editorial slider with Ken Burns effect, arched roman frame, and category reveals.
2. **Direct WhatsApp Closing:** Removal of redundant `/contacto` page; routing "Personalizar mi Joya" directly to Shirley's WhatsApp with a pre-filled message.
3. **Google Calendar Synchronization:** Automated, zero-cost ($0/month) bidirectional iCal synchronization between Shirley's personal Google Calendar and the storefront's "Talleres & Ferias" interactive calendar.
4. **Checkout & Mobile Normalization:** Simplified Colombian 10-digit mobile number entry with automatic E.164 normalization for storage and Telegram alerts.

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Shirley's Mobile Phone (Google Calendar App)                             │
│    Shirley creates/edits workshops & fairs in Google Calendar               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Public / Secret iCal Feed (.ics)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. Nénufar Backend (Next.js Server Components & /api/calendar/sync)         │
│    - RFC 5545 iCal Parser (src/lib/google-calendar.ts)                      │
│    - 5-Minute Cache Revalidation (next: { revalidate: 300 })                │
│    - Keyword Type Classification (taller / feria / pop-up)                  │
│    - Graceful fallback to Payload 'events' collection                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Parsed EventItem[] + isGoogleCalendarSynced
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Storefront UI (/ & #talleres)                                            │
│    - CalendarClient renders active month with event dots                    │
│    - Live status indicator: "Google Calendar" pulse badge                   │
│    - Direct WhatsApp closing: CallToAction -> wa.me/?text=...               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Subsystem Specifications

### 3.1. Google Calendar Synchronization Subsystem (`src/lib/google-calendar.ts`)
* **Protocol:** Standard RFC 5545 iCal over HTTPS (public or secret `.ics` URL).
* **Zero-Cost Guarantee:** Free-tier compliant; no Google Cloud paid APIs or OAuth 2.0 refresh token expiration cycles.
* **Date Parsing:** Handles UTC datetimes (`Z`), all-day dates (`YYYYMMDD` with `-05:00` Colombia offset), and local dates (`TZID=America/Bogota`).
* **Text Unescaping:** Unescapes `\,`, `\;`, `\n`, `\N`, and `\\`.
* **Classification Heuristic:**
  * Contains *taller*, *workshop*, *clase*, *curso*, *tejido* -> `taller` (🪡).
  * Contains *pop-up*, *popup*, *showroom* -> `pop-up` (✨).
  * Otherwise -> `feria` (🎪).
* **Configuration:**
  1. Environment variable: `GOOGLE_CALENDAR_ICAL_URL`.
  2. Payload Admin UI: Configurable per block under Pages -> Inicio -> Talleres & Ferias.

### 3.2. Direct WhatsApp Closing & Contact Flow Simplification
* Removed legacy standalone route `src/app/(app)/contacto/page.tsx`.
* Updated all navigation and legal links (Header, Footer, Privacy Policy, Terms, Events) to anchor `/#contacto` or direct WhatsApp link.
* In `src/blocks/CallToAction/Component.tsx`, the primary button "Personalizar mi Joya" opens Shirley's WhatsApp with:
  > *"Hola Shirley, me gustaría encargar una joya personalizada a mi medida ✨"*
* Preserves the two-column asymmetrical editorial layout requested by Shirley.

### 3.3. Slider Hero Editorial Polish (`src/heros/SliderHero/`)
* Left column: Shirley / Model artisan portrait.
* Right column: Roman arched frame with close-up jewelry photo, warm gradient background, subtle category badge, and pill button.
* Smooth keyframe animations defined in `globals.css`:
  * `prismara-mask-up`: Vertical mask slide for headings.
  * `prismara-arch-in`: Subtle scale and elevation entry for arched frame.
  * `prismara-ken-burns`: High-end slow zoom effect on jewelry photos.
  * `prismara-subtle-reveal`: Tracked uppercase category title reveal.

---

## 4. Verification & Testing

* **Unit & Integration Suite:** 74 tests passing across 10 test files (`pnpm test:int`).
* **Google Calendar Parser:** Verified against RFC 5545 edge cases in `tests/int/google-calendar.int.spec.ts`.
* **Skills Integrity:** Verified 50/50 skills with 337/339 evals approved in `pnpm run test:skills`.
* **API Sync Endpoint:** Tested via `GET /api/calendar/sync` and `POST /api/calendar/sync`.
