import Sinon from 'sinon'
import assert from 'assert'
import cache from '@mds-core/mds-cache'
import db from '@mds-core/mds-db'
import {
  Telemetry,
  StateEntry,
  TripEvent,
  Timestamp,
  GpsData,
  UUID,
  VEHICLE_EVENT,
  VEHICLE_STATUS,
  VEHICLE_TYPE,
  VehicleEvent
} from '@mds-core/mds-types'
import { now } from '@mds-core/mds-utils'
import uuid from 'uuid'
import { makeReadOnlyQuery } from '@mds-core/mds-db/client'
import * as procEvent from '../src/proc-event'
import * as procEventUtils from '../src/utils'
import * as annotation from '../src/annotation'

const getFakeTripEvent = (event_type: string, timestamp: Timestamp) => {
  const tripStartA = ({ event_type, timestamp } as unknown) as TripEvent
  return tripStartA
}

const getMockedTripData = () => {
  const tripStartA = getFakeTripEvent('trip_start', 42)
  const tripStartB = getFakeTripEvent('trip_start', 43)

  const trips = {
    'trip-one': [tripStartA],
    'trip-two': [tripStartB]
  }

  return trips
}

const getMockedDevice = (device_id: UUID, provider_id: UUID, type: VEHICLE_TYPE) => {
  const device = {
    device_id,
    provider_id,
    vehicle_id: device_id,
    type,
    propulsion: ['electric'],
    year: null,
    mfgr: null,
    model: null,
    recorded: now(),
    status: null
  }
  return device
}

const getMockedDeviceState = (
  type: string,
  timestamp: Timestamp,
  device_id: UUID,
  provider_id: UUID,
  state: VEHICLE_STATUS | null,
  event_type: VEHICLE_EVENT | null,
  trip_id: UUID | null
) => {
  const deviceState: StateEntry = {
    vehicle_type: 'scooter',
    type,
    timestamp,
    device_id,
    provider_id,
    recorded: timestamp,
    annotation_version: 1,
    annotation: { in_bound: false, areas: [] },
    gps: { lat: 0, lng: 100, altitude: 0, heading: 0, speed: 0, accuracy: 10 },
    service_area_id: null,
    charge: 0,
    state,
    event_type,
    event_type_reason: null,
    trip_id
  }
  return deviceState
}

const getMockedVehicleEvent = (
  device_id: UUID,
  provider_id: UUID,
  timestamp: Timestamp,
  event_type: VEHICLE_EVENT,
  trip_id?: UUID | null
) => {
  const vehicleEvent: VehicleEvent & Telemetry = {
    device_id,
    provider_id,
    timestamp,
    event_type,
    trip_id,
    telemetry: {
      device_id,
      timestamp,
      gps: { lat: 0, lng: 100, altitude: 0, heading: 0, speed: 0, accuracy: 10 },
      charge: 0,
      provider_id
    },

    recorded: timestamp
  }
  return vehicleEvent
}

const getMockedTelemetry = (device_id: UUID, provider_id: UUID, timestamp: Timestamp) => {
  const telemetry: VehicleEvent & Telemetry = {
    device_id,
    provider_id,
    timestamp,
    charge: 0,
    gps: { lat: 0, lng: 100, altitude: 0, heading: 0, speed: 0, accuracy: 10 },
    recorded: timestamp
  }
  return telemetry
}

const getMockedTripEvent = (
  vehicle_type: VEHICLE_TYPE,
  timestamp: Timestamp,
  // TODO: determine if null is a case
  event_type: VEHICLE_EVENT | null
) => {
  const tripEvent = {
    vehicle_type,
    timestamp,
    event_type,
    event_type_reason: null,
    annotation_version: 1,
    // TODO: determine if annotation can be null
    annotation: { areas: [], in_bound: false },
    gps: { lat: 0, lng: 100, altitude: 0, heading: 0, speed: 0, accuracy: 10 },
    service_area_id: null
  }
  return tripEvent
}

const getMockedTripTelemetry = (
  vehicle_type: VEHICLE_TYPE,
  timestamp: Timestamp,
  // TODO: determine if null is a case
  event_type: VEHICLE_EVENT | null
) => {
  const tripTelemetry = {
    timestamp,
    latitude: 0,
    longitude: 100,
    annotation_version: 1,
    // TODO: determine if annotation can be null
    annotation: { areas: [], in_bound: false },
    service_area_id: null
  }
  return tripTelemetry
}

describe('Proc Event', () => {
  describe('getAnnotationData()', () => {
    it('Returns no service area given gps coords', () => {
      const expected = { in_bound: false, areas: [] }
      const gpsData: GpsData = { lng: 42, lat: 42 }
      const result = annotation.getAnnotationData(gpsData)
      assert.deepStrictEqual(result, expected)
    })

    it('Returns correct service area given gps coords', () => {
      const expected = {
        in_bound: true,
        areas: [
          {
            id: '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49',
            type: 'district'
          },
          {
            id: '8cfe393c-4dc8-4a1d-922e-034f8577c507',
            type: 'district'
          },
          {
            id: '3abf8e10-a380-45bb-bfd4-ec5b21b1b0b6',
            type: 'district'
          }
        ]
      }
      const gpsData: GpsData = { lng: -118.456185290317, lat: 33.9624723998019 }
      const result = annotation.getAnnotationData(gpsData)
      assert.deepStrictEqual(result, expected)
    })
  })

  describe('findTripStart()', () => {
    it('Errors out if no trip start events are found', () => {
      assert.throws(() => {
        procEventUtils.findTripStart([])
      })
    })

    it('Finds trip_start', () => {
      const event = ({ event_type: 'trip_start' } as unknown) as TripEvent
      assert.deepStrictEqual(procEventUtils.findTripStart([event]), event)
    })

    it('Finds trip_enter', () => {
      const event = ({ event_type: 'trip_enter' } as unknown) as TripEvent
      assert.deepStrictEqual(procEventUtils.findTripStart([event]), event)
    })
  })

  describe('getSortedTripStarts()', () => {
    it('Sorts trip start events by timestamp', () => {
      const trips = getMockedTripData()

      const result = procEventUtils.getSortedTripStarts(trips)
      const expected = [
        { tripId: 'trip-two', tripStart: trips['trip-two'][0] },
        { tripId: 'trip-one', tripStart: trips['trip-one'][0] }
      ]
      assert.deepStrictEqual(result, expected)
    })
  })

  describe('getTripId()', () => {
    it('Returns null when there are no prior trips', async () => {
      const fakeReadTripsEvents = Sinon.fake.resolves(null)
      Sinon.replace(cache, 'readDeviceTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {} as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })

    it('Returns null when it fails to find trip events', async () => {
      const fakeReadTripsEvents = Sinon.fake.resolves({})
      Sinon.replace(cache, 'readDeviceTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {} as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })

    it('Finds the timestamp match', async () => {
      const trips = getMockedTripData()
      const fakeReadTripsEvents = Sinon.fake.resolves(trips)
      Sinon.replace(cache, 'readDeviceTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {
        timestamp: 44
      } as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, 'trip-two')
      Sinon.restore()
    })

    it('Does not find matching timestamp', async () => {
      const trips = getMockedTripData()
      const fakeReadTripsEvents = Sinon.fake.resolves(trips)
      Sinon.replace(cache, 'readDeviceTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {
        timestamp: 41
      } as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })
  })

  describe('processTripTelemetry()', () => {
    it('Returns false if unable to match', async () => {
      const fakeGetTripId = Sinon.fake.resolves(null)
      Sinon.replace(procEventUtils, 'getTripId', fakeGetTripId)
      const fakeDeviceState: StateEntry = {
        timestamp: 41,
        type: 'telemetry'
      } as StateEntry
      const result = await procEvent.processTripTelemetry(fakeDeviceState)
      assert.strictEqual(result, false)
      Sinon.restore()
    })

    it('Writes to trip map', async () => {
      const fakeGetTripId = Sinon.fake.resolves('fake-trip-id')
      Sinon.replace(procEventUtils, 'getTripId', fakeGetTripId)

      const fakeReadTripsTelemetry = Sinon.fake.resolves(null)
      Sinon.replace(cache, 'readTripTelemetry', fakeReadTripsTelemetry)

      const fakeWriteTripsTelemetry = Sinon.fake.resolves('foo')
      Sinon.replace(cache, 'writeTripTelemetry', fakeWriteTripsTelemetry)

      const fakeDeviceState: StateEntry = {
        timestamp: 41,
        type: 'telemetry',
        provider_id: 'fake-provider-id',
        device_id: 'fake-device-id',
        trip_id: 'fake-trip-id'
      } as StateEntry
      const result = await procEvent.processTripTelemetry(fakeDeviceState)
      assert.strictEqual(result, true)
      assert.strictEqual(
        fakeWriteTripsTelemetry.args[0][0],
        `${fakeDeviceState.provider_id}:${fakeDeviceState.device_id}:${fakeDeviceState.trip_id}`
      )
      const expected = [
        {
          timestamp: 41,
          latitude: null,
          longitude: null,
          annotation_version: undefined,
          annotation: undefined,
          service_area_id: undefined
        }
      ]
      assert.deepStrictEqual(fakeWriteTripsTelemetry.args[0][1], expected)
      Sinon.restore()
    })
  })
  describe('processTripEvent()', () => {
    it('Returns false if unable to match', async () => {
      const fakeDeviceState: StateEntry = {
        trip_id: null
      } as StateEntry
      const result = await procEvent.processTripEvent(fakeDeviceState)
      assert.strictEqual(result, false)
    })

    it('Writes to event map', async () => {
      const fakeReadTripsEvents = Sinon.fake.resolves(null)
      Sinon.replace(cache, 'readTripEvents', fakeReadTripsEvents)

      const fakeWriteTripsEvents = Sinon.fake.resolves('foo')
      Sinon.replace(cache, 'writeTripEvents', fakeWriteTripsEvents)

      const fakeDeviceState: StateEntry = {
        trip_id: 'fake-trip-id',
        provider_id: 'fake-provider-id',
        device_id: 'fake-device-id'
      } as StateEntry
      const result = await procEvent.processTripEvent(fakeDeviceState)
      assert.strictEqual(result, true)
      assert.strictEqual(
        fakeWriteTripsEvents.args[0][0],
        `${fakeDeviceState.provider_id}:${fakeDeviceState.device_id}:${fakeDeviceState.trip_id}`
      )
      const expected = [
        {
          vehicle_type: undefined,
          timestamp: undefined,
          event_type: undefined,
          event_type_reason: undefined,
          annotation_version: undefined,
          annotation: undefined,
          gps: undefined,
          service_area_id: undefined
        }
      ]
      assert.deepStrictEqual(fakeWriteTripsEvents.args[0][1], expected)
      Sinon.restore()
    })
  })
})

describe('Proc Event cache methods', () => {
  before(async () => {
    await Promise.all([cache.initialize()])
  })
  after(async () => {
    await Promise.all([cache.shutdown()])
  })
  describe('Cache Device State', () => {
    it('Write/read device state to/from cache', async () => {
      const deviceState = getMockedDeviceState(
        'event',
        now(),
        'fake-device-id',
        'fake-provider-id',
        'trip',
        'trip_start',
        'fake-trip-id'
      )
      await cache.writeDeviceState('fake-provider-id:fake-device-id', deviceState)
      const lastState = await cache.readDeviceState('fake-provider-id:fake-device-id')
      assert.deepStrictEqual(lastState, deviceState)
    })
  })
})

describe('Proc Events db methods', () => {
  before(async () => {
    await Promise.all([db.initialize()])
  })
  after(async () => {
    await Promise.all([db.shutdown()])
  })
  describe('Insert Device State', () => {
    it('Insert device state row into DB', async () => {
      const providerID = uuid()
      const deviceID = uuid()
      const tripID = uuid()
      const deviceState = getMockedDeviceState('event', now(), deviceID, providerID, 'trip', 'trip_start', tripID)
      await db.insertDeviceStates(deviceState)
      const queryA = `SELECT * FROM reports_device_states limit 1;`
      const [fetchedState] = await makeReadOnlyQuery(queryA)
      assert.deepStrictEqual(fetchedState, { id: 1, ...deviceState })
    })
  })
})

describe.only('Test Event Stream', () => {
  before(async () => {
    await Promise.all([cache.initialize(), db.initialize()])
  })
  after(async () => {
    await Promise.all([cache.initialize(), db.shutdown()])
    process.exit(0)
  })
  describe('Simulate event through event-processor', () => {
    it('Validate DB/cache writes', async () => {
      /** Simulate device */
      const providerID = uuid()
      const deviceID = uuid()
      const tripID = uuid()
      const timestamp = now()
      const device = getMockedDevice(deviceID, providerID, 'scooter')
      await cache.writeDevice(device)

      /** Simulate Event Input */
      const vehicleEvent = getMockedVehicleEvent(deviceID, providerID, timestamp, 'trip_start', tripID)
      const deviceState = getMockedDeviceState('event', timestamp, deviceID, providerID, 'trip', 'trip_start', tripID)
      await procEvent.eventProcessor('event', vehicleEvent)
      /** Device State Table */
      const query = `SELECT * FROM reports_device_states limit 1;`
      const [fetchedState] = await makeReadOnlyQuery(query)
      assert.deepStrictEqual(fetchedState, { id: 1, ...deviceState })
      /** Device State Cache */
      const lastState = await cache.readDeviceState(`${providerID}:${deviceID}`)
      assert.deepStrictEqual(lastState, deviceState)
      /** Vehicle type */
      const vehicleType = await cache.getVehicleType(deviceID)
      assert.strictEqual(vehicleType, 'scooter')
      /** Trip Event Cache */
      const tripEvent = getMockedTripEvent('scooter', timestamp, 'trip_start')
      const tripEventCache = await cache.readTripEvents(`${providerID}:${deviceID}:${tripID}`)
      assert.deepStrictEqual(tripEventCache, [tripEvent])
      /** Trip Telemetry Cache */
      const tripTelemetry = getMockedTripTelemetry('scooter', timestamp, 'trip_start')
      const tripTelemCache = await cache.readTripTelemetry(`${providerID}:${deviceID}:${tripID}`)
      assert.deepStrictEqual(tripTelemCache, [tripTelemetry])

      /** Simulate Telemetry Input */
      const telemetry = getMockedTelemetry(deviceID, providerID, timestamp)
      const deviceState2 = getMockedDeviceState('telemetry', timestamp, deviceID, providerID, null, null, null)
      await procEvent.eventProcessor('telemetry', telemetry)
      /** Device State Table */
      const query2 = `SELECT * FROM reports_device_states ORDER BY id DESC limit 1;`
      const [fetchedState2] = await makeReadOnlyQuery(query2)
      assert.deepStrictEqual(fetchedState2, { id: 2, ...deviceState2 })
      /** Device State Cache */
      const lastState2 = await cache.readDeviceState(`${providerID}:${deviceID}`)
      assert.deepStrictEqual(lastState2, deviceState)
      /** Vehicle type */
      const vehicleType2 = await cache.getVehicleType(deviceID)
      assert.strictEqual(vehicleType2, 'scooter')
      /** Trip Event Cache */
      const tripEventCache2 = await cache.readTripEvents(`${providerID}:${deviceID}:${tripID}`)
      assert.deepStrictEqual(tripEventCache2, [tripEvent])
      /** Trip Telemetry Cache */
      // const tripTelemetry2 = getMockedTripTelemetry('scooter', timestamp, 'trip_start')
      const tripTelemCache2 = await cache.readTripTelemetry(`${providerID}:${deviceID}:${tripID}`)
      assert.deepStrictEqual(tripTelemCache2, [tripTelemetry, tripTelemetry])
    })
  })
})
