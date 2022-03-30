/**
 * Copyright 2021 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { MatchedVehicleInformation } from '@mds-core/mds-compliance-service/@types'
import type { GeographyDomainModel } from '@mds-core/mds-geography-service'
import type { DeviceDomainModel } from '@mds-core/mds-ingest-service'
import type { SpeedPolicy, SpeedRule } from '@mds-core/mds-policy-service'
import { LA_CITY_BOUNDARY, makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import type { Telemetry, VehicleEvent } from '@mds-core/mds-types'
import type { FeatureCollection } from 'geojson'
import type { ComplianceEngineResult, VehicleEventWithTelemetry } from '../../@types'
import { filterEvents, generateDeviceMap } from '../../engine/helpers'
import { isSpeedRuleMatch, processSpeedPolicy } from '../../engine/speed_processors'
import {
  INNER_GEO,
  INNER_POLYGON,
  INNER_POLYGON_2,
  OUTER_GEO,
  OVERLAPPING_GEOS_SPEED_POLICY
} from '../../test_data/fixtures'

const SPEED_POLICY: SpeedPolicy = {
  policy_id: '95645117-fd85-463e-a2c9-fc95ea47463e',
  name: 'Speed Limits',
  description: 'LADOT Pilot Speed Limit Limitations',
  start_date: 1552678594428,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  currency: null,
  publish_date: null,
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

const geographies = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: LA_CITY_BOUNDARY as FeatureCollection }
] as GeographyDomainModel[]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests Compliance Engine Speed Violations', () => {
  it('Verifies speed compliance', async () => {
    const devices = makeDevices(5, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 5
    }) as VehicleEventWithTelemetry[]

    const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap(devices)

    const result = processSpeedPolicy(SPEED_POLICY, events, geographies, deviceMap) as ComplianceEngineResult
    expect(result.total_violations).toStrictEqual(0)
    expect(result.vehicles_found).toStrictEqual([])
  })

  it('verifies speed compliance violation (simple case)', async () => {
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

    const recentEvents = filterEvents([...eventsA, ...eventsB])
    const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([...devicesA, ...devicesB])

    const result = processSpeedPolicy(
      SPEED_POLICY,
      recentEvents as (VehicleEvent & { telemetry: Telemetry })[],
      geographies,
      deviceMap
    ) as ComplianceEngineResult
    expect(result.vehicles_found.length).toStrictEqual(5)
    expect(result.total_violations).toStrictEqual(5)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { rule_id } = SPEED_POLICY.rules[0]!
    // Note that for speed rule matches, `rule_applied` is never null.
    const speedingCount = result.vehicles_found.reduce((count: number, vehicle: MatchedVehicleInformation) => {
      if (vehicle.rule_applied === rule_id && vehicle.rules_matched.includes(rule_id)) {
        count += 1
      }
      return count
    }, 0)
    expect(speedingCount).toStrictEqual(5)
  })

  it('correctly handles a speed policy with overlapping geos and assigns the values of `rules_matched` and `rule_applied`', async () => {
    const devicesA = makeDevices(3, now())
    const eventsA = makeEventsWithTelemetry(devicesA, now(), INNER_POLYGON, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })
    const devicesB = makeDevices(5, now())
    const eventsB = makeEventsWithTelemetry(devicesB, now(), INNER_POLYGON_2, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 100
    })

    const recentEvents = filterEvents([...eventsA, ...eventsB])
    const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([...devicesA, ...devicesB])

    const result = processSpeedPolicy(
      OVERLAPPING_GEOS_SPEED_POLICY,
      recentEvents as (VehicleEvent & { telemetry: Telemetry })[],
      [INNER_GEO, OUTER_GEO],
      deviceMap
    ) as ComplianceEngineResult
    expect(result.vehicles_found.length).toStrictEqual(8)
    expect(result.total_violations).toStrictEqual(8)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { rule_id } = OVERLAPPING_GEOS_SPEED_POLICY.rules[0]!
    const rule_id_2 = OVERLAPPING_GEOS_SPEED_POLICY.rules[1]?.rule_id as string

    // Note that for speed rule matches, `rule_applied` is never null.
    const speedingCount_1 = result.vehicles_found.reduce((count: number, vehicle: MatchedVehicleInformation) => {
      if (
        vehicle.rule_applied === rule_id &&
        // i.e. `vehicle.rules_matched === [rule_id_1, rule_id_2], if `===` worked for array equality
        vehicle.rules_matched.includes(rule_id) &&
        vehicle.rules_matched.includes(rule_id_2) &&
        vehicle.rules_matched.length === 2 &&
        vehicle.speed === 500
      ) {
        count += 1
      }
      return count
    }, 0)
    expect(speedingCount_1).toStrictEqual(3)
    const speedingCount_2 = result.vehicles_found.reduce((count: number, vehicle: MatchedVehicleInformation) => {
      if (
        vehicle.rule_applied === rule_id_2 &&
        // i.e. `vehicle.rules_matched === [rule_id_2], if `===` worked for array equality
        vehicle.rules_matched.includes(rule_id_2) &&
        vehicle.rules_matched.length === 1 &&
        vehicle.speed === 100
      ) {
        count += 1
      }
      return count
    }, 0)
    expect(speedingCount_2).toStrictEqual(5)
  })

  it('Verifies isSpeedRuleMatch', async () => {
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

    expect(
      isSpeedRuleMatch(
        rule,
        geographies,
        speedingDevices[0],
        speedingEvents[0] as VehicleEvent & { telemetry: Telemetry }
      )
    ).toBeTruthy()

    expect(
      !isSpeedRuleMatch(
        rule,
        geographies,
        nonSpeedingDevices[0],
        nonSpeedingEvents[0] as VehicleEvent & { telemetry: Telemetry }
      )
    ).toBeTruthy()
  })
})
