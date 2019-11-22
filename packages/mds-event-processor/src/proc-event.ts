import { dataHandler } from './proc'
import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import stream from '@mds-core/mds-stream'

import { getAnnotationData, getAnnotationVersion } from './annotation'
import { EVENT_STATUS_MAP, VEHICLE_EVENT } from '@mds-core/mds-types'

interface State {
  type: any
  timestamp: any
  device_id: any
  provider_id: any
  state: any
  event_type: VEHICLE_EVENT | string | null
  event_type_reason?: any
  trip_id?: any
  service_area_id?: any
  gps: any
  battery: any
  annotation_version: any
  annotation: any
  time_recorded: any
}

// TODO move to mds-utils
const objectWithoutProperty = (object: { [x: string]: any }, key: string) => {
  const { [key]: _, ...otherKeys } = object
  return otherKeys
}

async function checkDupPrevState(deviceState: State, deviceLastState: State) {
  if (deviceLastState) {
    if (deviceLastState.timestamp === deviceState.timestamp) {
      if (deviceState.type === 'event') {
        if (deviceLastState.type === deviceState.type && deviceLastState.event_type === deviceState.event_type) {
          return false
        }
      } else if (deviceState.type === 'telemetry') {
        return false
      }
    }
  }
  return true
}

// TODO: build logic to check valid state transitions
async function stateDiagramCheck(device_state: State) {
  return true
}

async function checkInvalid(device_state: State) {
  if (device_state.type === 'event') {
    if (device_state.event_type && !EVENT_STATUS_MAP[device_state.event_type]) {
      return false
    }
    if (!stateDiagramCheck(device_state)) {
      return false
    }
  }
  return true
}

async function checkOutOfOrder(data: any, device_state: State) {
  // Only can check for events given allowable 24hr delay for telemetry
  // Currently only checking if trip events are out of order
  if (device_state.type === 'event') {
    if (
      device_state.event_type === 'trip_enter' ||
      device_state.event_type === 'trip_leave' ||
      device_state.event_type === 'trip_end'
    ) {
      let trip_id = data.trip_id
      let cur_state = await cache.hget('trip:state', device_state.provider_id + ':' + device_state.device_id)
      if (!cur_state) {
        return false
      } else {
        cur_state = JSON.parse(cur_state)
      }
      if (!cur_state[trip_id]) {
        return false
      }
    }
  }
  return true
}

async function qualityCheck(data: any, device_state: Partial<State>) {
  /*
    Filter to reduce noise and track it at the provider level.
    Main checks include:

      1) duplicate events/telemetry
      2) invalid events
      3) out of order events

    To track provider metrics we update a porvider data cache (provider:state):

      Key: provider_id
      Field Hash keys include:
        duplicateEvents
        invalidEvents
        outOfOrderEvents

  */
  let ps = await cache.hget('provider:state', device_state.provider_id)
  let provider_state: {
    duplicateEvents: any
    invalidEvents: any
    outOfOrderEvents: any
  }
  if (!ps) {
    provider_state = {
      duplicateEvents: [],
      invalidEvents: [],
      outOfOrderEvents: []
    }
  } else {
    provider_state = JSON.parse(ps)
  }

  if (device_state.type === 'event' && !data.telemetry) {
    console.log('EVENT MISSING TELEMETRY')
    return false
  }

  // Check if Duplicate event
  if (!checkDupPrevState(device_state, device_state.last_state_data)) {
    console.log('DUPLICATE EVENT')
    provider_state.duplicateEvents.push(device_state)
    return false
  }

  // Check if Invalid event
  if (!checkInvalid(device_state)) {
    console.log('INVALID EVENT')
    provider_state.invalidEvents.push(device_state)
    return false
  }

  // Check if Out of Order event
  if (!checkOutOfOrder(data, device_state)) {
    console.log('OUT OF ORDER EVENT')
    provider_state.outOfOrderEvents.push(device_state)
    return false
  }

  await cache.hset('provider:state', device_state.provider_id, JSON.stringify(provider_state))
  return true
}

/*
    Event processor api that runs inside a Kubernetes pod.
    Streams cloudevents from mds agency and process them in multiple ways:

        1) quality checks
        2) status changes
        3) trip identification

    Processed events/telemetry are added to various caches keyed as follows:

        1) device:state (latest event/telemetry for a device)
        2) trip:state (events linked to trips of a device)
        3) device:ID:trips (all telemetry linked to all trips of a device)
            - ID is the combination 'provider_id:device_id'

    A Postgres table is also populated to store historical states:

        REPORTS_DEVICE_STATES:
          PRIMARY KEY = (provider_id, device_id, timestamp, type)
          VALUES = device_state
*/
async function eventHandler() {
  await dataHandler('event', async function(type: any, data: any) {
    console.log(type, data)
    return processRaw(type, data)
  })
}

async function processRaw(type: string, data: any) {
  // Get last state of device
  const dls = JSON.parse(await cache.hget('device:state', data.provider_id + ':' + data.device_id)) as State

  const baseDeviceState = {
    type: type.substring(type.lastIndexOf('.') + 1),
    timestamp: data.timestamp,
    device_id: data.device_id,
    provider_id: data.provider_id,
    annotation_version: getAnnotationVersion(),
    time_recorded: data.recorded
  }

  // Quality filter events/telemetry
  if (!(await qualityCheck(data, baseDeviceState))) {
    return null
  }

  /*
  Construct fields specific to telemtry or events.
  Fields specific to events (null for telemetry):
      -event_type
      -event_type_reason
      -trip_id
      -service_area_id
      -state
  */
  switch (baseDeviceState.type) {
    case 'event': {
      const { event_type, gps, telemetry, event_type_reason, trip_id, service_area_id } = data
      const { charge } = telemetry
      const deviceState = {
        ...baseDeviceState,
        gps,
        annotation: getAnnotationData(gps),
        battery: charge,
        event_type,
        event_type_reason,
        trip_id,
        service_area_id,
        state: EVENT_STATUS_MAP[event_type as VEHICLE_EVENT]
      }

      // Take necessary steps on event trasitions
      switch (data.event_type) {
        case 'trip_start':
          processTripEvent(deviceState)
        case 'trip_enter':
        case 'trip_leave':
        case 'trip_end':
          processTripEvent(deviceState)
      }

      // Only update cache (device:state) with most recent event
      if (
        !dls ||
        dls.timestamp < deviceState.timestamp ||
        (dls.timestamp === deviceState.timestamp && deviceState.trip_id)
      ) {
        await cache.hset('device:state', data.provider_id + ':' + data.device_id, JSON.stringify(deviceState))
      }
      await db.insert('reports_device_states', deviceState)
      //await stream.writeCloudEvent('mds.processed.event', JSON.stringify(device_state))
      return deviceState
    }
    //TODO refactor event_type field for telemertry
    case 'telemetry': {
      const { gps, charge: battery } = data
      const deviceState = {
        ...baseDeviceState,
        gps,
        annotation: getAnnotationData(gps),
        battery,
        event_type: 'telemetry',
        state: dls
      }

      setTimeout(function() {
        processTripTelemetry(deviceState)
      }, 5000)
      // Add to PG table (reports_device_states) and stream
      await db.insert('reports_device_states', deviceState)
      //await stream.writeCloudEvent('mds.processed.event', JSON.stringify(device_state))
      return deviceState
    }
  }
}

async function processTripEvent(device_state: State) {
  /*
    Add events related to a trip to a cache (trip:state)

      Key: 'provider_id:device_id'
      Field Hash keys include:
        timestamp
        event
        event_type_resaon
        service_area_id
        district
        gps
  */
  // Create trip data
  const trip_id = device_state.trip_id
  const district = device_state.annotation.geo.areas.length ? device_state.annotation.geo.areas[0].id : null
  const trip_event_data = {
    timestamp: device_state.timestamp,
    event: device_state.event_type,
    event_type_resaon: device_state.event_type_reason,
    service_area_id: device_state.service_area_id,
    district: district,
    gps: device_state.gps
  }

  // Append to existing trip or create new
  const cs = await cache.hget('trip:state', device_state.provider_id + ':' + device_state.device_id)
  const cur_state: {
    [trip_id: string]: {
      timestamp: any
      event: any
      event_type_resaon: any
      service_area_id: any
      district: any
      gps: any
    }[]
  } = cs ? JSON.parse(cs) : {}

  if (!cur_state[trip_id]) {
    cur_state[trip_id] = []
  }
  cur_state[trip_id].push(trip_event_data)

  // Update trip event cache and stream
  await cache.hset('trip:state', device_state.provider_id + ':' + device_state.device_id, JSON.stringify(cur_state))
  await stream.writeCloudEvent('mds.trip.event', JSON.stringify(trip_event_data))

  await processTripTelemetry(device_state)
}

async function getTripId(deviceState: State) {
  let trip_query = await cache.hget('trip:state', deviceState.provider_id + ':' + deviceState.device_id)
    let trips: {
      [trip_id: string]: {
        timestamp: any
        event: any
        event_type_resaon: any
        service_area_id: any
        district: any
        gps: any
      }[]
    }
    // Requires trip start event to match telemetry to tripID
    if (!trip_query) {
      console.log('NO TRIP DATA FOUND')
      return null
    } else {
      trips = JSON.parse(trip_query)
      let trip
      let trip_start_time
      // find latest trip whose start time is before current timestamp
      for (let trip_key in trips) {
        trip = trips[trip_key]
        for (let i in trip) {
          if (trip[i].event === 'trip_start') {
            if (
              trip[i].timestamp <= deviceState.timestamp &&
              (!trip_start_time || trip_start_time <= trip[i].timestamp)
            ) {
              const trip_id = trip_key
              trip_start_time = trip[i].timestamp
              if (!trip_id) {
                console.log('NO TRIPS MATCHED')
                return null
              }
              return trip_id
            }
          }
        }
      }
    }
  }

async function processTripTelemetry(deviceState: State) {
  /*
    Add telemetry related to a trip to a cache (device:{ID}:trips)

      ID: 'provider_id:device_id'
      Key: trip_id
      Field Hash keys include:
        timestamp
        latitude
        longitude
        annotation_version
        annotation
  */
  // Check if accosiated to an event or telemetry post
  const trip_id = deviceState.type === 'telemetry' ? getTripId(deviceState) : deviceState.trip_id

  // Construct trip event entry/update
  const trip_event_data: {
    timestamp: any
    latitude: any
    longitude: any
    annotation_version: any
    annotation: any
  } = {
    timestamp: deviceState.timestamp,
    latitude: deviceState.gps.lat,
    longitude: deviceState.gps.lng,
    annotation_version: deviceState.annotation_version,
    annotation: deviceState.annotation
  }

  const cs = await cache.hget('device:' + deviceState.provider_id + ':' + deviceState.device_id + ':trips', trip_id)
  const cur_state: {
    timestamp: any
    latitude: any
    longitude: any
    annotation_version: any
    annotation: any
  }[] = cs ? JSON.parse(cs) : []

  // Don't add same telemetry timestamp twice
  if (cur_state.filter(state => state.timestamp === trip_event_data.timestamp).length === 0) {
    cur_state.push(trip_event_data)
  }
  await cache.hset(
    'device:' + deviceState.provider_id + ':' + deviceState.device_id + ':trips',
    trip_id,
    JSON.stringify(cur_state)
  )
}

export { eventHandler as event_handler }
