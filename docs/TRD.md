# TRD — Agento PoC
## Technical Requirements Document

> **Versión:** 1.1 — incluye FEAT-12 Omnicanal Bidireccional  
> **Fecha:** 2026-06-06  
> **Estado:** PoC Stage

---

## 1. Stack

| Componente | Tecnología | Versión |
|---|---|---|
| Framework | Next.js App Router + Turbopack | 16.2.7 |
| CMS / Admin | Payload CMS | ^3.85.0 |
| ORM (custom) | Drizzle ORM | ^0.45.2 |
| ORM (CMS) | Payload ORM (interno) | — |
| Base de datos | PostgreSQL + pgvector | Local |
| AI SDK | Vercel AI SDK | ^6.0.195 |
| AI React hooks | @ai-sdk/react | ^3.0.197 |
| LLM | Google Gemini 2.5 Flash | gemini-2.5-flash |
| Embeddings | Gemini Embedding 2 | 3072 dims |
| Runtime | Node.js | v20.20.2 |

**Nota Turbopack:** El import de CSS de Payload debe ser `import '@payloadcms/next/css'`. Los paths directos a `/dist/` y los export keys complejos de `node_modules` no resuelven en Turbopack.

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Monolito                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐    │
│  │  Frontend    │    │ Server       │    │ Payload CMS    │    │
│  │  (app)/      │───►│ Actions      │───►│ /admin         │    │
│  │  page.tsx    │    │ search.ts    │    │ /api/payload   │    │
│  │  'use client'│    │ handoff.ts   │    └────────────────┘    │
│  └──────────────┘    │ chat.ts      │                          │
│                      └──────┬───────┘                          │
│  ┌──────────────┐           │                                  │
│  │  API Routes  │           │                                  │
│  │  /api/       │           │                                  │
│  │  webhooks/   │───────────┤                                  │
│  │  whatsapp    │           │                                  │
│  └──────────────┘           ▼                                  │
│                      ┌──────────────┐                          │
│                      │  PostgreSQL  │                          │
│                      │  + pgvector  │                          │
│                      │              │                          │
│                      │ • products   │ ← Payload tables         │
│                      │ • orders     │                          │
│                      │ • users      │                          │
│                      │ • handoff_   │ ← Drizzle tables         │
│                      │   sessions   │                          │
│                      │ • product_   │                          │
│                      │   embeddings │                          │
│                      └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Schema de Base de Datos

### 3.1 `product_embeddings` (Drizzle)
```sql
CREATE TABLE product_embeddings (
  product_id   INTEGER PRIMARY KEY,
  embedding    vector(3072),
  source_hash  TEXT,
  updated_at   TIMESTAMPTZ
);
```

### 3.2 `handoff_sessions` (Drizzle)
```sql
CREATE TABLE handoff_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code         TEXT NOT NULL UNIQUE,      -- AX-XXXX
  cart_context         JSONB,                     -- producto + grabado + upsell
  status               TEXT NOT NULL,             -- ver estados abajo
  phone                TEXT,
  wompi_transaction_id TEXT,
  -- FEAT-12: campos bidireccionales
  initiated_from       TEXT,                      -- 'WEB' | 'WHATSAPP'
  active_channel       TEXT,                      -- 'WEB' | 'WHATSAPP'
  expires_at           TIMESTAMPTZ,
  last_interaction_at  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

**Estados de `status`:**
```
ACTIVE → QUALIFYING → CHECKOUT_PENDING → PAID → DISPATCHED
                    ↓
                ABANDONED | EXPIRED
```

**Estructura de `cart_context`:**
```json
{
  "product": { "id": 1, "name": "...", "price_cop": 120000, "engraving": "Para mamá" },
  "upsell": { "added": true, "name": "Llavero Wayuu", "price_cop": 15000 },
  "totalPrice": 135000
}
```

**Restricción en Payload config:**
```typescript
tablesFilter: ['!product_embeddings', '!handoff_sessions']
```
Impide que las migraciones de Payload eliminen estas tablas.

---

## 4. Contratos de API Interna

### 4.1 Server Actions existentes

| Función | Input | Output |
|---|---|---|
| `handleSearch(query)` | `string` | `SearchResult[]` |
| `createHandoffSession(params)` | `{ productId, engraving?, phone? }` | `{ success, code, session }` |
| `sendMessageToChat(code, msg, history)` | `string \| null, string, ChatMessage[]` | `{ success, reply, sessionCode, isRehydrated, status }` |
| `simulateCheckout(code)` | `string` | `{ success, order }` |

### 4.2 Endpoints REST

| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| GET | `/api/webhooks/whatsapp` | ✅ | Meta challenge handshake |
| POST | `/api/webhooks/whatsapp` | ⚠️ Stub | Recepción de mensajes WA |

### 4.3 Nuevos endpoints (FEAT-11 + FEAT-12)

| Método | Ruta | Feature | Descripción |
|---|---|---|---|
| POST | `/api/chat` | FEAT-11 | Route Handler para `useChat` con tools |
| GET | `/?session=AX-XXXX` | FEAT-12 | Web pick-up de sesión iniciada en WA |

---

## 5. Motor de IA

### 5.1 Modelos
| Modelo | Uso | Cuándo |
|---|---|---|
| `gemini-embedding-2` | Embeddings 3072 dims | Create/edit producto + búsqueda |
| `gemini-2.5-flash` | Conversación Shirley | Por mensaje en el simulador |

### 5.2 Variables de Entorno
| Variable | Requerida | Descripción |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ Crítica | Google AI Studio |
| `DATABASE_URI` | ✅ Crítica | PostgreSQL connection |
| `PAYLOAD_SECRET` | ✅ Crítica | JWT Payload (mín 32 chars) |
| `DEFAULT_HANDOFF_TTL_HOURS` | Opcional | Default: 168h |

### 5.3 Guardián Pre-LLM
```typescript
const codeMatch = message.toUpperCase().match(/AX-[A-Z2-9]{4}/)
// Si hay match → rehidratación directa. Sin tokens de interpretación.
// Si no hay match → Gemini maneja la conversación.
```

### 5.4 Costo estimado por sesión completa
| Operación | Costo |
|---|---|
| Embedding de búsqueda | ~$0.000001 |
| Saludo Shirley + upsell | ~$0.0002 |
| 3-5 mensajes conversacionales | ~$0.0015 |
| **Total por sesión** | **~$0.002 USD** |

> Hipótesis validada: con AOV de $120k COP (~$30 USD), el costo es el **0.007%** del valor de la orden — muy por debajo del límite del 2.5%.

---

## 6. FEAT-11 — Ephemeral UI

### Tecnología
- `useChat` de `@ai-sdk/react` (ya instalado)
- `streamText` + tools en Route Handler `/api/chat`
- Tools: `showProductCard`, `showUpsellCard`, `showCheckoutCard`, `showConfirmationCard`

### Componentes a crear
```
src/components/chat/
├── ProductCard.tsx      # Confirma producto rehidratado
├── UpsellCard.tsx       # Oferta con botones Sí/No
├── CheckoutCard.tsx     # Resumen + botón de pago
└── ConfirmationCard.tsx # Pago exitoso + link al CRM
```

### Flujo de tools
```
AI detecta rehidratación → llama tool showProductCard({ productName, priceCop, engraving })
Cliente renderiza        → <ProductCard /> en la burbuja del chat

AI ofrece upsell        → llama tool showUpsellCard({ upsellName, upsellPrice })
Cliente renderiza        → <UpsellCard /> con botones interactivos

Usuario clickea Sí/No   → server action actualiza DB
AI responde             → llama tool showCheckoutCard({ total })
Cliente renderiza        → <CheckoutCard /> con botón "Simular Pago"
```

### Archivos a crear/modificar
| Archivo | Acción |
|---|---|
| `src/app/api/chat/route.ts` | Crear — Route Handler con streamText + tools |
| `src/app/(app)/page.tsx` | Modificar — migrar panel derecho a useChat |
| `src/components/chat/*.tsx` | Crear — 4 componentes |

---

## 7. FEAT-12 — Sesión Omnicanal Bidireccional

### El problema que resuelve
Actualmente el handoff es unidireccional: **Web → WhatsApp**. El cliente debe pasar primero por la web para generar el código. FEAT-12 permite que el flujo **comience desde cualquier canal**.

### Flujos

```
ESCENARIO A (actual) — Web → WhatsApp
  1. Usuario busca en web
  2. Genera código AX-XXXX
  3. Continúa en WhatsApp

ESCENARIO B (nuevo) — WhatsApp → Web
  1. Usuario: "Busco una mochila para regalo" en WhatsApp
  2. Shirley hace RAG y recomienda productos
  3. Shirley genera AX-XXXX para el producto elegido
  4. Shirley envía: "Continúa en: agento.co/?session=AX-XXXX"
  5. Web carga con producto preseleccionado

ESCENARIO C (nuevo) — WhatsApp completo
  1. Usuario configura todo por chat (producto + grabado)
  2. Shirley genera AX-XXXX
  3. Shirley envía link de pago directamente en WhatsApp
```

### Cambios de Schema
```sql
-- Agregar a handoff_sessions:
ALTER TABLE handoff_sessions ADD COLUMN initiated_from TEXT; -- 'WEB' | 'WHATSAPP'
ALTER TABLE handoff_sessions ADD COLUMN active_channel TEXT; -- 'WEB' | 'WHATSAPP'
```

### Cambios de Código

| Archivo | Cambio |
|---|---|
| `db/schema.ts` | Agregar campos `initiatedFrom`, `activeChannel` |
| `db/migrate.ts` | Agregar migración ALTER TABLE |
| `actions/handoff.ts` | Aceptar parámetro `initiatedFrom` |
| `api/webhooks/whatsapp/route.ts` | Implementar lógica real: RAG + handoff desde WA |
| `app/(app)/page.tsx` | Detectar `?session=AX-XXXX` en URL y rehidratar |
| `actions/chat.ts` (o `/api/chat`) | Shirley puede llamar `createHandoffSession()` desde WA |

### Pick-up URL
```
agento.co/?session=AX-B3K9
→ Web detecta el query param
→ Busca sesión en DB
→ Preselecciona el producto del cart_context
→ Muestra grabado configurado (si aplica)
→ El usuario puede continuar o pagar desde la web
```

---

## 8. Decisiones de Arquitectura

| Decisión | Razón |
|---|---|
| Monolito Next.js | Velocidad de PoC |
| No PgBouncer | Evita issues con prepared statements en Drizzle |
| `tablesFilter` en Payload | Payload no toca las tablas de Drizzle |
| Historial de chat stateless (array) | Sin Redis en PoC. Redis es para producción |
| Upsells hardcoded | Suficiente para PoC. Producción: campo en Products |
| Gemini Flash vs Pro | Costo-beneficio: Flash es suficiente para ventas |
| Simulador web vs WA real | PoC no requiere credenciales Meta |

---

## 9. Orden de Implementación Sugerido

```
1. FEAT-11 Ephemeral UI
   → /api/chat route handler
   → Componentes ProductCard, UpsellCard, CheckoutCard, ConfirmationCard
   → Migrar page.tsx a useChat

2. FEAT-12 Bidireccional
   → Migración DB (initiatedFrom, activeChannel)
   → Pick-up URL (?session=) en page.tsx
   → Webhook WhatsApp real con RAG + handoff
```

---

## 10. Criterios de Éxito del PoC

1. Búsqueda semántica retorna resultados relevantes en < 3s
2. Código `AX-XXXX` se genera en < 2s
3. Rehidratación de sesión completa en < 3s
4. Flujo completo demostrable en < 5 minutos
5. Costo de IA por sesión < $0.01 USD
6. (FEAT-12) Flujo WhatsApp → Web funciona con link de pick-up
