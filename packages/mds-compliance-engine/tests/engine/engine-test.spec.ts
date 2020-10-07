import test from 'unit.js'

import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { RULE_TYPES, Geography, Policy, Device, VehicleEvent, CountRule } from '@mds-core/mds-types'

import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { FeatureCollection } from 'geojson'
import { RuntimeError, minutes } from '@mds-core/mds-utils'
import { ValidationError, validateEvents, validateGeographies, validatePolicies } from '@mds-core/mds-schema-validators'
import {
  processPolicy,
  getSupersedingPolicies,
  getRecentEvents // ,
  // processCountRuleNewTypes
} from '../../engine/mds-compliance-engine'
import { readJson, generateDeviceMap } from './helpers'

let policies: Policy[] = []
const low_count_policies: Policy[] = []

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

const geographies: Geography[] = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }
]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests Compliance Engine', () => {
  before(async () => {
    policies = await readJson('test_data/policies.json')
    // geographies = await readJson('test_data/geographies.json')
  })

  // it('Verify Devices Schema Compliance', done => {
  //   const devices = makeDevices(5, now())
  //   test.assert.equal(validateSchemaCompliance(devices, devices_schema), devices.devices)
  //   done()
  // })

  it('Verifies speed compliance', done => {
    const devices = makeDevices(5, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 5
    })
    test.assert.doesNotThrow(() => validatePolicies(policies))
    test.assert.doesNotThrow(() => validateGeographies(geographies))
    test.assert.doesNotThrow(() => validateEvents(events))

    const recentEvents = getRecentEvents(events)
    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = devices.reduce(
      (deviceMapAcc: { [d: string]: Device }, device: Device) => {
        return Object.assign(deviceMapAcc, { [device.device_id]: device })
      },
      {}
    )
    const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, geographies, deviceMap))
    results.forEach(result => {
      if (result) {
        result.compliance.forEach(compliance => {
          if (
            compliance.rule.geographies.includes(CITY_OF_LA) &&
            compliance.matches &&
            compliance.rule.rule_type === RULE_TYPES.speed
          ) {
            test.assert.deepEqual(compliance.matches.length, 0)
          }
        })
      }
    })
    done()
  })

  it('Verifies speed compliance violation', done => {
    const devices = makeDevices(5, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })
    test.assert.doesNotThrow(() => validatePolicies(policies))
    test.assert.doesNotThrow(() => validateGeographies(geographies))
    test.assert.doesNotThrow(() => validateEvents(events))

    const recentEvents = getRecentEvents(events)
    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = devices.reduce(
      (deviceMapAcc: { [d: string]: Device }, device: Device) => {
        return Object.assign(deviceMapAcc, { [device.device_id]: device })
      },
      {}
    )
    const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, geographies, deviceMap))
    results.forEach(result => {
      if (result) {
        result.compliance.forEach(compliance => {
          if (
            compliance.rule.geographies.includes(CITY_OF_LA) &&
            compliance.matches &&
            compliance.rule.rule_type === RULE_TYPES.speed
          ) {
            test.assert.deepEqual(compliance.matches.length, 5)
            test.assert.deepEqual(result.total_violations, 5)
          }
        })
      }
    })
    done()
  })

  it('Verifies time compliance', done => {
    const devices = makeDevices(400, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })
    test.assert.doesNotThrow(() => validatePolicies(policies))
    test.assert.doesNotThrow(() => validateGeographies(geographies))
    test.assert.doesNotThrow(() => validateEvents(events))

    const recentEvents = getRecentEvents(events)
    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = devices.reduce(
      (deviceMapAcc: { [d: string]: Device }, device: Device) => {
        return Object.assign(deviceMapAcc, { [device.device_id]: device })
      },
      {}
    )
    const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, geographies, deviceMap))
    results.forEach(result => {
      if (result) {
        result.compliance.forEach(compliance => {
          if (
            compliance.rule.geographies.includes(CITY_OF_LA) &&
            compliance.matches &&
            compliance.rule.rule_type === RULE_TYPES.time
          ) {
            test.assert.deepEqual(compliance.matches.length, 0)
          }
        })
      }
    })
    done()
  })

  it('Verifies time compliance violation', done => {
    const devices = makeDevices(400, now())
    const events = makeEventsWithTelemetry(devices, now() - minutes(21), CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })
    test.assert.doesNotThrow(() => validatePolicies(policies))
    test.assert.doesNotThrow(() => validateGeographies(geographies))
    test.assert.doesNotThrow(() => validateEvents(events))

    const recentEvents = getRecentEvents(events)
    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = devices.reduce(
      (deviceMapAcc: { [d: string]: Device }, device: Device) => {
        return Object.assign(deviceMapAcc, { [device.device_id]: device })
      },
      {}
    )
    const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, geographies, deviceMap))
    results.forEach(result => {
      if (result) {
        result.compliance.forEach(compliance => {
          if (
            compliance.rule.geographies.includes(CITY_OF_LA) &&
            compliance.matches &&
            compliance.rule.rule_type === RULE_TYPES.time
          ) {
            test.assert.notEqual(compliance.matches.length, 0)
            test.assert.deepEqual(result.total_violations, 400)
          }
        })
      }
    })
    done()
  })

  it('Verifies not considering events older than 48 hours', done => {
    const TWO_DAYS_IN_MS = 172800000
    const devices = makeDevices(400, now())
    const events = makeEventsWithTelemetry(devices, now() - TWO_DAYS_IN_MS, CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })
    test.assert.doesNotThrow(() => validatePolicies(policies))
    test.assert.doesNotThrow(() => validateGeographies(geographies))
    test.assert.doesNotThrow(() => validateEvents(events))

    const recentEvents = getRecentEvents(events)

    test.assert.deepEqual(recentEvents.length, 0)

    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = devices.reduce(
      (deviceMapAcc: { [d: string]: Device }, device: Device) => {
        return Object.assign(deviceMapAcc, { [device.device_id]: device })
      },
      {}
    )
    const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, geographies, deviceMap))
    results.forEach(result => {
      if (result) {
        result.compliance.forEach(compliance => {
          if (
            compliance.rule.geographies.includes(CITY_OF_LA) &&
            compliance.matches &&
            compliance.rule.rule_type === RULE_TYPES.time
          ) {
            test.assert.deepEqual(compliance.matches.length, 0)
          }
        })
      }
    })
    done()
  })
})

describe('Verifies errors are being properly thrown', () => {
  it('Verify garbage does not pass schema compliance', done => {
    const devices = { foo: { potato: 'POTATO!' } }
    test.assert.throws(() => validateEvents(devices), ValidationError)
    done()
  })

  it('Verifies RuntimeErrors are being thrown with an invalid TIMEZONE env_var', done => {
    const oldTimezone = process.env.TIMEZONE
    process.env.TIMEZONE = 'Pluto/Potato_Land'
    const devices = makeDevices(1, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })
    test.assert.doesNotThrow(() => validatePolicies(policies))
    test.assert.doesNotThrow(() => validateGeographies(geographies))
    test.assert.doesNotThrow(() => validateEvents(events))

    const recentEvents = getRecentEvents(events)
    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = devices.reduce(
      (deviceMapAcc: { [d: string]: Device }, device: Device) => {
        return Object.assign(deviceMapAcc, { [device.device_id]: device })
      },
      {}
    )
    test.assert.throws(
      () => supersedingPolicies.map(policy => processPolicy(policy, recentEvents, geographies, deviceMap)),
      RuntimeError
    )
    process.env.TIMEZONE = oldTimezone
    done()
  })
})

describe('new rule processors', () => {
  it('processCountRuleNewTypes', done => {
    /*
    rule: CountRule,
    events: VehicleEvent[],
    geographies: Geography[],
    devices: { [d: string]: Device }
    */

    const countRule: CountRule = {
      name: 'Greater LA',
      rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      rule_type: 'count',
      geographies: ['1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'],
      states: {
        available: [],
        on_trip: []
      },
      vehicle_types: ['bicycle', 'scooter'],
      maximum: 3000,
      minimum: 500
    }

    const devices = makeDevices(800, now())
    //    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, 'trip_start')

    //    const result = processCountRuleNewTypes(countRule, events, geographies, devices)
    done()
  })
})
