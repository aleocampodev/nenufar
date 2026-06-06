import { Client } from 'pg'

async function run() {
  const connectionString = process.env.DATABASE_URI || 'postgres://ale:secret123@127.0.0.1:5432/agento'
  console.log('Running custom migrations on:', connectionString)
  const client = new Client({ connectionString })
  await client.connect()

  try {
    // Asegurar extensión pgvector
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;')
    console.log('Extension pgvector verified/enabled.')

    // Crear tabla product_embeddings
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_embeddings (
        product_id integer PRIMARY KEY,
        embedding vector(3072),
        source_hash text,
        updated_at timestamp with time zone
      );
    `)
    console.log('Table product_embeddings verified/created.')

    // Crear tabla handoff_sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS handoff_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_code text NOT NULL UNIQUE,
        cart_context jsonb,
        status text NOT NULL,
        phone text,
        wompi_transaction_id text,
        expires_at timestamp with time zone,
        last_interaction_at timestamp with time zone,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );
    `)
    console.log('Table handoff_sessions verified/created.')

    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    console.log('Tables in public schema after migration:', tables.rows.map(r => r.table_name))
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
