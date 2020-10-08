import test from 'unit.js'

import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { RULE_TYPES, Geography, Policy, Device } from '@mds-core/mds-types'

import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { FeatureCollection } from 'geojson'
import {
  processPolicy,
  getSupersedingPolicies,
  getRecentEvents // ,
  // processCountRuleNewTypes
} from '../../engine/mds-compliance-engine'
import { readJson } from './helpers'

let policies: Policy[] = []

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

const geographies: Geography[] = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }
]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests Compliance Engine Speed Violations', () => {
  before(async () => {
    policies = await readJson('test_data/policies.json')
  })

  it('Verifies speed compliance', done => {
    const devices = makeDevices(5, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 5
    })

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
})
