import test from 'unit.js'

import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { RULE_TYPES, Geography, Policy, Device } from '@mds-core/mds-types'

import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { FeatureCollection } from 'geojson'
import { minutes } from '@mds-core/mds-utils'
import { validateEvents, validateGeographies, validatePolicies } from '@mds-core/mds-schema-validators'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import { processPolicyByProviderId } from '../../engine/mds-compliance-engine'
import { getSupersedingPolicies, getRecentEvents } from '../../engine/helpers'
import { readJson, generateDeviceMap } from './helpers'

let policies: Policy[] = []

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

const geographies: Geography[] = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }
]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests Compliance Engine Time Functionality', () => {
  before(async () => {
    policies = await readJson('test_data/policies.json')
  })

  it('Verifies time compliance', done => {
    const devices = makeDevices(400, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })

    const recentEvents = getRecentEvents(events)
    const supersedingPolicies = getSupersedingPolicies(policies)
    const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)

    const results = supersedingPolicies.map(policy =>
      processPolicyByProviderId(policy, TEST1_PROVIDER_ID, recentEvents, geographies, deviceMap)
    )
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
    const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)

    const results = supersedingPolicies.map(policy =>
      processPolicyByProviderId(policy, TEST1_PROVIDER_ID, recentEvents, geographies, deviceMap)
    )
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
})
