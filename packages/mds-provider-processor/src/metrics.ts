import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import { StateEntry, EVENT_STATUS_MAP } from '@mds-core/mds-types'

// TODO: refactor
async function calcEventCounts(id: string) {
  const events = await db.getStates(id)
  let eventCounts: any = {
    service_start: null,
    user_drop_off: null,
    provider_drop_off: null,
    trip_end: null,
    cancel_reservation: null,
    reserve: null,
    service_end: null,
    trip_start: null,
    trip_enter: null,
    trip_leave: null,
    register: null,
    provider_pick_up: null,
    agency_drop_off: null,
    default: null,
    deregister: null,
    agency_pick_up: null,
    telemetry: null
  }

  for (let event_type in EVENT_STATUS_MAP) {
    eventCounts[event_type] = events.filter(function(events: StateEntry) {
      return events.event_type == event_type
    }).length
  }
  return eventCounts
}

// TODO: refactor
async function calcVehicleCounts(id: string) {
  let events = await db.getStates(id)
  let rs = await cache.hgetall('device:state')
  let recent_states = Object.values(rs)

  let vehicle_counts: any = {
    registered: null,
    deployed: null,
    dead: null
  }
  // Calculate total number of registered vehicles at start of bin
  let hist_registered = events.filter(function(events: StateEntry) {
    return events.event_type === 'register'
  }).length
  let hist_deregistered = events.filter(function(events: StateEntry) {
    return events.event_type === 'deregister'
  }).length
  let curr_registered = hist_registered - hist_deregistered
  vehicle_counts.registered = curr_registered

  // Calculate total number of vehicle in Right of way
  //TODO: 48 hour filtering
  let count = 0
  for (let i in recent_states) {
    let s = JSON.parse(recent_states[i])
    if (s.state === 'available' || s.state === 'trip' || s.state === 'reserved' || s.state === 'unavailable') {
      count += 1
    }
  }
  vehicle_counts.deployed = count
  //vehicle_counts.deployed = recent_states.filter(function(recent_states: any) {
  //  return recent_states.state === "available"
  //}).length

  return vehicle_counts
}

async function calcTripCount(id: string, curTime: number): Promise<number> {
  const last_hour = curTime - 3600000
  const trip_count = await db.getTripCount(id, last_hour, curTime)
  return trip_count[0].count
}

async function calcVehicleTripCount(id: string, curTime: number): Promise<string> {
  const max_trips = 5
  let trip_count_array = new Array(max_trips + 1).fill(0)
  const rs = await cache.hgetall('device:state')
  const vehicles = Object.keys(rs)
  const last_hour = curTime - 3600000
  // TODO: migrate form inefficient loop once SET is created in cache
  for (let i in vehicles) {
    const [provider_id, device_id] = vehicles[i].split(':')
    if (provider_id === id) {
      const trip_count = await db.getVehicleTripCount(device_id, last_hour, curTime)
      const trip_count_index = trip_count[0].count
      if (trip_count_index >= max_trips) {
        trip_count_array[max_trips] += 1
      } else {
        trip_count_array[trip_count_index] += 1
      }
    }
  }
  return String(trip_count_array)
}

// TODO: refactor
async function calcLateEventCount(id: string) {
  let late_counts: any = {
    start_end: { count: 0, min: 0, max: 0, average: 0 },
    enter_leave: { count: 0, min: 0, max: 0, average: 0 },
    telemetry: { count: 0, min: 0, max: 0, average: 0 }
  }
  let now = new Date().getTime()
  let last_hour = now - 3600000
  let late_start_end_count = await db.getLateEventCount(id, "('trip_start', 'trip_end')", last_hour, now)
  let late_enter_leave_count = await db.getLateEventCount(id, "('trip_enter', 'trip_leave')", last_hour, now)
  let late_telemetry_count = await db.getLateEventCount(id, "('telemetry')", last_hour, now)

  late_counts.start_end.count = late_start_end_count[0].count
  late_counts.enter_leave.count = late_enter_leave_count[0].count
  late_counts.telemetry.count = late_telemetry_count[0].count
  return late_counts
}

// TODO: refactor
async function calcTelemDistViolationCount(id: string) {
  let telem_violations: any = {
    count: 0,
    min: 0,
    max: 0,
    average: 0
  }
  // Calculating for trips that ended 24 hours ago in an hour bin
  let now_yesterday = new Date().getTime() - 86400000
  let last_hour_yesterday = now_yesterday - 90000000
  let trips = await db.getTrips(id, last_hour_yesterday, now_yesterday)

  let violation_count_array = trips.map(function(trips: any) {
    return trips.violation_count
  })
  let telem_avg_array = trips.map(function(trip: any) {
    return trip.avg_violation_dist
  })
  let telem_max_array = trips.map(function(trip: any) {
    return trip.max_violation_dist
  })
  let telem_min_array = trips.map(function(trip: any) {
    return trip.min_violation_dist
  })

  if (violation_count_array.length > 0) {
    let add = (a: number, b: number) => a + b
    telem_violations.count = violation_count_array.reduce(add)
    telem_violations.average = telem_avg_array.reduce(add) / telem_avg_array.length
    telem_violations.min = Math.min(...telem_min_array)
    telem_violations.max = Math.max(...telem_max_array)
  }

  return telem_violations
}

export = {
  calcEventCounts,
  calcVehicleCounts,
  calcTripCount,
  calcVehicleTripCount,
  calcLateEventCount,
  calcTelemDistViolationCount
}
