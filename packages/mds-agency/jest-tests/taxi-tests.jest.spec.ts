import { Device, TripMetadata, VehicleEvent, VEHICLE_TYPES } from '@mds-core/mds-types'
import { ApiServer } from '@mds-core/mds-api-server'
import supertest from 'supertest'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import { PROVIDER_SCOPES } from '@mds-core/mds-test-data'
import { now, uuid } from '@mds-core/mds-utils'
import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-agency-cache'
import stream from '@mds-core/mds-stream'
import { shutdown as socketShutdown } from '@mds-core/mds-web-sockets'
import { api } from '../api'

type POSTableVehicleEvent = Omit<VehicleEvent, 'provider_id' | 'recorded'>

const HOSTNAME = process.env.AGENCY_URL ?? ''

const request = HOSTNAME ? supertest(HOSTNAME) : supertest(ApiServer(api))

const AUTH =
  process.env.AUTH_TOKEN ?? `basic ${Buffer.from(`${TEST1_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`

const TEST_TAXI: () => Omit<Device, 'recorded'> = () => ({
  accessibility_options: ['wheelchair_accessible'],
  device_id: uuid(),
  provider_id: TEST1_PROVIDER_ID,
  vehicle_id: 'test-id-1',
  vehicle_type: VEHICLE_TYPES.car,
  propulsion_types: ['electric'],
  year: 2018,
  mfgr: 'Schwinn',
  modality: 'taxi',
  model: 'Mantaray'
})

const fakeVehicle = (overrides?: Partial<Device>) => ({ ...TEST_TAXI(), ...overrides })

const TEST_TELEMETRY = ({ device_id }: Pick<Device, 'device_id'>) => ({
  device_id,
  provider_id: TEST1_PROVIDER_ID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    hdop: 1,
    heading: 180
  },
  charge: 0.5,
  timestamp: now()
})

const fakeEvent = ({ device_id }: Pick<Device, 'device_id'>): Omit<VehicleEvent, 'recorded' | 'provider_id'> => ({
  device_id,
  event_types: ['service_start'],
  vehicle_state: 'available',
  trip_state: null,
  telemetry: TEST_TELEMETRY({ device_id }),
  timestamp: now()
})

const registerVehicleRequest = (vehicle: Omit<Device, 'recorded'>) =>
  request.post(`/agency/vehicles`).set('Authorization', AUTH).send(vehicle).expect(201)

const postEventRequest = (event: Omit<VehicleEvent, 'recorded' | 'provider_id'>) =>
  request.post(`/agency/vehicles/${event.device_id}/event`).set('Authorization', AUTH).send(event).expect(201)

const postEvent = (
  eventsContext: POSTableVehicleEvent[],
  device: Omit<Device, 'recorded'>,
  overrides?: Partial<POSTableVehicleEvent>
) => {
  const event = { ...fakeEvent(device), ...overrides }
  const result = postEventRequest(event)
  eventsContext.push(event)
  return { result, event }
}

const fakeTripMetadata: (
  overrides?: Partial<Omit<TripMetadata, 'provider_id'>>
) => Omit<TripMetadata, 'provider_id'> = overrides => ({
  trip_id: uuid(),
  reservation_time: now(),
  dispatch_time: now(),
  trip_start_time: now(),
  requested_trip_start_location: {
    lat: 37.3382,
    lng: -121.8863
  },
  quoted_trip_start_time: now(),
  trip_end_time: now(),
  distance: 0,
  accessibility_options: [],
  fare: {
    quoted_cost: 2000,
    actual_cost: 2500,
    components: {},
    currency: 'USD',
    payment_methods: ['cash', 'card']
  },
  reservation_type: 'on_demand',
  reservation_method: 'phone_dispatch',
  ...overrides
})

const postTripMetadata = (metadata: Omit<TripMetadata, 'provider_id'>) => {
  return request.post(`/agency/trips`).set('Authorization', AUTH).send(metadata).expect(201)
}

const constructTripMetadata = (
  events: POSTableVehicleEvent[],
  overrides?: Partial<Omit<TripMetadata, 'provider_id'>>
) => {
  const reservation_time = events.find(x => x.event_types.includes('reservation_start'))?.timestamp
  const dispatch_time = reservation_time

  const trip_start_time = events.find(x => x.event_types.includes('trip_start'))?.timestamp
  const quoted_trip_start_time = trip_start_time

  const trip_id = events.find(x => x.trip_id)?.trip_id ?? undefined

  return fakeTripMetadata({
    trip_id,
    reservation_time,
    trip_start_time,
    dispatch_time,
    quoted_trip_start_time,
    ...overrides
  })
}

/**
 * Kicks off a "standard" trip flow.
 *
 * @param eventsContext Contextual array where events should be pushed.
 * This _will_ mutate outside of the scope of this function,
 * in order to power things such as the TripMetadata constructor
 * @param vehicle
 */
const basicTripFlow = async (eventsContext: POSTableVehicleEvent[], vehicle: Omit<Device, 'recorded'>) => {
  const trip_id = uuid()

  await postEvent(eventsContext, vehicle, { event_types: ['service_start'], vehicle_state: 'available' })

  await postEvent(eventsContext, vehicle, {
    event_types: ['reservation_start'],
    vehicle_state: 'reserved',
    trip_state: 'reserved',
    trip_id
  })

  await postEvent(eventsContext, vehicle, {
    event_types: ['reservation_stop'],
    vehicle_state: 'stopped',
    trip_state: 'stopped',
    trip_id
  })

  await postEvent(eventsContext, vehicle, {
    event_types: ['trip_start'],
    vehicle_state: 'on_trip',
    trip_state: 'on_trip',
    trip_id
  })

  await postEvent(eventsContext, vehicle, {
    event_types: ['trip_stop'],
    vehicle_state: 'stopped',
    trip_state: 'stopped',
    trip_id
  })

  await postEvent(eventsContext, vehicle, {
    event_types: ['trip_end'],
    vehicle_state: 'available',
    trip_id
  })
}

describe('Taxi Tests', () => {
  beforeAll(async () => {
    if (!HOSTNAME) await Promise.all([db.initialize(), cache.initialize()])
  })

  afterAll(async () => {
    if (!HOSTNAME) await Promise.all([db.shutdown(), cache.shutdown(), stream.shutdown(), socketShutdown()])
  })

  describe('Scenarios', () => {
    describe('1. Available for-hire', () => {
      it('1.a Taxi becomes available for-hire', async () => {
        const vehicle = fakeVehicle()
        const events: POSTableVehicleEvent[] = []

        await registerVehicleRequest(vehicle)
        await postEvent(events, vehicle, { event_types: ['service_start'], vehicle_state: 'available' })
      })

      it('1.b Taxi stops being available for-hire', async () => {
        const vehicle = fakeVehicle()
        const events: POSTableVehicleEvent[] = []

        await registerVehicleRequest(vehicle)
        await postEvent(events, vehicle, { event_types: ['service_end'], vehicle_state: 'non_operational' })
      })

      it('1.c Taxi driver takes a break', async () => {
        const vehicle = fakeVehicle()
        const events: POSTableVehicleEvent[] = []

        await registerVehicleRequest(vehicle)
        await postEvent(events, vehicle, { event_types: ['service_start'], vehicle_state: 'available' })
        await postEvent(events, vehicle, { event_types: ['service_end'], vehicle_state: 'non_operational' })
      })
    })

    describe('2. Trips', () => {
      describe('2.a Reservation Methods', () => {
        it('2.a.i Taxi picks up and drops off a passenger who requested a ride by calling the taxi company', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)

          await basicTripFlow(events, vehicle)

          await postTripMetadata(constructTripMetadata(events))
        })

        it('2.a.ii Taxi picks up and drops off a passenger who requested a ride using an app', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)
          await basicTripFlow(events, vehicle)

          await postTripMetadata(constructTripMetadata(events, { reservation_method: 'app' }))
        })

        it('2.a.iii Taxi picks up and drops off a passenger who hailed the taxi in the street', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)
          await basicTripFlow(events, vehicle)

          await postTripMetadata(constructTripMetadata(events, { reservation_method: 'street_hail' }))
        })

        it('2.a.iv Taxi picks up and drops off a passenger who requested a scheduled pickup at a specific time', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)
          await basicTripFlow(events, vehicle)

          await postTripMetadata(
            constructTripMetadata(events, { reservation_method: 'app', reservation_type: 'scheduled' })
          )
        })
      })

      describe('2.b Wheelchair Passengers', () => {
        it('2.b.i Taxi picks up and drops off a passenger using a wheelchair', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)

          await basicTripFlow(events, vehicle)

          await postTripMetadata(constructTripMetadata(events, { accessibility_options: ['wheelchair_accessible'] }))
        })
      })

      describe('2.c Fares', () => {
        it('2.c.i Taxi picks up and drops off a passenger who pays their fare using multiple payment methods', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)

          await basicTripFlow(events, vehicle)

          await postTripMetadata(
            constructTripMetadata(events, {
              fare: {
                quoted_cost: 2000,
                actual_cost: 2500,
                components: {},
                currency: 'USD',
                payment_methods: ['cash', 'card']
              }
            })
          )
        })

        it('2.c.ii Taxi picks up and drops off a passenger who pays their fare using an equity program', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)

          await basicTripFlow(events, vehicle)

          await postTripMetadata(
            constructTripMetadata(events, {
              fare: {
                quoted_cost: 2000,
                actual_cost: 2500,
                components: {},
                currency: 'USD',
                payment_methods: ['equity_program']
              }
            })
          )
        })

        it('2.c.iii Taxi picks up and drops off a passenger at the airport, incurring a fee', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)

          await basicTripFlow(events, vehicle)

          await postTripMetadata(
            constructTripMetadata(events, {
              fare: {
                quoted_cost: 2000,
                actual_cost: 2500,
                components: {
                  LAX_Trip_Fee: 400
                },
                currency: 'USD',
                payment_methods: ['card']
              }
            })
          )
        })

        it('2.c.iv Taxi picks up a passenger and uses an express lane before dropping them off, incurring a fee', async () => {
          const events: POSTableVehicleEvent[] = []
          const vehicle = fakeVehicle()

          await registerVehicleRequest(vehicle)

          await basicTripFlow(events, vehicle)

          await postTripMetadata(
            constructTripMetadata(events, {
              fare: {
                quoted_cost: 2000,
                actual_cost: 2500,
                components: {
                  '105_Express_Lane_Toll': 200
                },
                currency: 'USD',
                payment_methods: ['card']
              }
            })
          )
        })
      })
    })
  })
})
