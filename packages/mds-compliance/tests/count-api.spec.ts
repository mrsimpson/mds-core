/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  makeDevices,
  makeEventsWithTelemetry,
  makeTelemetryInArea,
  restrictedAreas,
  veniceSpecOps,
  LA_CITY_BOUNDARY
} from '@mds-core/mds-test-data'
import test from 'unit.js'
import { api as agency } from '@mds-core/mds-agency'
import cache from '@mds-core/mds-agency-cache'
import db from '@mds-core/mds-db'
import stream from '@mds-core/mds-stream'
import supertest from 'supertest'
import { now, uuid, minutes, pathPrefix, rangeRandomInt } from '@mds-core/mds-utils'
import {
  Telemetry,
  Device,
  Policy,
  Geography,
  VehicleEvent,
  UUID,
  RULE_TYPES,
  VEHICLE_TYPES,
  PROPULSION_TYPES
} from '@mds-core/mds-types'
import MockDate from 'mockdate'
import { Feature, Polygon } from 'geojson'
import { ApiServer } from '@mds-core/mds-api-server'
import { TEST1_PROVIDER_ID, TEST2_PROVIDER_ID, MOCHA_PROVIDER_ID, JUMP_PROVIDER_ID } from '@mds-core/mds-providers'
import { api } from '../api'

const request = supertest(ApiServer(api))
const agency_request = supertest(ApiServer(agency))

const PROVIDER_SCOPES = 'admin:all'
const TEST2_PROVIDER_AUTH = `basic ${Buffer.from(`${TEST2_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`
const JUMP_PROVIDER_AUTH = `basic ${Buffer.from(`${JUMP_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`
const MOCHA_PROVIDER_AUTH = `basic ${Buffer.from(`${MOCHA_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`
const TRIP_UUID = '1f981864-cc17-40cf-aea3-70fd985e2ea7'
const DEVICE_UUID = 'ec551174-f324-4251-bfed-28d9f3f473fc'
const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'
const LA_BEACH = 'ff822e26-a70c-4721-ac32-2f6734beff9b'

const testTimestamp = now()

const TEST_TELEMETRY = {
  device_id: DEVICE_UUID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    hdop: 1,
    heading: 180
  },
  charge: 0.5,
  timestamp: now()
}

process.env.TIMEZONE = 'America/Los_Angeles'
const ADMIN_AUTH = `basic ${Buffer.from(`${TEST1_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`
const TEST_VEHICLE = {
  device_id: DEVICE_UUID,
  provider_id: TEST1_PROVIDER_ID,
  vehicle_id: 'test-id-1',
  type: VEHICLE_TYPES.bicycle,
  propulsion: [PROPULSION_TYPES.human],
  year: 2018,
  mfgr: 'Schwinn',
  model: 'Mantaray'
}
// const start_yesterday = now() - (now() % days(1))
const VENICE_POLICY_UUID = 'dd9ace3e-14c8-461b-b5e7-1326505ff176'

const COUNT_POLICY_UUID = '72971a3d-876c-41ea-8e48-c9bb965bbbcc'
const COUNT_POLICY_UUID_2 = '37637f96-2580-475a-89e7-cfc5d2e70f84'
const COUNT_POLICY_UUID_3 = 'e8f9a720-6c12-41c8-a31c-715e76d65ea1'
const GEOGRAPHY_UUID = '8917cf2d-a963-4ea2-a98b-7725050b3ec5'
const COUNT_POLICY_JSON: Policy = {
  name: 'LADOT Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID,
  start_date: 1558389669540,
  publish_date: 1558389669540,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      rule_type: RULE_TYPES.count,
      geographies: [GEOGRAPHY_UUID],
      states: { available: [], non_operational: [], reserved: [], on_trip: [] },
      vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
      maximum: 10,
      minimum: 5
    }
  ]
}

const SCOPED_COUNT_POLICY_JSON = {
  name: 'LADOT Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID,
  start_date: 1558389669540,
  publish_date: 1558389669540,
  end_date: null,
  prev_policies: null,
  provider_ids: [TEST2_PROVIDER_ID],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      rule_type: RULE_TYPES.count,
      geographies: [GEOGRAPHY_UUID],
      states: { available: [], non_operational: [], reserved: [], on_trip: [] },
      vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
      maximum: 10,
      minimum: 5
    }
  ]
}
const COUNT_POLICY_JSON_2: Policy = {
  name: 'Something Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID_2,
  start_date: 1558389669540,
  end_date: null,
  publish_date: 1558389669540,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'No vehicles permitted on Venice Beach on weekends',
      rule_id: '405b959e-4377-4a31-8b34-a9a4771125fc',
      rule_type: RULE_TYPES.count,
      geographies: ['ff822e26-a70c-4721-ac32-2f6734beff9b'],
      states: { available: [], non_operational: [], reserved: [], on_trip: [] },
      days: ['sat', 'sun'],
      maximum: 0,
      minimum: 0
    }
  ]
}

const COUNT_POLICY_JSON_3: Policy = {
  name: 'LADOT Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID_3,
  start_date: 1558389669540,
  publish_date: 1558389669540,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '04dc545b-41d8-401d-89bd-bfac9247b555',
      rule_type: RULE_TYPES.count,
      geographies: [GEOGRAPHY_UUID],
      states: { available: ['on_hours'], non_operational: [], reserved: [], on_trip: [] },
      vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
      maximum: 10
    }
  ]
}

const COUNT_POLICY_JSON_5: Policy = {
  name: 'Prohibited Dockless Zones',
  rules: [
    {
      name: 'Prohibited Dockless Zones',
      maximum: 0,
      rule_id: '8ad39dc3-005b-4348-9d61-c830c54c161b',
      states: {
        on_trip: [],
        reserved: [],
        available: []
      },
      rule_type: 'count',
      geographies: ['c0591267-bb6a-4f28-a612-ff7f4a8f8b2a'],
      vehicle_types: ['bicycle', 'scooter']
    }
  ],
  end_date: null,
  policy_id: '25851571-b53f-4426-a033-f375be0e7957',
  start_date: Date.now(),
  publish_date: Date.now() - 10,
  description:
    'Prohibited areas for dockless vehicles within the City of Los Angeles for the LADOT Dockless On-Demand Personal Mobility Program',
  prev_policies: null
}

const APP_JSON = 'application/vnd.mds.compliance+json; charset=utf-8; version=0.1'
describe.only('Tests Compliance API:', () => {
  afterEach(async () => {
    await Promise.all([db.shutdown(), cache.shutdown(), stream.shutdown()])
  })

  /* TODO -- Implement count minimums */
  // describe('Count Violation Under Test: ', () => {
  //   before(done => {
  //     const devices: Device[] = makeDevices(3, now())
  //     const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, 'trip_end')
  //     const telemetry: Telemetry[] = []
  //     devices.forEach(device => {
  //       telemetry.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
  //     })
  //     request
  //       .get(pathPrefix('/test/initialize'))
  //       .set('Authorization', ADMIN_AUTH)
  //       .expect(200)
  //       .end(() => {
  //         provider_request
  //           .post(pathPrefix('/test/seed'))
  //           .set('Authorization', PROVIDER_AUTH)
  //           .send({ devices, events, telemetry })
  //           .expect(201)
  //           .end((err, result) => {
  //             test.value(result).hasHeader('content-type', APP_JSON)
  //             const geography = { geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
  //             policy_request
  //               .post(`/admin/geographies/${GEOGRAPHY_UUID}`)
  //               .set('Authorization', ADMIN_AUTH)
  //               .send(geography)
  //               .expect(200)
  //               .end(() => {
  //                 policy_request
  //                   .post(`/admin/policies/${COUNT_POLICY_UUID}`)
  //                   .set('Authorization', ADMIN_AUTH)
  //                   .send(COUNT_POLICY_JSON)
  //                   .expect(200)
  //                   .end(() => {
  //                     done(err)
  //                   })
  //               })
  //           })
  //       })
  //   })

  //   it('Verifies violation of count compliance (under)', done => {
  //     request
  //       .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}`))
  //       .set('Authorization', ADMIN_AUTH)
  //       .expect(200)
  //       .end((err, result) => {
  //         test.assert(result.body.length === 1)
  //         test.assert(result.body[0].compliance[0].matches[0].measured === 3)
  //         test.assert(result.body[0].compliance[0].matches[0].matched_vehicles.length === 3)
  //         test.value(result).hasHeader('content-type', APP_JSON)
  //         done(err)
  //       })
  //   })

  //   afterEach(done => {
  //     agency_request
  //       .get(pathPrefix('/test/shutdown'))
  //       .set('Authorization', ADMIN_AUTH)
  //       .expect(200)
  //       .end(err => {
  //         done(err)
  //       })
  //   })
  // })
  describe('Count Violation Over Test: ', () => {
    before(done => {
      const devicesOfProvider1: Device[] = makeDevices(15, now())
      const devicesOfProvider2: Device[] = makeDevices(15, now(), JUMP_PROVIDER_ID)
      const devices = [...devicesOfProvider1, ...devicesOfProvider2]
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })
      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
      })
      const seedData = { devices, events, telemetry }
      Promise.all([db.initialize(), cache.initialize()]).then(() => {
        Promise.all([db.seed(seedData), cache.seed(seedData)]).then(async () => {
          const geography = { name: 'la', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
          await db.writeGeography(geography)
          await db.publishGeography({ geography_id: geography.geography_id })
          await db.writePolicy(COUNT_POLICY_JSON)
          done()
        })
      })
    })

    it('Verifies violation of count compliance (over) and filters results by provider_id', async () => {
      // Admins should be able to see violations across all providers
      const adminResult = await request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}`))
        .set('Authorization', ADMIN_AUTH)
        .expect(200)
      test.assert.deepEqual(adminResult.body.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(adminResult.body.total_violations, 20)
      test.object(adminResult.body).hasProperty('timestamp')
      test.object(adminResult.body).hasProperty('version')
      test.value(adminResult).hasHeader('content-type', APP_JSON)

      // Admins should be able to query for a specific provider's compliance results
      // and only see the number of violations for that provider
      const provider1Result = await request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}?provider_id=${TEST1_PROVIDER_ID}`))
        .set('Authorization', ADMIN_AUTH)
        .expect(200)
      test.assert.deepEqual(provider1Result.body.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(provider1Result.body.total_violations, 5)
      test.object(provider1Result.body).hasProperty('timestamp')
      test.object(provider1Result.body).hasProperty('version')
      test.value(provider1Result).hasHeader('content-type', APP_JSON)

      // If a policy applies to every provider, a provider will see only its own compliance results.
      const jumpResult = await request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}`))
        .set('Authorization', JUMP_PROVIDER_AUTH)
        .expect(200)
      test.assert.deepEqual(jumpResult.body.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(jumpResult.body.total_violations, 5)
    })

    afterEach(async () => {
      await Promise.all([db.shutdown(), cache.shutdown(), stream.shutdown()])
    })
  })

  describe.only('Suspicious Count Violation Over Test: ', () => {
    before(done => {
      const devicesOfProvider1: Device[] = makeDevices(10, now())
      const devicesOfProvider2: Device[] = makeDevices(15, now(), JUMP_PROVIDER_ID)
      const devices = [...devicesOfProvider1, ...devicesOfProvider2]
      const events1 = makeEventsWithTelemetry(devicesOfProvider1, now() - 100091, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })
      const events2 = makeEventsWithTelemetry(devicesOfProvider2, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })
      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
      })
      const seedData = { devices, events: [...events1, ...events2], telemetry }
      Promise.all([db.initialize(), cache.initialize()]).then(() => {
        Promise.all([db.seed(seedData), cache.seed(seedData)]).then(async () => {
          const geography = { name: 'la', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
          await db.writeGeography(geography)
          await db.publishGeography({ geography_id: geography.geography_id })
          await db.writePolicy(COUNT_POLICY_JSON)
          done()
        })
      })
    })

    it('Verifies violation of count compliance (over) and filters results by provider_id', async () => {
      // Admins should be able to see violations across all providers
      const adminResult = await request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}`))
        .set('Authorization', ADMIN_AUTH)
        .expect(200)
      test.assert.deepEqual(adminResult.body.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(adminResult.body.total_violations, 15)
      test.object(adminResult.body).hasProperty('timestamp')
      test.object(adminResult.body).hasProperty('version')
      test.value(adminResult).hasHeader('content-type', APP_JSON)

      // Admins should be able to query for a specific provider's compliance results
      // and only see the number of violations for that provider
      const provider1Result = await request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}?provider_id=${TEST1_PROVIDER_ID}`))
        .set('Authorization', ADMIN_AUTH)
        .expect(200)
      test.assert.deepEqual(provider1Result.body.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(provider1Result.body.total_violations, 0)
      test.object(provider1Result.body).hasProperty('timestamp')
      test.object(provider1Result.body).hasProperty('version')
      test.value(provider1Result).hasHeader('content-type', APP_JSON)

      // If a policy applies to every provider, a provider will see only its own compliance results.
      const jumpResult = await request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID}`))
        .set('Authorization', JUMP_PROVIDER_AUTH)
        .expect(200)
      test.assert.deepEqual(jumpResult.body.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(jumpResult.body.total_violations, 5)
    })

    afterEach(async () => {
      await Promise.all([db.shutdown(), cache.shutdown(), stream.shutdown()])
    })
  })

  describe('Particular Event Violation: ', () => {
    before(done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['on_hours'],
        vehicle_state: 'available',
        speed: 0
      })
      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
      })
      const seedData = { devices, events, telemetry }
      Promise.all([db.initialize(), cache.initialize()]).then(() => {
        Promise.all([db.seed(seedData), cache.seed(seedData)]).then(async () => {
          const geography = { name: 'la', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
          await db.writeGeography(geography)
          await db.publishGeography({ geography_id: geography.geography_id })
          await db.writePolicy(COUNT_POLICY_JSON_3)
          done()
        })
      })
    })

    it('Verifies violation for particular event', done => {
      request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID_3}`))
        .set('Authorization', ADMIN_AUTH)
        .expect(200)
        .end((err, result) => {
          test.assert.deepEqual(result.body.compliance[0].matches[0].measured, 10)
          test.assert.deepEqual(result.body.total_violations, 5)
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    afterEach(async () => {
      await Promise.all([db.shutdown(), cache.shutdown(), stream.shutdown()])
    })
  })

  describe('Particular Event Compliance: ', () => {
    before(done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })
      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
      })
      const seedData = { devices, events, telemetry }
      Promise.all([db.initialize(), cache.initialize()]).then(() => {
        Promise.all([db.seed(seedData), cache.seed(seedData)]).then(async () => {
          const geography = { name: 'LA', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
          await db.writeGeography(geography)
          await db.publishGeography({ geography_id: geography.geography_id })
          await db.writePolicy(COUNT_POLICY_JSON_3)
          done()
        })
      })
    })

    it('Verifies compliance for particular event', done => {
      request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID_3}`))
        .set('Authorization', ADMIN_AUTH)
        .expect(200)
        .end((err, result) => {
          test.assert(result.body.total_violations === 0)
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    afterEach(async () => {
      await Promise.all([db.shutdown(), cache.shutdown(), stream.shutdown()])
    })
  })

  /**
   * @deprecated
   * Historical checking deprecated as of 1.0.0
   */
  // describe('Tests reading historical compliance', () => {
  //   const yesterday = now() - 86400000
  //   before(done => {
  //     // Generate old events
  //     const devices: Device[] = makeDevices(15, yesterday)
  //     const events_a = makeEventsWithTelemetry(devices, yesterday, CITY_OF_LA, {
  //       event_types: ['trip_start'],
  //       vehicle_state: 'on_trip',
  //       speed: rangeRandomInt(0, 10)
  //     })
  //     const telemetry_a: Telemetry[] = []
  //     devices.forEach(device => {
  //       telemetry_a.push(makeTelemetryInArea(device, yesterday, CITY_OF_LA, 10))
  //     })

  //     // Generate new events
  //     const events_b = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
  //       event_types: ['provider_drop_off'],
  //       vehicle_state: 'available',
  //       speed: 0
  //     })
  //     const telemetry_b: Telemetry[] = []
  //     devices.forEach(device => {
  //       telemetry_a.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
  //     })

  //     // Seed
  //     const seedData = {
  //       devices: [...devices],
  //       events: [...events_a, ...events_b],
  //       telemetry: [...telemetry_a, ...telemetry_b]
  //     }
  //     Promise.all([db.initialize(), cache.initialize()]).then(() => {
  //       Promise.all([cache.seed(seedData), db.seed(seedData)]).then(async () => {
  //         await db.writeGeography({ name: 'la', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY })
  //         await db.publishGeography({ geography_id: GEOGRAPHY_UUID })
  //         await db.writePolicy(COUNT_POLICY_JSON_4)
  //         done()
  //       })
  //     })
  //   })

  //   it('Historical check reports 5 violations', done => {
  //     request
  //       .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID_4}?timestamp=${yesterday + 200}`))
  //       .set('Authorization', ADMIN_AUTH)
  //       .expect(200)
  //       .end((err, result) => {
  //         test.assert.deepEqual(result.body.total_violations, 5)
  //         test.value(result).hasHeader('content-type', APP_JSON)
  //         done(err)
  //       })
  //   })

  //   it('Current check reports 0 violations', done => {
  //     request
  //       .get(pathPrefix(`/snapshot/${COUNT_POLICY_UUID_4}`))
  //       .set('Authorization', ADMIN_AUTH)
  //       .expect(200)
  //       .end((err, result) => {
  //         test.assert(result.body.total_violations === 0)
  //         test.value(result).hasHeader('content-type', APP_JSON)
  //         done(err)
  //       })
  //   })
  // })

  describe('Verifies max 0 count policy', () => {
    before('Setup max 0 count policy', async () => {
      const geography = {
        name: 'la',
        geography_id: 'c0591267-bb6a-4f28-a612-ff7f4a8f8b2a',
        geography_json: restrictedAreas
      }

      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 10, LA_BEACH, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      })

      const seedData = { devices, events, telemetry: [] }

      await Promise.all([db.initialize(), cache.initialize()])
      await Promise.all([cache.seed(seedData), db.seed(seedData)])
      await db.writeGeography(geography)
      await db.publishGeography({ geography_id: geography.geography_id })
      await db.writePolicy(COUNT_POLICY_JSON_5)
    })

    it('Verifies max 0 single rule policy operates as expected', done => {
      request
        .get(pathPrefix(`/snapshot/${COUNT_POLICY_JSON_5.policy_id}`))
        .set('Authorization', TEST2_PROVIDER_AUTH)
        .expect(200)
        .end((err, result) => {
          test.assert.deepEqual(result.body.total_violations, 15)
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })
  })
})
