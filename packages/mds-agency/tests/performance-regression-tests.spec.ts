import supertest from 'supertest'
import test from 'unit.js'
import { Timestamp } from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-agency-cache'
import { makeDevices, makeEvents } from '@mds-core/mds-test-data'
import { ApiServer } from '@mds-core/mds-api-server'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'

import { api } from '../api'

const request = supertest(ApiServer(api))

function now(): Timestamp {
  return Date.now()
}

const PROVIDER_SCOPES = 'admin:all'

// TODO Inherit all of these from mds-test-data
const AUTH = `basic ${Buffer.from(`${TEST1_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`

before(async () => {
  await Promise.all([db.initialize(), cache.initialize()])
})

after(async () => {
  await Promise.all([db.shutdown(), cache.shutdown()])
})

describe('/vehicles/ performance test', async () => {
  before(async () => {
    const devices = makeDevices(10000, now())
    const events = makeEvents(devices, now())
    const seedData = { devices, events, telemetry: [] }
    await Promise.all([db.initialize(), cache.initialize()])
    await Promise.all([cache.seed(seedData), db.seed(seedData)])
  })

  it('verifies paging links when read back all devices from db', async () => {
    const start = now()

    await request.get('/vehicles').set('Authorization', AUTH).expect(200)

    const fin = now()
    console.log('/vehicles regression test', (fin - start) / 1000)
  })
})
