/**
 * Copyright 2020 City of Los Angeles
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

import type { UUID } from '@mds-core/mds-types'
import { now, uuid } from '@mds-core/mds-utils'
import type {
  DeviceDomainModel,
  EventAnnotationDomainCreateModel,
  EventDomainCreateModel,
  H3Bin,
  TelemetryAnnotationDomainCreateModel,
  TelemetryDomainCreateModel
} from '../@types'
import { IngestServiceClient } from '../client'
import { IngestRepository } from '../repository'
import { IngestServiceManager } from '../service/manager'

const TEST1_PROVIDER_ID = uuid()
const TEST2_PROVIDER_ID = uuid()
const DEVICE_UUID_A = uuid()
const DEVICE_UUID_B = uuid()
const TRIP_UUID_A = uuid()
const TRIP_UUID_B = uuid()
const testTimestamp = now()

const TEST_TELEMETRY_A1: TelemetryDomainCreateModel = {
  device_id: DEVICE_UUID_A,
  provider_id: TEST1_PROVIDER_ID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    heading: 180,
    accuracy: null,
    altitude: null,
    hdop: null,
    satellites: null
  },
  charge: 0.5,
  timestamp: testTimestamp
}
const TEST_TELEMETRY_A2: TelemetryDomainCreateModel = {
  device_id: DEVICE_UUID_A,
  provider_id: TEST1_PROVIDER_ID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    heading: 180,
    accuracy: null,
    altitude: null,
    hdop: null,
    satellites: null
  },
  charge: 0.5,
  timestamp: testTimestamp + 1000
}

const TEST_TELEMETRY_B1: TelemetryDomainCreateModel = {
  device_id: DEVICE_UUID_B,
  provider_id: TEST1_PROVIDER_ID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    heading: 180,
    accuracy: null,
    altitude: null,
    hdop: null,
    satellites: null
  },
  charge: 0.5,
  timestamp: testTimestamp
}
const TEST_TELEMETRY_B2: TelemetryDomainCreateModel = {
  device_id: DEVICE_UUID_B,
  provider_id: TEST1_PROVIDER_ID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    heading: 180,
    accuracy: null,
    altitude: null,
    hdop: null,
    satellites: null
  },
  charge: 0.5,
  timestamp: testTimestamp + 1000
}

const BASE_TEST_TELEMETRY_ANNOTATION = {
  device_id: DEVICE_UUID_A,
  provider_id: TEST1_PROVIDER_ID,
  h3_08: '123451234512345',
  h3_09: '123451234512345',
  h3_10: '123451234512345',
  h3_11: '123451234512345',
  h3_12: '123451234512345',
  h3_13: '123451234512345',
  geography_ids: []
}

const TEST_TELEMETRY_ANNOTATION_A1: TelemetryAnnotationDomainCreateModel = {
  timestamp: testTimestamp,
  telemetry_row_id: 12341234,
  ...BASE_TEST_TELEMETRY_ANNOTATION
}

const TEST_TELEMETRY_ANNOTATION_A2: TelemetryAnnotationDomainCreateModel = {
  timestamp: testTimestamp + 1000,
  telemetry_row_id: 12341235,
  ...BASE_TEST_TELEMETRY_ANNOTATION
}

const TEST_TELEMETRY_ANNOTATION_A3: TelemetryAnnotationDomainCreateModel = {
  timestamp: testTimestamp + 2000,
  telemetry_row_id: 12341236,
  ...BASE_TEST_TELEMETRY_ANNOTATION
}

const TEST_TELEMETRY_ANNOTATION_A4: TelemetryAnnotationDomainCreateModel = {
  timestamp: testTimestamp + 3000,
  telemetry_row_id: 12341237,
  ...BASE_TEST_TELEMETRY_ANNOTATION,
  h3_09: 'imunlikeother09'
}

const TEST_TELEMETRY_ANNOTATION_A5: TelemetryAnnotationDomainCreateModel = {
  timestamp: testTimestamp + 4000,
  telemetry_row_id: 12341238,
  ...BASE_TEST_TELEMETRY_ANNOTATION,
  h3_09: 'IMUNLIKEOTHER09'
}

const TEST_TELEMETRY_ANNOTATION_A6: TelemetryAnnotationDomainCreateModel = {
  timestamp: testTimestamp + 5000,
  telemetry_row_id: 12341239,
  ...BASE_TEST_TELEMETRY_ANNOTATION,
  h3_09: 'IMUNLIKEOTHER09'
}

const TEST_DEVICE_A: Omit<DeviceDomainModel, 'recorded'> = {
  accessibility_options: ['wheelchair_accessible'],
  device_id: DEVICE_UUID_A,
  provider_id: TEST1_PROVIDER_ID,
  vehicle_id: 'test-id-1',
  vehicle_type: 'car',
  propulsion_types: ['electric'],
  year: 2018,
  mfgr: 'Schwinn',
  modality: 'tnc',
  model: 'Mantaray'
}

const TEST_DEVICE_B: Omit<DeviceDomainModel, 'recorded'> = {
  accessibility_options: ['wheelchair_accessible'],
  device_id: DEVICE_UUID_B,
  provider_id: TEST1_PROVIDER_ID,
  vehicle_id: 'test-id-2',
  vehicle_type: 'car',
  propulsion_types: ['electric'],
  year: 2018,
  mfgr: 'Schwinn',
  modality: 'tnc',
  model: 'Mantaray'
}

const TEST_EVENT_A1: EventDomainCreateModel = {
  device_id: DEVICE_UUID_A,
  event_types: ['decommissioned'],
  vehicle_state: 'removed',
  trip_state: 'stopped',
  timestamp: testTimestamp,
  telemetry: TEST_TELEMETRY_A1,
  provider_id: TEST1_PROVIDER_ID,
  trip_id: TRIP_UUID_A
  // test-id-1
}

const TEST_EVENT_A2: EventDomainCreateModel = {
  device_id: DEVICE_UUID_A,
  event_types: ['service_end'],
  vehicle_state: 'unknown',
  trip_state: 'stopped',
  timestamp: testTimestamp + 1000,
  telemetry: TEST_TELEMETRY_A2,
  provider_id: TEST1_PROVIDER_ID,
  trip_id: TRIP_UUID_A
  // test-id-1
}

const TEST_EVENT_B1: EventDomainCreateModel = {
  device_id: DEVICE_UUID_B,
  event_types: ['decommissioned'],
  vehicle_state: 'removed',
  trip_state: 'stopped',
  timestamp: testTimestamp,
  telemetry: TEST_TELEMETRY_B1,
  provider_id: TEST1_PROVIDER_ID,
  trip_id: TRIP_UUID_B
  // test-id-2
}

const TEST_EVENT_B2: EventDomainCreateModel = {
  device_id: DEVICE_UUID_B,
  event_types: ['service_end'],
  vehicle_state: 'unknown',
  trip_state: 'stopped',
  timestamp: testTimestamp + 1000,
  telemetry: TEST_TELEMETRY_B2,
  provider_id: TEST1_PROVIDER_ID,
  trip_id: TRIP_UUID_B
  // test-id-2
}

const GEOGRAPHY_ID_A = uuid()
const GEOGRAPHY_ID_B = uuid()
const GEOGRAPHY_ID_C = uuid()
const GEOGRAPHY_ID_D = uuid()

const TEST_EVENT_ANNOTATION_A: EventAnnotationDomainCreateModel = {
  events_row_id: 1,
  device_id: DEVICE_UUID_A,
  timestamp: testTimestamp,
  vehicle_id: 'test-id-1',
  vehicle_type: 'scooter',
  propulsion_types: ['electric'],
  geography_ids: [GEOGRAPHY_ID_A, GEOGRAPHY_ID_B],
  geography_types: ['jurisdiction', null],
  latency_ms: 100
}

const TEST_EVENT_ANNOTATION_B: EventAnnotationDomainCreateModel = {
  events_row_id: 2,
  device_id: DEVICE_UUID_B,
  timestamp: testTimestamp,
  vehicle_id: 'test-id-2',
  vehicle_type: 'scooter',
  propulsion_types: ['electric'],
  geography_ids: [GEOGRAPHY_ID_C, GEOGRAPHY_ID_D],
  geography_types: [null, 'spot'],
  latency_ms: 150
}

describe('Ingest Repository Tests', () => {
  beforeAll(IngestRepository.initialize)
  it('Run Migrations', IngestRepository.runAllMigrations)
  it('Revert Migrations', IngestRepository.revertAllMigrations)
  afterAll(IngestRepository.shutdown)
})

const IngestServer = IngestServiceManager.controller()

describe('Ingest Service Tests', () => {
  beforeAll(async () => {
    await IngestServer.start()
    await IngestRepository.initialize()
  })

  /**
   * Clear DB after each test runs, and after the file is finished. No side-effects for you.
   */
  beforeEach(async () => {
    await IngestRepository.deleteAll()
  })

  describe('getDevices', () => {
    beforeEach(async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A, TEST_DEVICE_B])
    })
    describe('all_devices', () => {
      it('gets 2 devices', async () => {
        const devices = await IngestServiceClient.getDevices([DEVICE_UUID_A, DEVICE_UUID_B])
        expect(devices.length).toEqual(2)
      })
      it('gets using options/cursor', async () => {
        const options = await IngestServiceClient.getDevicesUsingOptions({ limit: 1 })
        expect(options.devices).toHaveLength(1)
        expect(options.cursor.prev).toBeNull()
        expect(options.cursor.next).not.toBeNull()
        if (options.cursor.next) {
          const cursor = await IngestServiceClient.getDevicesUsingCursor(options.cursor.next)
          expect(cursor.devices).toHaveLength(1)
          expect(cursor.cursor.prev).not.toBeNull()
          expect(cursor.cursor.next).toBeNull()
        }

        const withProviderId = await IngestServiceClient.getDevicesUsingOptions({
          limit: 2,
          provider_id: TEST1_PROVIDER_ID
        })
        expect(withProviderId.devices).toHaveLength(2)
        expect(withProviderId.cursor.next).toBeNull()
      })

      it('gets one device at a time with just the device_id parameter', async () => {
        const { recorded, ...device } = (await IngestServiceClient.getDevice({
          device_id: DEVICE_UUID_A
        })) as DeviceDomainModel
        expect(device).toEqual(TEST_DEVICE_A)
      })

      it('gets one device at a time with the device_id and provider_id parameters', async () => {
        const { recorded, ...device } = (await IngestServiceClient.getDevice({
          device_id: DEVICE_UUID_A,
          provider_id: TEST1_PROVIDER_ID
        })) as DeviceDomainModel
        expect(device).toEqual(TEST_DEVICE_A)
      })

      it('get one device throws if device does not exist', async () => {
        const result = await IngestServiceClient.getDevice({
          device_id: TEST_DEVICE_A.device_id,
          provider_id: TEST2_PROVIDER_ID
        })
        expect(result).toBeUndefined
      })

      it('gets 0 devices', async () => {
        const devices = await IngestServiceClient.getDevices([uuid()])
        expect(devices.length).toEqual(0)
      })
      it('get invalid device uuid', async () => {
        await expect(IngestServiceClient.getDevices(['foo-bar'])).rejects.toMatchObject({ type: 'ValidationError' })
      })
      it('get with valid and invalid device uuid', async () => {
        await expect(IngestServiceClient.getDevices([DEVICE_UUID_A, 'foo-bar'])).rejects.toMatchObject({
          type: 'ValidationError'
        })
      })
    })
  })

  describe('getEventsUsingOptions', () => {
    beforeEach(async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A, TEST_DEVICE_B])
      await IngestRepository.createEvents([TEST_EVENT_A1, TEST_EVENT_B1])
      await IngestRepository.createEvents([TEST_EVENT_A2, TEST_EVENT_B2])
      await IngestServiceClient.writeEventAnnotations([TEST_EVENT_ANNOTATION_A, TEST_EVENT_ANNOTATION_B])
    })
    describe('all_events', () => {
      it('filter on one valid geography id', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'all_events',
          geography_ids: [GEOGRAPHY_ID_A]
        })
        expect(events.length).toEqual(1)
      })
      it('filter on two valid geography id', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'all_events',
          geography_ids: [GEOGRAPHY_ID_A, GEOGRAPHY_ID_C]
        })
        expect(events.length).toEqual(2)
      })
      it('filter on non-existent geography id', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'all_events',
          geography_ids: [uuid()]
        })
        expect(events.length).toEqual(0)
      })
      it('gets 4 events', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'all_events'
        })
        expect(events.length).toEqual(4)
      })
      it('gets no events, filtered on time start/end', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp + 4000, end: testTimestamp + 8000 },
          grouping_type: 'all_events'
        })
        expect(events.length).toEqual(0)
      })

      it('gets 4 events, but limit to 1', async () => {
        const limit = 1
        const {
          events,
          cursor: { next }
        } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'all_events',
          limit
        })
        expect(events.length).toEqual(1)
        expect(next).not.toBeNull()
      })

      it('gets two events, filters on event_types', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          event_types: ['service_end'],
          grouping_type: 'all_events'
        })
        expect(events.length).toEqual(2)
      })

      it('gets events in order provided (vehicle_state)', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'vehicle_state', direction: 'ASC' },
          grouping_type: 'all_events',
          limit: 1
        })
        expect(events[0]?.vehicle_state).toEqual('removed')

        // reverse order
        const { events: eventsDesc } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'vehicle_state', direction: 'DESC' },
          grouping_type: 'all_events'
        })

        expect(eventsDesc[0]?.vehicle_state).toEqual('unknown')
      })

      it('gets events in order provided (vehicle_state)', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'vehicle_state', direction: 'ASC' },
          grouping_type: 'all_events'
        })
        expect(events[0]?.vehicle_state).toEqual('removed')

        // reverse order
        const { events: eventsDesc } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'vehicle_state', direction: 'DESC' },
          grouping_type: 'all_events'
        })

        expect(eventsDesc[0]?.vehicle_state).toEqual('unknown')
      })

      it('respects order when cursor is used', async () => {
        const {
          events,
          cursor: { next }
        } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'vehicle_state', direction: 'ASC' },
          grouping_type: 'all_events',
          limit: 2
        })
        expect(events.length).toEqual(2)
        expect(events[0]?.vehicle_state).toEqual('removed')
        expect(next).not.toBeNull()

        if (next) {
          // reverse order
          const {
            events: nextEvents,
            cursor: { prev }
          } = await IngestServiceClient.getEventsUsingCursor(next)

          expect(nextEvents.length).toEqual(2)
          expect(prev).not.toBeNull()
          expect(nextEvents[0]?.vehicle_state).toEqual('unknown')
        }
      })

      it('uses secondary (timestamp) sort order when primary sort values are equal', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'provider_id', direction: 'ASC' },
          grouping_type: 'all_events',
          limit: 4
        })

        expect(events[0]?.timestamp).toBeLessThan(events[events.length - 1]?.timestamp ?? 0)

        const { events: descEvents } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          order: { column: 'provider_id', direction: 'DESC' },
          grouping_type: 'all_events',
          limit: 4
        })

        expect(descEvents[0]?.timestamp).toBeGreaterThan(descEvents[descEvents.length - 1]?.timestamp ?? 0)
      })
    })

    describe('latest_per_vehicle', () => {
      it('gets two events, one for each device, telemetry is loaded', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'latest_per_trip'
        })
        expect(events.length).toEqual(2)

        events.forEach(e => {
          expect(e.telemetry?.timestamp).toStrictEqual(TEST_TELEMETRY_B2.timestamp)
          expect(e.telemetry?.gps.lat).toStrictEqual(TEST_TELEMETRY_B2.gps.lat)
          expect(e.telemetry?.gps.lng).toStrictEqual(TEST_TELEMETRY_B2.gps.lng)
        })
      })

      it('gets two events, filters on event_types', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          event_types: ['service_end'],
          grouping_type: 'latest_per_trip'
        })
        expect(events.length).toEqual(2)
      })
    })

    describe('latest_per_vehicle', () => {
      it('gets two events, one for each device', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })

      it('gets two events, filters on event_types', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          event_types: ['service_end'],
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })

      it('gets two events, filters on propulsion type', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          propulsion_types: ['electric'],
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })

      it('gets two events, filters on device_ids', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          device_ids: [DEVICE_UUID_A, DEVICE_UUID_B],
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })

      it('gets two events, filters on vehicle_type', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          vehicle_types: ['car'],
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })

      it('gets two events, filters on vehicle_states', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          vehicle_states: ['unknown'],
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })

      it('gets two events, filters on vehicle_id', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          vehicle_id: TEST_DEVICE_A.vehicle_id,
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(1)
      })

      it('gets two events, filters on provider_ids', async () => {
        const { events } = await IngestServiceClient.getEventsUsingOptions({
          time_range: { start: testTimestamp, end: testTimestamp + 2000 },
          provider_ids: [TEST1_PROVIDER_ID],
          grouping_type: 'latest_per_vehicle'
        })
        expect(events.length).toEqual(2)
      })
    })
  })

  describe('getEventsUsingCursor', () => {
    beforeEach(async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A, TEST_DEVICE_B])
      await IngestRepository.createEvents([TEST_EVENT_A1, TEST_EVENT_B1])
      await IngestRepository.createEvents([TEST_EVENT_A2, TEST_EVENT_B2])
    })

    it('fetches the next page', async () => {
      // First page
      const {
        events,
        cursor: { next }
      } = await IngestServiceClient.getEventsUsingOptions({
        time_range: { start: testTimestamp, end: testTimestamp + 2000 },
        grouping_type: 'all_events',
        limit: 1
      })

      expect(events.length).toEqual(1)
      expect(next).not.toBeNull()

      // Use cursor for next page
      if (next) {
        const {
          events: nextEvents,
          cursor: { prev }
        } = await IngestServiceClient.getEventsUsingCursor(next)

        expect(nextEvents.length).toEqual(1)
        expect(nextEvents[0]).not.toStrictEqual(events[0])
        expect(prev).not.toBeNull()
      }
    })
  })

  describe('writeEventAnnotations', () => {
    it('writes two event annotations', async () => {
      const eventAnnotations = await IngestServiceClient.writeEventAnnotations([
        TEST_EVENT_ANNOTATION_A,
        TEST_EVENT_ANNOTATION_B
      ])
      // Remove event_row_id since this is not returned.
      const { events_row_id: EVENT_ROW_ID_A, ...RESULT_A } = TEST_EVENT_ANNOTATION_A
      const { events_row_id: EVENT_ROW_ID_B, ...RESULT_B } = TEST_EVENT_ANNOTATION_B
      expect(eventAnnotations.length).toEqual(2)
      // Test for partial object match since eventAnnotations also have `recorded`
      expect(eventAnnotations).toEqual(
        expect.arrayContaining([expect.objectContaining(RESULT_A), expect.objectContaining(RESULT_B)])
      )
    })

    it('rejects invalid event annotations', async () => {
      const INVALID_EVENT_ANNOTATION = { ...TEST_EVENT_ANNOTATION_A, geography_ids: ['not-a-uuid'] }
      await expect(IngestServiceClient.writeEventAnnotations([INVALID_EVENT_ANNOTATION])).rejects.toMatchObject({
        type: 'ValidationError'
      })
    })

    it('rejects duplicate event annotations', async () => {
      // Event annotations require device_id + timestamp to be unique
      await expect(
        IngestServiceClient.writeEventAnnotations([TEST_EVENT_ANNOTATION_A, TEST_EVENT_ANNOTATION_A])
      ).rejects.toMatchObject({
        type: 'ConflictError'
      })
    })

    it('gets events with 2 annotations', async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A, TEST_DEVICE_B])
      await IngestRepository.createEvents([TEST_EVENT_A1, TEST_EVENT_B1])
      await IngestRepository.createEvents([TEST_EVENT_A2, TEST_EVENT_B2])
      await IngestServiceClient.writeEventAnnotations([TEST_EVENT_ANNOTATION_A, TEST_EVENT_ANNOTATION_B])
      const { events } = await IngestServiceClient.getEventsUsingOptions({
        time_range: { start: testTimestamp, end: testTimestamp + 2000 },
        grouping_type: 'all_events'
      })
      expect(events.filter(e => e.annotation).length).toEqual(2)
    })
  })

  describe('getTripEvents', () => {
    beforeEach(async () => {
      await IngestRepository.createEvents([TEST_EVENT_A1, TEST_EVENT_B1])
      await IngestRepository.createEvents([TEST_EVENT_A2, TEST_EVENT_B2])
    })

    it('loads all events, with telemetry and gps embeded', async () => {
      const trips = await IngestServiceClient.getTripEvents({})
      const events1 = trips[TRIP_UUID_A]
      const events2 = trips[TRIP_UUID_B]

      if (!events1 || !events2) {
        throw new Error('No events found')
      }

      expect(events1?.length).toStrictEqual(2)
      expect(events2?.length).toStrictEqual(2)

      expect(events1[0]?.telemetry?.gps.lat).toStrictEqual(TEST_TELEMETRY_A1.gps.lat)
      expect(events1[1]?.telemetry?.gps.lat).toStrictEqual(TEST_TELEMETRY_A2.gps.lat)
    })
    it('loads trip events filtered by time', async () => {
      const trips1 = await IngestServiceClient.getTripEvents({
        start_time: TEST_EVENT_A2.timestamp + 100,
        end_time: TEST_EVENT_A2.timestamp + 200
      })
      expect(Object.keys(trips1).length).toStrictEqual(0)

      const trips2 = await IngestServiceClient.getTripEvents({
        start_time: TEST_EVENT_A1.timestamp,
        end_time: TEST_EVENT_A2.timestamp
      })
      expect(Object.keys(trips2).length).toStrictEqual(2)
    })
    it('loads trip events filtered by provider', async () => {
      const trips1 = await IngestServiceClient.getTripEvents({
        provider_id: TEST_EVENT_A2.provider_id
      })
      expect(Object.keys(trips1).length).toStrictEqual(2)

      const trips2 = await IngestServiceClient.getTripEvents({
        provider_id: uuid()
      })
      expect(Object.keys(trips2).length).toStrictEqual(0)
    })
    it('loads trip events skipping trip_id', async () => {
      const trip_id = [TEST_EVENT_A1.trip_id, TEST_EVENT_B1.trip_id].sort()[0]
      const trips1 = await IngestServiceClient.getTripEvents({
        skip: trip_id as UUID
      })
      expect(Object.keys(trips1).length).toStrictEqual(1)
    })
  })

  describe('getDeviceEvents', () => {
    beforeEach(async () => {
      await IngestRepository.createEvents([TEST_EVENT_A1, TEST_EVENT_B1])
      await IngestRepository.createEvents([TEST_EVENT_A2, TEST_EVENT_B2])
    })

    it('loads all events, with telemetry and gps embeded', async () => {
      const devices = await IngestServiceClient.getDeviceEvents({})
      const events1 = devices[DEVICE_UUID_A]
      const events2 = devices[DEVICE_UUID_B]

      if (!events1 || !events2) {
        throw new Error('No events found')
      }

      expect(events1?.length).toStrictEqual(2)
      expect(events2?.length).toStrictEqual(2)

      expect(events1[0]?.telemetry?.gps.lat).toStrictEqual(TEST_TELEMETRY_A1.gps.lat)
      expect(events1[1]?.telemetry?.gps.lat).toStrictEqual(TEST_TELEMETRY_A2.gps.lat)
    })
    it('loads device events filtered by time', async () => {
      const noEventsInBounds = await IngestServiceClient.getDeviceEvents({
        start_time: TEST_EVENT_A2.timestamp + 100,
        end_time: TEST_EVENT_A2.timestamp + 200
      })
      expect(Object.keys(noEventsInBounds).length).toStrictEqual(0)

      const someEventsInBounds = await IngestServiceClient.getDeviceEvents({
        start_time: TEST_EVENT_A1.timestamp - 1,
        end_time: TEST_EVENT_A1.timestamp + 1
      })

      expect(Object.keys(someEventsInBounds).length).toStrictEqual(2)

      Object.values(someEventsInBounds).forEach(events => {
        expect(events.length).toStrictEqual(1)
      })
    })
    it('loads device events filtered by provider', async () => {
      const events = await IngestServiceClient.getDeviceEvents({
        provider_id: TEST_EVENT_A2.provider_id
      })
      expect(Object.keys(events).length).toStrictEqual(2)

      const noEvents = await IngestServiceClient.getDeviceEvents({
        provider_id: uuid()
      })
      expect(Object.keys(noEvents).length).toStrictEqual(0)
    })
    it('loads device events skipping some device_id', async () => {
      const [device_id] = [TEST_EVENT_A1.device_id, TEST_EVENT_B1.device_id].sort()
      const events = await IngestServiceClient.getDeviceEvents({
        skip: device_id
      })
      expect(Object.keys(events).length).toStrictEqual(1)
    })
  })

  describe('getLatestTelemetryForDevices', () => {
    const TEST_TELEMETRY_A = [TEST_TELEMETRY_A1, TEST_TELEMETRY_A2]
    const TEST_TELEMETRY_B = [TEST_TELEMETRY_B1, TEST_TELEMETRY_B2]

    beforeEach(async () => {
      await IngestRepository.createTelemetries([...TEST_TELEMETRY_A, ...TEST_TELEMETRY_B])
    })

    it('loads last telemetries per device', async () => {
      const device_ids = [DEVICE_UUID_A, DEVICE_UUID_B]
      const telemetries = await IngestServiceClient.getLatestTelemetryForDevices(device_ids)
      expect(telemetries).toHaveLength(device_ids.length)
      const [timestampA, timestampB] = telemetries.map(({ timestamp }) => timestamp)
      expect(timestampA).toStrictEqual(Math.max(...TEST_TELEMETRY_A.map(({ timestamp }) => timestamp)))
      expect(timestampB).toStrictEqual(Math.max(...TEST_TELEMETRY_B.map(({ timestamp }) => timestamp)))
    })
  })

  describe('getEventsWithDeviceAndTelemetryInfo', () => {
    beforeEach(async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A, TEST_DEVICE_B])
      await IngestRepository.createEvents([TEST_EVENT_A1, TEST_EVENT_B1])
      await IngestRepository.createEvents([TEST_EVENT_A2, TEST_EVENT_B2])
    })

    it('invalid options throws validation error', async () => {
      await expect(
        IngestServiceClient.getEventsWithDeviceAndTelemetryInfoUsingOptions({ limit: 0 })
      ).rejects.toMatchObject({
        type: 'ValidationError'
      })
    })

    it('fetches first/next page', async () => {
      // First page
      const {
        events,
        cursor: { prev: firstPrev, next: firstNext }
      } = await IngestServiceClient.getEventsWithDeviceAndTelemetryInfoUsingOptions({
        limit: 1,
        device_ids: [DEVICE_UUID_A]
      })

      expect(events.length).toEqual(1)
      expect(firstPrev).toBeNull()
      expect(firstNext).not.toBeNull()

      // Use cursor for next page
      if (firstNext) {
        const {
          events: nextEvents,
          cursor: { prev: nextPrev, next: nextNext }
        } = await IngestServiceClient.getEventsWithDeviceAndTelemetryInfoUsingCursor(firstNext)

        expect(nextEvents.length).toEqual(1)
        expect(nextPrev).not.toBeNull()
        expect(nextNext).toBeNull()
      }
    })
  })

  describe('Tests writeEvent service method', () => {
    /**
     * Clear DB after each test runs, and after the file is finished. No side-effects for you.
     */
    beforeEach(async () => {
      await IngestRepository.deleteAll()
    })

    it('Tests writing an event w/ telemetry for a device that exists', async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A])
      const writeResult = await IngestServiceClient.writeEvents([TEST_EVENT_A1])

      expect(writeResult).toHaveLength(1)
      expect(writeResult).toMatchObject([TEST_EVENT_A1])

      const { events } = await IngestRepository.getEventsUsingOptions({
        device_ids: [TEST_DEVICE_A.device_id],
        grouping_type: 'all_events'
      })

      expect(events).toHaveLength(1)
      const [event] = events
      expect(event).toMatchObject(TEST_EVENT_A1)
      expect(event).toHaveProperty('telemetry') // pretty sure the match tests this, but better safe than sorry
    })

    it("Tests writing an event w/ telemetry for a device that doesn't exist (should fail)", async () => {
      await expect(IngestServiceClient.writeEvents([TEST_EVENT_A1])).rejects.toMatchObject({
        type: 'NotFoundError'
      })
    })

    it('Tests writing an event without telemetry (should fail)', async () => {
      await IngestRepository.createDevices([TEST_DEVICE_A])

      const { telemetry, ...eventWithoutTelemetry } = TEST_EVENT_A1

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(IngestServiceClient.writeEvents([eventWithoutTelemetry as any])).rejects.toMatchObject({
        type: 'ValidationError'
      })
    })
  })

  describe('Tests createTelemetryAnnotations service method', () => {
    /**
     * Clear DB after each test runs, and after the file is finished. No side-effects for you.
     */
    beforeEach(async () => {
      await IngestRepository.deleteAll()
    })

    it('Tests writing a TelemetryAnnotation', async () => {
      const result = await IngestRepository.createTelemetryAnnotations([TEST_TELEMETRY_ANNOTATION_A1])

      expect(result).toEqual([TEST_TELEMETRY_ANNOTATION_A1])
    })
  })

  describe('Tests getH3Bins service method', () => {
    /**
     * Clear DB after each test runs, and after the file is finished. No side-effects for you.
     */
    beforeEach(async () => {
      await IngestRepository.deleteAll()
    })

    it('Tests writing a TelemetryAnnotation', async () => {
      function sortBins(a: H3Bin, b: H3Bin) {
        if (a.count > b.count) return 1
        if (a.count < b.count) return -1
        return 0
      }

      await IngestRepository.createTelemetryAnnotations([
        TEST_TELEMETRY_ANNOTATION_A1,
        TEST_TELEMETRY_ANNOTATION_A2,
        TEST_TELEMETRY_ANNOTATION_A3,
        TEST_TELEMETRY_ANNOTATION_A4,
        TEST_TELEMETRY_ANNOTATION_A5,
        TEST_TELEMETRY_ANNOTATION_A6
      ])

      const k2minResult = await IngestRepository.getH3Bins({
        k: 2,
        start: testTimestamp,
        end: now() + 10000,
        h3_resolution: 'h3_09'
      })

      k2minResult.sort(sortBins)

      expect(k2minResult).toEqual([
        {
          provider_id: TEST1_PROVIDER_ID,
          count: 2,
          h3_identifier: 'IMUNLIKEOTHER09'
        },
        {
          provider_id: TEST1_PROVIDER_ID,
          count: 3,
          h3_identifier: '123451234512345'
        }
      ])

      expect(k2minResult.length).toEqual(2)

      const k1minResult = await IngestRepository.getH3Bins({
        k: 1,
        start: testTimestamp,
        end: now() + 10000,
        h3_resolution: 'h3_09'
      })

      k1minResult.sort(sortBins)

      expect(k1minResult).toEqual([
        {
          provider_id: TEST1_PROVIDER_ID,
          count: 1,
          h3_identifier: 'imunlikeother09'
        },
        {
          provider_id: TEST1_PROVIDER_ID,
          count: 2,
          h3_identifier: 'IMUNLIKEOTHER09'
        },
        {
          provider_id: TEST1_PROVIDER_ID,
          count: 3,
          h3_identifier: '123451234512345'
        }
      ])
    })
  })

  afterAll(async () => {
    await IngestRepository.shutdown()
    await IngestServer.stop()
  })
})
