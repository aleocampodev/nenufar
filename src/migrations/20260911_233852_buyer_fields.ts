import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Fase 6 — buyer fields on orders (buyerName, buyerContact).
 *
 * Minimal on purpose: the auto-generated diff replayed months of dev-push
 * drift (already applied directly) and failed on duplicate CREATE TYPEs.
 * Only buyer_name / buyer_contact are actually missing in the database.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "buyer_name" varchar;
  ALTER TABLE "orders" ADD COLUMN "buyer_contact" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "buyer_contact";
  ALTER TABLE "orders" DROP COLUMN "buyer_name";`)
}
