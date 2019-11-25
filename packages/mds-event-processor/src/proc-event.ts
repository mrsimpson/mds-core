import { dataHandler } from './proc'
import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import stream from '@mds-core/mds-stream'

import { getAnnotationData, getAnnotationVersion } from './annotation'
import {
  CE_TYPE,
  StateEntry,
  TripEvent,
  TripTelemetry,
  EVENT_STATUS_MAP,
  VEHICLE_EVENT,
  VEHICLE_REASON
} from '@mds-core/mds-types'

/*
    Event processor that runs inside a Kubernetes pod.
    Streams cloudevents from mds agency and process them in multiple ways:

        1) quality checks
        2) status changes
        3) trip identification

    Processed events/telemetry are added to various caches keyed as follows:

        1) device:state (latest event/telemetry for a device)
        2) trip:events (events linked to trips of a device)
        3) device:ID:trips (all telemetry linked to all trips of a device)
            - ID is the combination 'provider_id:device_id'

    A Postgres table is also populated to store historical states:

        REPORTS_DEVICE_STATES:
          PRIMARY KEY = (provider_id, device_id, timestamp, type)
          VALUES = deviceState
*/

async function eventHandler() {
  await dataHandler('event', async function(type: CE_TYPE, data: any) {
    console.log(type, data)
    return processRaw(type, data)
  })
}

async function processRaw(type: CE_TYPE, data: any) {
  const { timestamp, device_id, provider_id, recorded } = data as {
    timestamp: number
    device_id: string
    provider_id: string
    recorded: number
  }
  const lastState = JSON.parse(await cache.hget('device:state', provider_id + ':' + device_id)) as StateEntry
  // Construct state
  const baseDeviceState = {
    vehicle_type: 'scooter',
    type: type.substring(type.lastIndexOf('.') + 1),
    timestamp: timestamp,
    device_id: device_id,
    provider_id: provider_id,
    time_recorded: recorded,
    annotation_version: getAnnotationVersion()
  } as StateEntry

  switch (baseDeviceState.type) {
    case 'event': {
      const { event_type, telemetry, event_type_reason, trip_id, service_area_id } = data as {
        event_type: VEHICLE_EVENT
        telemetry: any
        event_type_reason: VEHICLE_REASON
        trip_id: string
        service_area_id: string
      }
      const gps = telemetry ? telemetry.gps : null
      const charge = telemetry ? telemetry.charge : null
      const annotation = gps ? getAnnotationData(gps) : null
      //TODO decide what to do with annotation data
      const district = annotation ? (annotation.areas.length ? annotation.areas[0].id : null) : null
      const deviceState = {
        ...baseDeviceState,
        annotation: annotation,
        gps: gps,
        service_area_id: service_area_id,
        charge: charge,
        state: EVENT_STATUS_MAP[event_type as VEHICLE_EVENT],
        event_type: event_type,
        event_type_reason: event_type_reason,
        trip_id: trip_id
      } as StateEntry
      // Take necessary steps on event trasitions
      switch (data.event_type) {
        case 'trip_start':
          processTripEvent(deviceState)
        case 'trip_enter':
          processTripEvent(deviceState)
        case 'trip_leave':
          processTripEvent(deviceState)
        case 'trip_end':
          processTripEvent(deviceState)
      }
      // Only update cache (device:state) with most recent event
      if (!lastState || lastState.timestamp < deviceState.timestamp) {
        await cache.hset('device:state', provider_id + ':' + device_id, JSON.stringify(deviceState))
      }
      // Add to PG table (reports_device_states) and stream
      await db.insert('reports_device_states', deviceState)
      //await stream.writeCloudEvent('mds.processed.event', JSON.stringify(device_state))
      return deviceState
    }

    case 'telemetry': {
      const { gps, charge } = data
      const annotation = getAnnotationData(gps)
      const district = annotation.areas.length ? annotation.areas[0].id : null
      const deviceState = {
        ...baseDeviceState,
        annotation: annotation,
        gps: gps,
        charge: charge
      } as StateEntry
      // Match telemetry to trip data
      processTripTelemetry(deviceState)

      // Add to PG table (reports_device_states) and stream
      await db.insert('reports_device_states', deviceState)
      //await stream.writeCloudEvent('mds.processed.event', JSON.stringify(device_state))
      return deviceState
    }
  }
}

async function processTripEvent(deviceState: StateEntry) {
  /*
  Add vehicle events of a trip to cache (trips:events):

    Key: 'provider_id:device_id'
    Value: hash map of tripEvents keyed by trip_id

  */
  const {
    timestamp,
    event_type,
    event_type_reason,
    annotation_version,
    annotation,
    gps,
    service_area_id,
    trip_id,
    provider_id,
    device_id
  } = deviceState

  const tripEvent = {
    vehicle_type: 'scooter',
    timestamp: timestamp,
    event_type: event_type,
    event_type_resaon: event_type_reason,
    annotation_version: annotation_version,
    annotation: annotation,
    gps: gps,
    service_area_id: service_area_id
  } as TripEvent

  // Either append to existing trip or create new entry
  const trips: { [trip_id: string]: TripEvent[] } = JSON.parse(
    await cache.hget('trips:events', provider_id + ':' + device_id)
  )

  //TODO reduce logic
  if (trip_id) {
    if (!trips[trip_id]) {
      trips[trip_id] = []
    }
    trips[trip_id].push(tripEvent)
  }

  // Update trip event cache and stream
  await cache.hset('trips:events', provider_id + ':' + device_id, JSON.stringify(trips))
  //await stream.writeCloudEvent('mds.trip.event', JSON.stringify(tripEvent))

  await processTripTelemetry(deviceState)
}

async function getTripId(deviceState: StateEntry) {
  /*
  Return trip_id for telemetery entry by associating timestamps
  */
  const { provider_id, device_id, timestamp } = deviceState
  const tripsEvents: { [trip_id: string]: TripEvent[] } = JSON.parse(
    await cache.hget('trips:events', provider_id + ':' + device_id)
  )
  if (!tripsEvents) {
    console.log('NO TRIP DATA FOUND')
    return undefined
  } else {
    let latestStartTime
    let matchedID
    // Find latest trip whose start time is before current timestamp
    // TODO reduce logic with better filtering/mapping ({trip_id, start_time}[])
    for (let trip_id in tripsEvents) {
      const tripEvents: TripEvent[] = tripsEvents[trip_id]
      const startEvents: TripEvent[] = tripEvents.filter(function(tripEvents) {
        return tripEvents.event_type === 'trip_start' || tripEvents.event_type === 'trip_enter'
      })
      startEvents.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
      const tripStartTime = startEvents[0].timestamp
      if (tripStartTime <= timestamp && (!latestStartTime || latestStartTime <= tripStartTime)) {
        matchedID = trip_id
        latestStartTime = tripStartTime
      }
    }
    if (!matchedID) {
      console.log('NO TRIPS MATCHED')
      return undefined
    }
    return matchedID
  }
}

async function processTripTelemetry(deviceState: StateEntry) {
  /*
    Add trip related telemetry to cache (trips:telemetry):

      Key: 'provider_id:device_id'
      Value: hash map of tripTelemetry keyed by trip_id

  */
  const {
    type,
    timestamp,
    annotation_version,
    annotation,
    gps,
    service_area_id,
    provider_id,
    device_id,
    trip_id
  } = deviceState

  const lat = gps ? gps.lat : null
  const lng = gps ? gps.lng : null
  const tripTelemetry = {
    timestamp: timestamp,
    latitude: lat,
    longitude: lng,
    annotation_version: annotation_version,
    annotation: annotation,
    service_area_id: service_area_id
  } as TripTelemetry

  // Check if associated to an event or telemetry post
  const tripId = type === 'telemetry' ? getTripId(deviceState) : trip_id
  if (typeof tripId === 'undefined') {
    return false
  }
  const trips: { [trip_id: string]: TripTelemetry[] } = JSON.parse(
    await cache.hget('trips:telemetry', provider_id + ':' + device_id)
  )

  //TODO reduce logic
  if (typeof tripId === 'string') {
    if (!trips[tripId]) {
      trips[tripId] = []
    }
    trips[tripId].push(tripTelemetry)
  }
  await cache.hset('trips:telemetry', provider_id + ':' + device_id, JSON.stringify(trips))
  return true
}

export { eventHandler as event_handler }
