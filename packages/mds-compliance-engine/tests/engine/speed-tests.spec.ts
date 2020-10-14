import test from 'unit.js'

import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { RULE_TYPES, Geography, Policy, Device, SpeedRule, Telemetry, VehicleEvent } from '@mds-core/mds-types'

import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { FeatureCollection } from 'geojson'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import { processPolicyByProviderId, ComplianceResponse } from '../../engine/mds-compliance-engine'
import { isSpeedRuleMatch, processSpeedPolicy } from '../../engine/speed_processors'
import { getRecentEvents } from '../../engine/helpers'
import { generateDeviceMap } from './helpers'

const SPEED_POLICY: Policy = {
  policy_id: '95645117-fd85-463e-a2c9-fc95ea47463e',
  name: 'Speed Limits',
  description: 'LADOT Pilot Speed Limit Limitations',
  start_date: 1552678594428,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
      rule_type: 'speed',
      rule_units: 'mph',
      geographies: ['1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'],
      states: {
        on_trip: []
      },
      vehicle_types: ['bicycle', 'scooter'],
      maximum: 15
    }
  ]
}

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

const geographies: Geography[] = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }
]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests Compliance Engine Speed Violations', () => {
  it('Verifies speed compliance', done => {
    const devices = makeDevices(5, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 5
    })

    const recentEvents = getRecentEvents(events)
    const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)
    const result = processPolicyByProviderId(
      SPEED_POLICY,
      TEST1_PROVIDER_ID,
      recentEvents,
      geographies,
      deviceMap
    ) as ComplianceResponse
    result.compliance.forEach(compliance => {
      if (
        compliance.rule.geographies.includes(CITY_OF_LA) &&
        compliance.matches &&
        compliance.rule.rule_type === RULE_TYPES.speed
      ) {
        test.assert.deepEqual(compliance.matches.length, 0)
      }
    })
    done()
  })

  it('Verifies speed compliance violation', done => {
    const devicesA = makeDevices(5, now())
    const eventsA = makeEventsWithTelemetry(devicesA, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })
    const devicesB = makeDevices(5, now())
    const eventsB = makeEventsWithTelemetry(devicesB, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 1
    })

    const recentEvents = getRecentEvents([...eventsA, ...eventsB])
    const deviceMap: { [d: string]: Device } = generateDeviceMap([...devicesA, ...devicesB])

    const result = processPolicyByProviderId(
      SPEED_POLICY,
      TEST1_PROVIDER_ID,
      recentEvents,
      geographies,
      deviceMap
    ) as ComplianceResponse
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
    done()
  })

  it('works with new speed processor', done => {
    const devicesA = makeDevices(5, now())
    const eventsA = makeEventsWithTelemetry(devicesA, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })
    const devicesB = makeDevices(5, now())
    const eventsB = makeEventsWithTelemetry(devicesB, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 1
    })

    const recentEvents = getRecentEvents([...eventsA, ...eventsB])
    const deviceMap: { [d: string]: Device } = generateDeviceMap([...devicesA, ...devicesB])

    const result = processSpeedPolicy(
      SPEED_POLICY,
      recentEvents as (VehicleEvent & { telemetry: Telemetry })[],
      geographies,
      deviceMap
    )
    test.assert.deepEqual(Object.keys(result).length, 5)
    done()
  })

  it('Verifies isSpeedRuleMatch', done => {
    const speedingDevices = makeDevices(1, now())
    const speedingEvents = makeEventsWithTelemetry(speedingDevices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })

    const nonSpeedingDevices = makeDevices(1, now())
    const nonSpeedingEvents = makeEventsWithTelemetry(nonSpeedingDevices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 14
    })

    const rule = SPEED_POLICY.rules[0] as SpeedRule

    test.assert(
      isSpeedRuleMatch(
        rule,
        geographies,
        speedingDevices[0],
        speedingEvents[0] as VehicleEvent & { telemetry: Telemetry }
      )
    )

    test.assert(
      !isSpeedRuleMatch(
        rule,
        geographies,
        nonSpeedingDevices[0],
        nonSpeedingEvents[0] as VehicleEvent & { telemetry: Telemetry }
      )
    )
    done()
  })
})
