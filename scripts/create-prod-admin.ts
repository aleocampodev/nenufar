/**
 * One-off prod admin creation (run locally with prod DATABASE_URL).
 *
 * Usage:
 *   DATABASE_URL="<supabase-pooler-url>" PAYLOAD_SECRET="<prod-secret>" \
 *     ADMIN_EMAIL="shirley@nenufar.co" ADMIN_NAME="Shirley" \
 *     pnpm tsx scripts/create-prod-admin.ts
 *
 * ADMIN_PASSWORD is read from env; if absent, a random one is generated
 * and printed once (store it in a password manager immediately).
 */
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL
  if (!email) {
    console.error('Missing ADMIN_EMAIL env var.')
    process.exit(1)
  }
  const password = process.env.ADMIN_PASSWORD ?? randomBytes(16).toString('hex')
  const generated = !process.env.ADMIN_PASSWORD

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    console.log(`Admin user already exists: ${email} (password unchanged)`)
    process.exit(0)
  }

  await payload.create({
    collection: 'users',
    data: {
      name: process.env.ADMIN_NAME ?? 'Shirley',
      email,
      password,
      roles: ['admin'],
    },
    overrideAccess: true,
  })

  console.log(`Created admin user: ${email}`)
  if (generated) {
    console.log(`Generated password (save it now, shown only once): ${password}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
