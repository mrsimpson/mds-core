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
import { Feature, Polygon } from 'geojson'
import MockDate from 'mockdate'
import { ComplianceResponse, processPolicy } from '../../engine/mds-compliance-engine'

process.env.TIMEZONE = 'America/Los_Angeles'
const GEOGRAPHY_UUID = '8917cf2d-a963-4ea2-a98b-7725050b3ec5'
const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'
const LA_GEOGRAPHY = { name: 'la', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
const LA_BEACH = 'ff822e26-a70c-4721-ac32-2f6734beff9b'
const LA_BEACH_GEOGRAPHY = { name: 'la beach', geography_id: LA_BEACH, geography_json: restrictedAreas }

const COUNT_POLICY_UUID = '72971a3d-876c-41ea-8e48-c9bb965bbbcc'
const COUNT_POLICY_UUID_2 = '37637f96-2580-475a-89e7-cfc5d2e70f84'
const COUNT_POLICY_UUID_3 = 'e8f9a720-6c12-41c8-a31c-715e76d65ea1'
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

const VENICE_POLICY_UUID = 'dd9ace3e-14c8-461b-b5e7-1326505ff176'

const INNER_GEO: Geography = {
  name: 'inner venice geo',
  geography_id: 'b4c75556-3842-47a9-b8f6-d721b98c8ca5',
  geography_json: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
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
      }
    ]
  }
}

const OUTER_GEO: Geography = {
  geography_id: 'e0e4a085-7a50-43e0-afa4-6792ca897c5a',
  name: 'outer venice geo',
  geography_json: {
    type: 'FeatureCollection',
    features: [{ properties: {}, type: 'Feature', geometry: veniceSpecOps.features[0].geometry }]
  }
}

const INNER_POLYGON: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-118.46853733062744, 33.98187274314647],
      [-118.46694946289064, 33.98187274314647],
      [-118.46694946289064, 33.982797974722246],
      [-118.46853733062744, 33.982797974722246],
      [-118.46853733062744, 33.98187274314647]
    ]
  ]
}

const OUTER_POLYGON: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-118.47261428833006, 33.98888290068113],
      [-118.4684944152832, 33.98888290068113],
      [-118.4684944152832, 33.99044854215088],
      [-118.47261428833006, 33.99044854215088],
      [-118.47261428833006, 33.98888290068113]
    ]
  ]
}

function generateDeviceMap(devices: Device[]): { [d: string]: Device } {
  return [...devices].reduce((deviceMapAcc: { [d: string]: Device }, device: Device) => {
    return Object.assign(deviceMapAcc, { [device.device_id]: device })
  }, {})
}

describe('Tests Compliance Engine:', () => {
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

  describe('Compute compliance for policies that apply to specific providers', () => {
    it('calculates the total violations correctly', () => {
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
      const deviceMap = generateDeviceMap(devices)
      const result = processPolicy(COUNT_POLICY_JSON, events, [LA_GEOGRAPHY], deviceMap)
    })
  })

  describe('Verifies venice beach spec ops', () => {
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

      const deviceMap: { [d: string]: Device } = [...devices_a, ...devices_b].reduce(
        (deviceMapAcc: { [d: string]: Device }, device: Device) => {
          return Object.assign(deviceMapAcc, { [device.device_id]: device })
        },
        {}
      )
      const result = processPolicy(VENICE_SPEC_OPS_POLICY, [...events_a, ...events_b], geographies, deviceMap)
      test.assert(result?.total_violations === 10)
      // for these count results, matches are sorted by geography
      // for the first compliance result, there's one or two vehicle matches for each of the 20 or so geographies
      test.assert(result?.compliance[0].matches.length === 22)
      // for the second compliance result, there's one geography
      test.assert(result?.compliance[1].matches.length === 1)
      // and therefore 10 vehicles that match for that geography
      test.assert(result?.compliance[1].matches[0].measured === 10)
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
            maximum: 2,
            vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter]
          },
          {
            name: 'Outer Zone',
            rule_id: '596d7fe1-53fd-4ea4-8ba7-33f5ea8d98a6',
            rule_type: RULE_TYPES.count,
            geographies: [OUTER_GEO.geography_id],
            states: { available: ['provider_drop_off'] },
            vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
            maximum: 1
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
      )
      console.log('rezz')
      console.dir(result, { depth: null })
      console.log(result?.total_violations)
      console.log(result?.vehicles_in_violation.length)
      /*
      // for these count results, matches are sorted by geography
      // for the first compliance result, there's one or two vehicle matches for each of the 20 or so geographies
      test.assert(result?.compliance[0].matches.length === 22)
      // for the second compliance result, there's one geography
      test.assert(result?.compliance[1].matches.length === 1)
      // and therefore 10 vehicles that match for that geography
      test.assert(result?.compliance[1].matches[0].measured === 10)
      */
      done()
    })
  })
})
