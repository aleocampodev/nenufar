import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, vector } from 'drizzle-orm/pg-core'

export const productEmbeddings = pgTable('product_embeddings', {
  // Assuming Payload creates a 'products' table with an integer ID by default, or serial.
  productId: integer('product_id').primaryKey(),
  embedding: vector('embedding', { dimensions: 3072 }),
  sourceHash: text('source_hash'),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})

export const handoffSessions = pgTable('handoff_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionCode: text('session_code').notNull().unique(),
  cartContext: jsonb('cart_context'),
  status: text('status').notNull(), // ACTIVE, EXPIRED, PENDING_PAYMENT, ABANDONED, PAID, DISPATCHED
  phone: text('phone'),
  wompiTransactionId: text('wompi_transaction_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
