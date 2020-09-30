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
import { now, uuid } from '@mds-core/mds-utils'
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
import { processPolicy } from '../mds-compliance-engine'

process.env.TIMEZONE = 'America/Los_Angeles'
const VENICE_POLICY_UUID = 'dd9ace3e-14c8-461b-b5e7-1326505ff176'

describe.only('Tests Compliance API:', () => {
  describe('Verifies venice beach spec ops', () => {
    it('has the correct number of matches per rule', done => {
      const veniceSpecOpsPointIds: UUID[] = []
      const geographies = (veniceSpecOps.features.map((feature: Feature) => {
        if (feature.geometry.type === 'Point') {
          const geography_id = uuid()
          veniceSpecOpsPointIds.push(geography_id)
          return {
            geography_id,
            geography_json: feature.geometry
          }
        }
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
      test.assert(result?.compliance[0].matches.length === 22)
      test.assert(result?.compliance[1].matches.length === 1)
      test.assert(result?.compliance[1].matches[0].measured === 10)
      done()
    })
  })
})
