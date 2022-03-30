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

import type { GeographyDomainModel } from '@mds-core/mds-geography-service'
import type { DeviceDomainModel } from '@mds-core/mds-ingest-service'
import type { CountPolicy, CountRule } from '@mds-core/mds-policy-service'
import { RULE_TYPES } from '@mds-core/mds-policy-service'
import {
  LA_CITY_BOUNDARY,
  makeDevices,
  makeEventsWithTelemetry,
  makeTelemetryInArea,
  veniceSpecOps
} from '@mds-core/mds-test-data'
import type { Telemetry, UUID, VehicleEvent } from '@mds-core/mds-types'
import { now, rangeRandomInt, uuid } from '@mds-core/mds-utils'
import type { Feature, FeatureCollection } from 'geojson'
import MockDate from 'mockdate'
import type { ComplianceEngineResult, VehicleEventWithTelemetry } from '../../@types'
import { isCountRuleMatch, processCountPolicy } from '../../engine/count_processors'
import { generateDeviceMap } from '../../engine/helpers'
import {
  CITY_OF_LA,
  COUNT_POLICY_JSON,
  COUNT_POLICY_JSON_2,
  COUNT_POLICY_JSON_3,
  COUNT_POLICY_JSON_5,
  HIGH_COUNT_POLICY,
  INNER_GEO,
  INNER_POLYGON,
  INNER_POLYGON_2,
  LA_BEACH,
  LA_BEACH_GEOGRAPHY,
  LA_GEOGRAPHY,
  MANY_OVERFLOWS_POLICY,
  OUTER_GEO,
  RESTRICTED_GEOGRAPHY,
  TANZANIA_GEO,
  TANZANIA_POLYGON,
  TEST_ZONE_NO_VALID_DROP_OFF_POINTS,
  VENICE_MIXED_VIOLATIONS_POLICY,
  VENICE_OVERFLOW_POLICY,
  VENICE_POLICY_UUID
} from '../../test_data/fixtures'

process.env.TIMEZONE = 'America/Los_Angeles'
const COUNT_POLICY = {
  policy_id: '221975ef-569c-40a1-a9b0-646e6155c764',
  name: 'LADOT Pilot Caps',
  description: 'LADOT Pilot Caps (add description)',
  start_date: 1552678594428,
  end_date: null,
  prev_policies: null,
  provider_ids: null,
  rules: [
    {
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
  ]
}

const GEOGRAPHIES: GeographyDomainModel[] = [
  {
    name: 'la',
    geography_id: CITY_OF_LA,
    geography_json: LA_CITY_BOUNDARY as FeatureCollection,
    description: '',
    effective_date: null,
    prev_geographies: null,
    publish_date: null
  }
]

describe('Tests Compliance Engine Count Functionality:', () => {
  describe('basic count compliance cases', () => {
    it('isCountRuleMatch is accurate', async () => {
      const LAdevices = makeDevices(1, now())
      const LAevents = makeEventsWithTelemetry(LAdevices, now(), CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })

      const TZDevices = makeDevices(1, now())
      const TZEvents = makeEventsWithTelemetry(TZDevices, now(), TANZANIA_POLYGON, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })

      expect(
        isCountRuleMatch(
          COUNT_POLICY.rules[0] as CountRule,
          GEOGRAPHIES,
          LAdevices[0],
          LAevents[0] as VehicleEvent & { telemetry: Telemetry }
        )
      ).toBeTruthy()
      expect(
        !isCountRuleMatch(
          COUNT_POLICY.rules[0] as CountRule,
          GEOGRAPHIES,
          TZDevices[0],
          TZEvents[0] as VehicleEvent & { telemetry: Telemetry }
        )
      ).toBeTruthy()
    })

    it('reports 0 violations if the number of vehicles is below the count limit', async () => {
      const devices: DeviceDomainModel[] = makeDevices(7, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })
      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), CITY_OF_LA, 10))
      })
      const deviceMap = generateDeviceMap(devices)
      const resultNew = processCountPolicy(
        COUNT_POLICY_JSON,
        events as (VehicleEvent & { telemetry: Telemetry })[],
        [LA_GEOGRAPHY],
        deviceMap
      ) as ComplianceEngineResult
      expect(resultNew.total_violations).toStrictEqual(0)
    })

    it('Verifies count compliance', async () => {
      const devices = makeDevices(800, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap(devices)

      const result = processCountPolicy(HIGH_COUNT_POLICY, events, [LA_GEOGRAPHY], deviceMap) as ComplianceEngineResult
      expect(result.total_violations).toStrictEqual(0)
      expect(result.vehicles_found.length).toStrictEqual(800)
    })

    it('Verifies count compliance maximum violation', async () => {
      const devices = makeDevices(3001, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap(devices)

      const result = processCountPolicy(HIGH_COUNT_POLICY, events, [LA_GEOGRAPHY], deviceMap) as ComplianceEngineResult
      expect(result.total_violations).toStrictEqual(1)
      expect(result.vehicles_found.length).toStrictEqual(3001)
    })

    it('Verifies count compliance minimum violation', async () => {
      const matchingDevices = makeDevices(10, now())
      const notMatchingDevices = makeDevices(10, now())
      const matchingEvents = makeEventsWithTelemetry(matchingDevices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const notMatchingEvents = makeEventsWithTelemetry(notMatchingDevices, now(), CITY_OF_LA, {
        event_types: ['unspecified'],
        vehicle_state: 'unknown',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([
        ...matchingDevices,
        ...notMatchingDevices
      ])
      const result = processCountPolicy(
        HIGH_COUNT_POLICY,
        [...matchingEvents, ...notMatchingEvents],
        GEOGRAPHIES,
        deviceMap
      ) as ComplianceEngineResult

      expect(result.total_violations).toStrictEqual(490)
      expect(result.vehicles_found.length).toStrictEqual(10)
    })
  })

  describe('Verifies day-based bans work properly', () => {
    it('Reports violations accurately', async () => {
      const devices: DeviceDomainModel[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 10, LA_BEACH, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      }) as VehicleEventWithTelemetry[]

      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), LA_BEACH, 10))
      })
      const TuesdayDeviceDomainModelMap = generateDeviceMap(devices)
      const SaturdayDeviceDomainModelMap = generateDeviceMap(devices)

      // Verifies on a Tuesday that vehicles are allowed
      MockDate.set('2019-05-21T20:00:00.000Z')
      const tuesdayResult = processCountPolicy(
        COUNT_POLICY_JSON_2,
        events,
        [LA_BEACH_GEOGRAPHY],
        TuesdayDeviceDomainModelMap
      ) as ComplianceEngineResult
      expect(tuesdayResult.total_violations).toStrictEqual(0)
      // Verifies on a Saturday that vehicles are banned
      MockDate.set('2019-05-25T20:00:00.000Z')
      const saturdayResult = processCountPolicy(
        COUNT_POLICY_JSON_2,
        events,
        [LA_BEACH_GEOGRAPHY],
        SaturdayDeviceDomainModelMap
      ) as ComplianceEngineResult
      expect(saturdayResult.total_violations).toStrictEqual(15)
      MockDate.reset()
    })
  })

  describe('Verify that rules written for a particular event_type only apply to events of that event_type', () => {
    it('Verifies violations for on_hours events', () => {
      const devices: DeviceDomainModel[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['on_hours'],
        vehicle_state: 'available',
        speed: 0
      }) as VehicleEventWithTelemetry[]
      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(
        COUNT_POLICY_JSON_3,
        events,
        [LA_GEOGRAPHY],
        deviceMap
      ) as ComplianceEngineResult

      expect(result.vehicles_found.length).toStrictEqual(15)
      expect(result.total_violations).toStrictEqual(5)
    })

    it('Verifies no violations for a different event_type', async () => {
      const devices: DeviceDomainModel[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(
        COUNT_POLICY_JSON_3,
        events,
        [LA_GEOGRAPHY],
        deviceMap
      ) as ComplianceEngineResult
      expect(result.total_violations).toStrictEqual(0)
    })
  })

  describe('Verifies max 0 count policy', () => {
    it('exercises the max 0 compliance', async () => {
      const devices: DeviceDomainModel[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 10, LA_BEACH, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(
        COUNT_POLICY_JSON_5,
        events,
        [RESTRICTED_GEOGRAPHY],
        deviceMap
      ) as ComplianceEngineResult

      expect(result.total_violations).toStrictEqual(15)
    })
  })

  describe('Verifies count logic behaves properly when one geography is contained in another', () => {
    it('has the correct number of matches per rule', async () => {
      const veniceSpecOpsPointIds: UUID[] = []
      const geographies = veniceSpecOps.features.map((feature: Feature) => {
        if (feature.geometry.type === 'Point') {
          const geography_id = uuid()
          // points where drop-offs are allowed
          veniceSpecOpsPointIds.push(geography_id)
          return {
            geography_id,
            geography_json: feature.geometry
          }
        }
        // larger zone wherein drop-offs are banned
        return {
          geography_id: 'e0e4a085-7a50-43e0-afa4-6792ca897c5a',
          geography_json: feature.geometry
        }
      }) as unknown as GeographyDomainModel[]

      const VENICE_SPEC_OPS_POLICY: CountPolicy = {
        name: 'Venice Special Operations Zone',
        description: 'LADOT Venice Drop-off/no-fly zones',
        policy_id: VENICE_POLICY_UUID,
        start_date: 1558389669540,
        publish_date: 1558389669540,
        end_date: null,
        prev_policies: null,
        currency: null,
        provider_ids: [],
        rules: [
          {
            // no maximum set for this rule means an arbitrary number of vehicles can be dropped off here
            name: 'Valid Provider Drop Offs',
            rule_id: '7a043ac8-03cd-4b0d-9588-d0af24f82832',
            rule_type: RULE_TYPES.count,
            geographies: veniceSpecOpsPointIds,
            states: { available: ['provider_drop_off'] },
            vehicle_types: ['bicycle', 'scooter']
          },
          {
            name: 'Drop-off No-Fly Zones',
            rule_id: '596d7fe1-53fd-4ea4-8ba7-33f5ea8d98a6',
            rule_type: RULE_TYPES.count,
            geographies: ['e0e4a085-7a50-43e0-afa4-6792ca897c5a'],
            states: { available: ['provider_drop_off'] },
            vehicle_types: ['bicycle', 'scooter'],
            maximum: 0
          }
        ]
      }

      const devices_a: DeviceDomainModel[] = makeDevices(22, now())
      let iter = 0
      const events_a: VehicleEvent[] = veniceSpecOps.features.reduce((acc: VehicleEvent[], feature: Feature) => {
        if (feature.geometry.type === 'Point') {
          acc.push(
            ...makeEventsWithTelemetry([devices_a[iter++] as DeviceDomainModel], now() - 10, feature.geometry, {
              event_types: ['provider_drop_off'],
              vehicle_state: 'available',
              speed: 0
            })
          )
        }
        return acc
      }, [])

      const devices_b: DeviceDomainModel[] = makeDevices(10, now())
      const events_b: VehicleEvent[] = makeEventsWithTelemetry(
        devices_b,
        now() - 10,
        TEST_ZONE_NO_VALID_DROP_OFF_POINTS,
        {
          event_types: ['provider_drop_off'],
          vehicle_state: 'available',
          speed: 0
        }
      )

      const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([...devices_a, ...devices_b])
      const result = processCountPolicy(
        VENICE_SPEC_OPS_POLICY,
        [...events_a, ...events_b] as VehicleEventWithTelemetry[],
        geographies,
        deviceMap
      ) as ComplianceEngineResult
      expect(result.total_violations).toStrictEqual(10)
    })

    it('does overflow correctly', async () => {
      /* The polygons within which these events are being created do not overlap
       with each other at all. They are both contained within the greater Venice
       geography. The devices in INNER_POLYGON should overflow into the rule evaluation
       for the second rule.
       */
      const devices_a: DeviceDomainModel[] = makeDevices(3, now())
      const events_a: VehicleEvent[] = makeEventsWithTelemetry(devices_a, now(), INNER_POLYGON, {
        event_types: ['provider_drop_off'],
        vehicle_state: 'available',
        speed: 0
      })

      const devices_b: DeviceDomainModel[] = makeDevices(2, now())
      const events_b: VehicleEvent[] = makeEventsWithTelemetry(devices_b, now(), INNER_POLYGON_2, {
        event_types: ['provider_drop_off'],
        vehicle_state: 'available',
        speed: 0
      })

      const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([...devices_a, ...devices_b])
      const result = processCountPolicy(
        VENICE_OVERFLOW_POLICY,
        [...events_a, ...events_b] as VehicleEventWithTelemetry[],
        [INNER_GEO, OUTER_GEO],
        deviceMap
      ) as ComplianceEngineResult

      const rule_0_id = VENICE_OVERFLOW_POLICY.rules[0]?.rule_id
      const rule_1_id = VENICE_OVERFLOW_POLICY.rules[1]?.rule_id

      if (!rule_0_id || !rule_1_id) {
        throw new Error('Expected rule_ids')
      }
      const { vehicles_found } = result

      const violatingVehicles = vehicles_found.filter(vehicle => !!vehicle.rule_applied)
      const vehiclesCapturedByRule0 = vehicles_found.filter(
        vehicle =>
          vehicle.rule_applied === rule_0_id &&
          vehicle.rules_matched.includes(rule_0_id) &&
          vehicle.rules_matched.includes(rule_1_id)
      )
      const vehiclesCapturedByRule1 = vehicles_found.filter(
        vehicle => vehicle.rule_applied === rule_1_id && vehicle.rules_matched.includes(rule_1_id)
      )

      expect(vehiclesCapturedByRule0.length).toStrictEqual(1)
      expect(vehiclesCapturedByRule1.length).toStrictEqual(2)

      const vehiclesMatchingBothRules = vehicles_found.filter(
        vehicle => vehicle.rules_matched.includes(rule_0_id) && vehicle.rules_matched.includes(rule_1_id)
      )
      expect(vehiclesMatchingBothRules.length).toStrictEqual(3)

      violatingVehicles.forEach(vehicle => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(vehicle.rules_matched.includes(VENICE_OVERFLOW_POLICY.rules[1]!.rule_id)).toBeTruthy()
      })

      expect(result.total_violations).toStrictEqual(2)
    })
  })

  it('counts total_violations accurately when mixing count minumum and maximum violations', async () => {
    // The polygons within which these events are being created do not overlap
    // with each other at all.
    const devices_a: DeviceDomainModel[] = makeDevices(3, now())
    const events_a: VehicleEvent[] = makeEventsWithTelemetry(devices_a, now() - 10, INNER_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })

    const devices_b: DeviceDomainModel[] = makeDevices(2, now())
    const events_b: VehicleEvent[] = makeEventsWithTelemetry(devices_b, now() - 10, INNER_POLYGON_2, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })

    // The geo of the first rule is contained within the geo of the second rule.
    const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([...devices_a, ...devices_b])
    const result = processCountPolicy(
      VENICE_MIXED_VIOLATIONS_POLICY,
      [...events_a, ...events_b] as VehicleEventWithTelemetry[],
      [INNER_GEO, OUTER_GEO],
      deviceMap
    ) as ComplianceEngineResult

    expect(result.total_violations).toStrictEqual(6)
  })

  it('accurately tracks overflows per rule and marks each vehicle_found with the rules that apply or match', async () => {
    // The polygons within which these events are being created do not overlap
    // with each other at all.
    const devices_a: DeviceDomainModel[] = makeDevices(2, now())
    const events_a: VehicleEvent[] = makeEventsWithTelemetry(devices_a, now() - 10, INNER_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })

    const devices_b: DeviceDomainModel[] = makeDevices(4, now())
    const events_b: VehicleEvent[] = makeEventsWithTelemetry(devices_b, now() - 10, TANZANIA_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })
    const deviceMap: { [d: string]: DeviceDomainModel } = generateDeviceMap([...devices_a, ...devices_b])
    const result = processCountPolicy(
      MANY_OVERFLOWS_POLICY,
      [...events_a, ...events_b] as VehicleEventWithTelemetry[],
      [INNER_GEO, TANZANIA_GEO],
      deviceMap
    ) as ComplianceEngineResult

    /* If there was a problem with the overflow logic, then the violation
     * from the first rule would have overflowed into evaluation for the
     * second rule, and there would be no violations at all.
     */
    expect(result.total_violations).toStrictEqual(1)
    const rule_0_id = MANY_OVERFLOWS_POLICY.rules[0]?.rule_id
    const rule_1_id = MANY_OVERFLOWS_POLICY.rules[1]?.rule_id

    if (!rule_0_id || !rule_1_id) {
      throw new Error('Expected rule_ids')
    }

    const rule_0_applied = result.vehicles_found.filter(vehicle => {
      return vehicle.rule_applied === rule_0_id && vehicle.rules_matched.includes(rule_0_id)
    }).length
    expect(rule_0_applied).toStrictEqual(1)
    const rule_0_matched = result.vehicles_found.filter(vehicle => {
      return vehicle.rules_matched.includes(rule_0_id)
    }).length
    expect(rule_0_matched).toStrictEqual(2)
    const rule_0_overflowed = result.vehicles_found.filter(vehicle => {
      return vehicle.rules_matched.includes(rule_0_id) && !!vehicle.rule_applied
    }).length
    expect(rule_0_overflowed).toStrictEqual(1)

    const rule_1_applied = result.vehicles_found.filter(vehicle => {
      return vehicle.rule_applied === rule_1_id && vehicle.rules_matched.includes(rule_1_id)
    }).length
    expect(rule_1_applied).toStrictEqual(4)
    const rule_1_matched = result.vehicles_found.filter(vehicle => {
      return vehicle.rules_matched.includes(rule_1_id)
    }).length
    expect(rule_1_matched).toStrictEqual(4)
  })
})
