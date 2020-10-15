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
  veniceSpecOps,
  LA_CITY_BOUNDARY,
  makeTelemetryInArea,
  restrictedAreas
} from '@mds-core/mds-test-data'
import test from 'unit.js'
import { FeatureCollection, Feature, Polygon } from 'geojson'
import { now, rangeRandomInt, uuid } from '@mds-core/mds-utils'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import {
  Device,
  Policy,
  Geography,
  VehicleEvent,
  UUID,
  RULE_TYPES,
  VEHICLE_TYPES,
  Telemetry,
  CountRule
} from '@mds-core/mds-types'

import MockDate from 'mockdate'
import { validatePolicies, validateGeographies, validateEvents } from '@mds-core/mds-schema-validators'
import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { VehicleEventWithTelemetry } from '../../@types'
import { ComplianceResponse, processPolicyByProviderId } from '../../engine/mds-compliance-engine'
import { getRecentEvents, getSupersedingPolicies } from '../../engine/helpers'
import { generateDeviceMap, readJson } from './helpers'
import {
  CITY_OF_LA,
  COUNT_POLICY_JSON,
  INNER_POLYGON,
  LA_GEOGRAPHY,
  VENICE_POLICY_UUID,
  OUTER_POLYGON,
  COUNT_POLICY_JSON_3,
  LA_BEACH,
  LA_BEACH_GEOGRAPHY,
  COUNT_POLICY_JSON_2,
  COUNT_POLICY_JSON_5,
  RESTRICTED_GEOGRAPHY,
  INNER_GEO,
  OUTER_GEO,
  TANZANIA_GEO,
  TANZANIA_POLYGON,
  HIGH_COUNT_POLICY,
  LOW_COUNT_POLICY,
  VENICE_OVERFLOW_POLICY,
  VENICE_MIXED_VIOLATIONS_POLICY,
  MANY_OVERFLOWS_POLICY,
  TEST_ZONE_NO_VALID_DROP_OFF_POINTS
} from '../../test_data/fixtures'
import { isCountRuleMatch, processCountPolicy } from '../../engine/count_processors'

process.env.TIMEZONE = 'America/Los_Angeles'
let policies: Policy[] = []
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

const GEOGRAPHIES = [{ name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }]

describe('Tests Compliance Engine Count Functionality:', () => {
  before(async () => {
    policies = await readJson('test_data/policies.json')
  })

  describe('basic count compliance cases', () => {
    it('isCountRuleMatch is accurate', done => {
      const LAdevices: Device[] = makeDevices(1, now())
      const LAevents = makeEventsWithTelemetry(LAdevices, now(), CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })

      const TZDevices: Device[] = makeDevices(1, now())
      const TZEvents = makeEventsWithTelemetry(TZDevices, now(), TANZANIA_POLYGON, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })

      test.assert(
        isCountRuleMatch(
          COUNT_POLICY.rules[0] as CountRule,
          GEOGRAPHIES,
          LAdevices[0],
          LAevents[0] as VehicleEvent & { telemetry: Telemetry }
        )
      )
      test.assert(
        !isCountRuleMatch(
          COUNT_POLICY.rules[0] as CountRule,
          GEOGRAPHIES,
          TZDevices[0],
          TZEvents[0] as VehicleEvent & { telemetry: Telemetry }
        )
      )
      done()
    })

    it('reports 0 violations if the number of vehicles is below the count limit', done => {
      const devices: Device[] = makeDevices(7, now())
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
      )
      test.assert.deepEqual(resultNew.total_violations, 0)
      done()
    })

    it('Verifies count compliance', done => {
      const devices = makeDevices(800, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)

      const result = processCountPolicy(HIGH_COUNT_POLICY, events, [LA_GEOGRAPHY], deviceMap)
      test.assert.deepEqual(result.total_violations, 0)
      test.assert.deepEqual(result.measured, 800)
      done()
    })

    it('Verifies count compliance maximum violation', done => {
      const devices = makeDevices(3001, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)

      const result = processCountPolicy(HIGH_COUNT_POLICY, events, [LA_GEOGRAPHY], deviceMap)
      test.assert.deepEqual(result.total_violations, 1)
      test.assert.deepEqual(Object.keys(result.overflowedVehicles).length, 1)

      //      test.assert.deepEqual(result.vehicles_in_violation.length, 1)
      done()
    })

    it('Verifies count compliance minimum violation', done => {
      const devices = makeDevices(10, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)
      const result = processCountPolicy(HIGH_COUNT_POLICY, events, GEOGRAPHIES, deviceMap)

      test.assert.deepEqual(result.total_violations, 490)
      // test.assert.deepEqual(result.vehicles_in_violation.length, 0)
      // test.assert.deepEqual(compliance.matches.length, 1)
      test.assert.deepEqual(result.measured, 10)
      done()
    })
  })

  describe('Verifies compliance engine processes by vehicle most recent event', () => {
    it('should process count violation vehicles with the most recent event last', () => {
      const devices = makeDevices(6, now())
      const start_time = now() - 10000000
      const latest_device: Device = devices[0]
      const events = devices.reduce((events_acc: VehicleEvent[], device: Device, current_index) => {
        const device_events = makeEventsWithTelemetry([device], start_time - current_index * 10, CITY_OF_LA, {
          event_types: ['trip_start'],
          vehicle_state: 'on_trip',
          speed: 0
        })
        events_acc.push(...device_events)
        return events_acc
      }, []) as VehicleEventWithTelemetry[]
      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(LOW_COUNT_POLICY, events, GEOGRAPHIES, deviceMap)
      test.assert.deepEqual(result.total_violations, 1)
      test.assert(result.overflowedVehicles[latest_device.device_id])
    })
  })

  describe('Verifies day-based bans work properly', () => {
    it('Reports violations accurately', done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 10, LA_BEACH, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      }) as VehicleEventWithTelemetry[]

      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), LA_BEACH, 10))
      })
      const TuesdayDeviceMap = generateDeviceMap(devices)
      const SaturdayDeviceMap = generateDeviceMap(devices)

      // Verifies on a Tuesday that vehicles are allowed
      MockDate.set('2019-05-21T20:00:00.000Z')
      const tuesdayResult = processCountPolicy(COUNT_POLICY_JSON_2, events, [LA_BEACH_GEOGRAPHY], TuesdayDeviceMap)
      test.assert(tuesdayResult.total_violations === 0)
      // Verifies on a Saturday that vehicles are banned
      MockDate.set('2019-05-25T20:00:00.000Z')
      const saturdayResult = processCountPolicy(COUNT_POLICY_JSON_2, events, [LA_BEACH_GEOGRAPHY], SaturdayDeviceMap)
      console.log(saturdayResult)
      test.assert(saturdayResult.total_violations === 15)
      test.assert(Object.keys(saturdayResult.overflowedVehicles).length === 15)
      MockDate.reset()
      done()
    })
  })

  describe('Verify that rules written for a particular event_type only apply to events of that event_type', () => {
    it('Verifies violations for on_hours events', () => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['on_hours'],
        vehicle_state: 'available',
        speed: 0
      }) as VehicleEventWithTelemetry[]
      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(COUNT_POLICY_JSON_3, events, [LA_GEOGRAPHY], deviceMap)

      test.assert.deepEqual(Object.keys(result.matchedVehicles).length, 10)
      test.assert.deepEqual(result.total_violations, 5)
    })

    it('Verifies no violations for a different event_type', done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(COUNT_POLICY_JSON_3, events, [LA_GEOGRAPHY], deviceMap)
      test.assert.deepEqual(result.total_violations, 0)
      done()
    })
  })

  describe('Verifies max 0 count policy', () => {
    it('exercises the max 0 compliance', done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 10, LA_BEACH, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      }) as VehicleEventWithTelemetry[]

      const deviceMap = generateDeviceMap(devices)
      const result = processCountPolicy(COUNT_POLICY_JSON_5, events, [RESTRICTED_GEOGRAPHY], deviceMap)

      test.assert.deepEqual(result.total_violations, 15)
      done()
    })
  })

  describe('Verifies count logic behaves properly when one geography is contained in another', () => {
    it('has the correct number of matches per rule', done => {
      const veniceSpecOpsPointIds: UUID[] = []
      const geographies = (veniceSpecOps.features.map((feature: Feature) => {
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
      }) as unknown) as Geography[]

      const VENICE_SPEC_OPS_POLICY: Policy = {
        name: 'Venice Special Operations Zone',
        description: 'LADOT Venice Drop-off/no-fly zones',
        policy_id: VENICE_POLICY_UUID,
        start_date: 1558389669540,
        publish_date: 1558389669540,
        end_date: null,
        prev_policies: null,
        provider_ids: [],
        rules: [
          {
            // no maximum set for this rule means an arbitrary number of vehicles can be dropped off here
            name: 'Valid Provider Drop Offs',
            rule_id: '7a043ac8-03cd-4b0d-9588-d0af24f82832',
            rule_type: RULE_TYPES.count,
            geographies: veniceSpecOpsPointIds,
            states: { available: ['provider_drop_off'] },
            vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter]
          },
          {
            name: 'Drop-off No-Fly Zones',
            rule_id: '596d7fe1-53fd-4ea4-8ba7-33f5ea8d98a6',
            rule_type: RULE_TYPES.count,
            geographies: ['e0e4a085-7a50-43e0-afa4-6792ca897c5a'],
            states: { available: ['provider_drop_off'] },
            vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
            maximum: 0
          }
        ]
      }

      const devices_a: Device[] = makeDevices(22, now())
      let iter = 0
      const events_a: VehicleEvent[] = veniceSpecOps.features.reduce((acc: VehicleEvent[], feature: Feature) => {
        if (feature.geometry.type === 'Point') {
          acc.push(
            ...makeEventsWithTelemetry([devices_a[iter++]], now() - 10, feature.geometry, {
              event_types: ['provider_drop_off'],
              vehicle_state: 'available',
              speed: 0
            })
          )
        }
        return acc
      }, [])

      const devices_b: Device[] = makeDevices(10, now())
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

      const deviceMap: { [d: string]: Device } = generateDeviceMap([...devices_a, ...devices_b])
      const result = processCountPolicy(
        VENICE_SPEC_OPS_POLICY,
        [...events_a, ...events_b] as VehicleEventWithTelemetry[],
        geographies,
        deviceMap
      )
      test.assert(result.total_violations === 10)
      // for these count results, matches are sorted by geography
      // for the first compliance result, there's one or two vehicle matches for each of the 20 or so geographies
      //      test.assert(result.compliance[0].matches.length === 22)
      // for the second compliance result, there's one geography
      //     test.assert(result.compliance[1].matches.length === 1)
      // and therefore 10 vehicles that match for that geography
      //    test.assert(result.compliance[1].matches[0].measured === 10)
      done()
    })

    it('does overflow correctly', done => {
      // The polygons within which these events are being created do not overlap
      // with each other at all.
      const devices_a: Device[] = makeDevices(3, now())
      const events_a: VehicleEvent[] = makeEventsWithTelemetry(devices_a, now() - 10, INNER_POLYGON, {
        event_types: ['provider_drop_off'],
        vehicle_state: 'available',
        speed: 0
      })

      const devices_b: Device[] = makeDevices(2, now())
      const events_b: VehicleEvent[] = makeEventsWithTelemetry(devices_b, now() - 10, OUTER_POLYGON, {
        event_types: ['provider_drop_off'],
        vehicle_state: 'available',
        speed: 0
      })
      const deviceMap: { [d: string]: Device } = generateDeviceMap([...devices_a, ...devices_b])
      const result = processCountPolicy(
        VENICE_OVERFLOW_POLICY,
        [...events_a, ...events_b] as VehicleEventWithTelemetry[],
        [INNER_GEO, OUTER_GEO],
        deviceMap
      )

      //      test.assert.equal(result.compliance[0].matches[0].measured, 1)
      //      test.assert.equal(result.compliance[1].matches[0].measured, 2)
      test.assert.equal(result.total_violations, 2)
      //     test.assert.equal(result.vehicles_in_violation.length, 2)
      done()
    })
  })

  it('counts total_violations accurately when mixing count minumum and maximum violations', done => {
    // The polygons within which these events are being created do not overlap
    // with each other at all.
    const devices_a: Device[] = makeDevices(3, now())
    const events_a: VehicleEvent[] = makeEventsWithTelemetry(devices_a, now() - 10, INNER_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })

    const devices_b: Device[] = makeDevices(2, now())
    const events_b: VehicleEvent[] = makeEventsWithTelemetry(devices_b, now() - 10, OUTER_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })
    const deviceMap: { [d: string]: Device } = generateDeviceMap([...devices_a, ...devices_b])
    const result = processPolicyByProviderId(
      VENICE_MIXED_VIOLATIONS_POLICY,
      TEST1_PROVIDER_ID,
      [...events_a, ...events_b],
      [INNER_GEO, OUTER_GEO],
      deviceMap
    ) as ComplianceResponse

    test.assert.equal(result.compliance[0].matches[0].measured, 1)
    test.assert.equal(result.compliance[1].matches[0].measured, 4)
    test.assert.equal(result.total_violations, 6)
    test.assert.equal(result.vehicles_in_violation.length, 0)
    done()
  })

  it('accurately tracks overflows per rule', done => {
    // The polygons within which these events are being created do not overlap
    // with each other at all.
    const devices_a: Device[] = makeDevices(2, now())
    const events_a: VehicleEvent[] = makeEventsWithTelemetry(devices_a, now() - 10, INNER_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })

    const devices_b: Device[] = makeDevices(4, now())
    const events_b: VehicleEvent[] = makeEventsWithTelemetry(devices_b, now() - 10, TANZANIA_POLYGON, {
      event_types: ['provider_drop_off'],
      vehicle_state: 'available',
      speed: 0
    })
    const deviceMap: { [d: string]: Device } = generateDeviceMap([...devices_a, ...devices_b])
    const result = processPolicyByProviderId(
      MANY_OVERFLOWS_POLICY,
      TEST1_PROVIDER_ID,
      [...events_a, ...events_b],
      [INNER_GEO, TANZANIA_GEO],
      deviceMap
    ) as ComplianceResponse

    /* If there was a problem with the overflow logic, then the violation
     * from the first rule would have overflowed into evaluation for the
     * second rule, and there would be no violations at all.
     */
    test.assert.equal(result.compliance[0].matches[0].measured, 1)
    test.assert.equal(result.compliance[1].matches[0].measured, 4)
    test.assert.equal(result.total_violations, 1)
    test.assert.equal(result.vehicles_in_violation.length, 1)
    done()
  })
})
