import { getPayload, createLocalReq } from 'payload'
import config from '@payload-config'
import { seed } from './index'

async function runSeed() {
  const payload = await getPayload({ config })

  // Create admin user
  let adminUser
  try {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@nenufar.com' } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      adminUser = existing.docs[0]
      payload.logger.info(`Admin user already exists: ${adminUser.email}`)
    } else {
      adminUser = await payload.create({
        collection: 'users',
        data: {
          name: 'Admin',
          email: 'admin@nenufar.com',
          password: 'admin123',
          roles: ['admin'],
        },
      })
      payload.logger.info(`Created admin user: ${adminUser.email}`)
    }
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error creating admin user' })
    process.exit(1)
  }

  // Run seed
  try {
    const req = await createLocalReq({ user: adminUser }, payload)
    await seed({ payload, req })
    payload.logger.info('Seed completed successfully!')
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
  }

  process.exit(0)
}

runSeed()
