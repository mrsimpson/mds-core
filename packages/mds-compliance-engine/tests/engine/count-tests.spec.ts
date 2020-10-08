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
import { TEST1_PROVIDER_ID, TEST2_PROVIDER_ID, MOCHA_PROVIDER_ID, JUMP_PROVIDER_ID } from '@mds-core/mds-providers'
import {
  Device,
  Policy,
  Geography,
  VehicleEvent,
  UUID,
  RULE_TYPES,
  VEHICLE_TYPES,
  Telemetry
} from '@mds-core/mds-types'

import MockDate from 'mockdate'
import { validatePolicies, validateGeographies, validateEvents } from '@mds-core/mds-schema-validators'
import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import {
  ComplianceResponse,
  getRecentEvents,
  getSupersedingPolicies,
  processPolicy
} from '../../engine/mds-compliance-engine'
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
  OUTER_GEO
} from './fixtures'

process.env.TIMEZONE = 'America/Los_Angeles'
let policies: Policy[] = []
const GEOGRAPHIES = [{ name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }]

describe('Tests Compliance Engine Count Functionality:', () => {
  before(async () => {
    policies = await readJson('test_data/policies.json')
  })

  describe('basic count compliance cases', () => {
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
      const result = processPolicy(COUNT_POLICY_JSON, events, [LA_GEOGRAPHY], deviceMap)
      test.assert.deepEqual(result?.total_violations, 0)
      done()
    })

    it('Verifies count compliance', done => {
      const devices = makeDevices(800, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      })

      const recentEvents = getRecentEvents(events)
      const supersedingPolicies = getSupersedingPolicies(policies)
      const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)

      const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, [LA_GEOGRAPHY], deviceMap))
      results.forEach(result => {
        if (result) {
          result.compliance.forEach(compliance => {
            if (compliance.matches && compliance.rule.rule_type === RULE_TYPES.count) {
              test.assert.deepEqual(compliance.matches.length, 1)
            }
          })
        }
      })
      done()
    })

    it('Verifies count compliance maximum violation', done => {
      const devices = makeDevices(3001, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      })
      test.assert.doesNotThrow(() => validatePolicies(policies))
      test.assert.doesNotThrow(() => validateGeographies([LA_GEOGRAPHY]))
      test.assert.doesNotThrow(() => validateEvents(events))

      const recentEvents = getRecentEvents(events)
      const supersedingPolicies = getSupersedingPolicies(policies)
      const deviceMap: { [d: string]: Device } = devices.reduce(
        (deviceMapAcc: { [d: string]: Device }, device: Device) => {
          return Object.assign(deviceMapAcc, { [device.device_id]: device })
        },
        {}
      )
      const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, [LA_GEOGRAPHY], deviceMap))

      results.forEach(result => {
        if (result) {
          result.compliance.forEach(compliance => {
            if (
              compliance.matches &&
              compliance.rule.rule_type === RULE_TYPES.count &&
              compliance.rule.geographies.includes(CITY_OF_LA)
            ) {
              test.assert.notEqual(compliance.matches.length, 0)
              test.assert.deepEqual(result.total_violations, 1)
            }
          })
        }
      })
      done()
    })

    it('Verifies count compliance minimum violation', done => {
      const devices = makeDevices(10, now())
      const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      })
      test.assert.doesNotThrow(() => validateEvents(events))

      const recentEvents = getRecentEvents(events)
      const supersedingPolicies = getSupersedingPolicies(policies)
      const deviceMap: { [d: string]: Device } = devices.reduce(
        (deviceMapAcc: { [d: string]: Device }, device: Device) => {
          return Object.assign(deviceMapAcc, { [device.device_id]: device })
        },
        {}
      )
      const results = supersedingPolicies.map(policy => processPolicy(policy, recentEvents, GEOGRAPHIES, deviceMap))

      results.forEach(result => {
        if (result) {
          result.compliance.forEach(compliance => {
            if (
              compliance.matches &&
              compliance.rule.rule_type === RULE_TYPES.count &&
              compliance.rule.geographies.includes(CITY_OF_LA)
            ) {
              test.assert.notEqual(compliance.matches.length, 0)
              test.assert.deepEqual(result.total_violations, 490)
            }
          })
        }
      })
      done()
    })
  })

  describe('Verifies compliance engine processes by vehicle most recent event', async () => {
    it('should process count violation vehicles with the most recent event last', async () => {
      const low_count_policies = await readJson('test_data/low_limit_policy.json')
      const devices = makeDevices(6, now())
      const start_time = now() - 10000000
      const latest_device: Device = devices[0]
      const events: VehicleEvent[] = devices.reduce((events_acc: VehicleEvent[], device: Device, current_index) => {
        const device_events = makeEventsWithTelemetry([device], start_time - current_index * 10, CITY_OF_LA, {
          event_types: ['trip_start'],
          vehicle_state: 'on_trip',
          speed: 0
        })
        events_acc.push(...device_events)
        return events_acc
      }, [])
      const deviceMap = generateDeviceMap(devices)
      const results = low_count_policies.map(policy => processPolicy(policy, events, GEOGRAPHIES, deviceMap))
      results.forEach(result => {
        if (result) {
          result.compliance.forEach(compliance => {
            // It's not necessary to verify it works for the other rule types since the sorting happens before
            // any policy processing happens.
            if (
              compliance.rule.geographies.includes(CITY_OF_LA) &&
              compliance.matches &&
              compliance.rule.rule_type === RULE_TYPES.count
            ) {
              test.assert.deepEqual(compliance.matches.length, 1)
              test.assert.deepEqual(result.vehicles_in_violation[0].device.device_id, latest_device.device_id)
            }
          })
        }
      })
    })
  })

  describe('Verifies day-based bans work properly', () => {
    it('Reports violations accurately', done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 10, LA_BEACH, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: rangeRandomInt(10)
      })
      const telemetry: Telemetry[] = []
      devices.forEach(device => {
        telemetry.push(makeTelemetryInArea(device, now(), LA_BEACH, 10))
      })
      const deviceMap = generateDeviceMap(devices)

      // Verifies on a Tuesday that vehicles are allowed
      MockDate.set('2019-05-21T20:00:00.000Z')
      const tuesdayResult = processPolicy(
        COUNT_POLICY_JSON_2,
        events,
        [LA_BEACH_GEOGRAPHY],
        deviceMap
      ) as ComplianceResponse
      test.assert(tuesdayResult.compliance.length === 1)
      // Verifies on a Saturday that vehicles are banned
      MockDate.set('2019-05-25T20:00:00.000Z')
      const saturdayResult = processPolicy(
        COUNT_POLICY_JSON_2,
        events,
        [LA_BEACH_GEOGRAPHY],
        deviceMap
      ) as ComplianceResponse
      test.assert(saturdayResult.compliance[0].matches[0].measured === 15)
      MockDate.reset()
      done()
    })
  })

  describe('Verify that rules written for a particular event_type only apply to events of that event_type', () => {
    it('Verifies violations for on_hours events', done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['on_hours'],
        vehicle_state: 'available',
        speed: 0
      })
      const deviceMap = generateDeviceMap(devices)
      const result = processPolicy(COUNT_POLICY_JSON_3, events, [LA_GEOGRAPHY], deviceMap) as ComplianceResponse

      test.assert.deepEqual(result.compliance[0].matches[0].measured, 10)
      test.assert.deepEqual(result.total_violations, 5)
      done()
    })

    it('Verifies no violations for a different event_type', done => {
      const devices: Device[] = makeDevices(15, now())
      const events = makeEventsWithTelemetry(devices, now() - 100000, CITY_OF_LA, {
        event_types: ['trip_end'],
        vehicle_state: 'available',
        speed: 0
      })
      const deviceMap = generateDeviceMap(devices)
      const result = processPolicy(COUNT_POLICY_JSON_3, events, [LA_GEOGRAPHY], deviceMap) as ComplianceResponse
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
      })

      const deviceMap = generateDeviceMap(devices)
      const result = processPolicy(COUNT_POLICY_JSON_5, events, [RESTRICTED_GEOGRAPHY], deviceMap) as ComplianceResponse

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

      const TEST_ZONE_NO_VALID_DROP_OFF_POINTS: Polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [-118.46941709518433, 33.9807517760146],
            [-118.46564054489136, 33.9807517760146],
            [-118.46564054489136, 33.98356306245639],
            [-118.46941709518433, 33.98356306245639],
            [-118.46941709518433, 33.9807517760146]
          ]
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
      const result = processPolicy(
        VENICE_SPEC_OPS_POLICY,
        [...events_a, ...events_b],
        geographies,
        deviceMap
      ) as ComplianceResponse
      test.assert(result.total_violations === 10)
      // for these count results, matches are sorted by geography
      // for the first compliance result, there's one or two vehicle matches for each of the 20 or so geographies
      test.assert(result.compliance[0].matches.length === 22)
      // for the second compliance result, there's one geography
      test.assert(result.compliance[1].matches.length === 1)
      // and therefore 10 vehicles that match for that geography
      test.assert(result.compliance[1].matches[0].measured === 10)
      done()
    })

    it('does overflow correctly', done => {
      const VENICE_OVERFLOW_POLICY: Policy = {
        name: 'Venice Overflow Test',
        description: 'what it says on the can',
        policy_id: VENICE_POLICY_UUID,
        start_date: 1558389669540,
        publish_date: 1558389669540,
        end_date: null,
        prev_policies: null,
        provider_ids: [],
        rules: [
          {
            name: 'Inner geo',
            rule_id: '7a043ac8-03cd-4b0d-9588-d0af24f82832',
            rule_type: RULE_TYPES.count,
            geographies: [INNER_GEO.geography_id],
            states: { available: ['provider_drop_off'] },
            maximum: 1,
            vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter]
          },
          {
            name: 'Outer Zone',
            rule_id: '596d7fe1-53fd-4ea4-8ba7-33f5ea8d98a6',
            rule_type: RULE_TYPES.count,
            geographies: [OUTER_GEO.geography_id],
            states: { available: ['provider_drop_off'] },
            vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
            maximum: 2
          }
        ]
      }

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
      const deviceMap: { [d: string]: Device } = [...devices_a, ...devices_b].reduce(
        (deviceMapAcc: { [d: string]: Device }, device: Device) => {
          return Object.assign(deviceMapAcc, { [device.device_id]: device })
        },
        {}
      )
      const result = processPolicy(
        VENICE_OVERFLOW_POLICY,
        [...events_a, ...events_b],
        [INNER_GEO, OUTER_GEO],
        deviceMap
      ) as ComplianceResponse

      // for these count results, matches are sorted by geography
      // for the first compliance result, there's one or two vehicle matches for each of the 20 or so geographies
      test.assert.equal(result.compliance[0].matches[0].measured, 1)
      // for the second compliance result, there's one geography
      test.assert.equal(result.compliance[1].matches[0].measured, 2)
      // and therefore 10 vehicles that match for that geography
      test.assert.equal(result.total_violations, 2)
      test.assert.equal(result.vehicles_in_violation.length, 2)
      done()
    })
  })
})
