import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import { StateEntry, EVENT_STATUS_MAP, VehicleCountMetricObj, MetricCount, LateMetricObj } from '@mds-core/mds-types'

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

async function calcVehicleCounts(id: string): Promise<VehicleCountMetricObj> {
  const events = await db.getStates(id)
  const stateCache = await cache.hgetall('device:state')
  const recentStates = Object.values(stateCache)

  // Calculate total number of registered vehicles at start of bin
  let histRegistered = events.filter(function(events: StateEntry) {
    return events.event_type === 'register'
  }).length
  let histDeregistered = events.filter(function(events: StateEntry) {
    return events.event_type === 'deregister'
  }).length
  let currRegistered = histRegistered - histDeregistered

  // Calculate total number of vehicle in Right of way
  //TODO: 48 hour filtering
  let count = 0
  for (let i in recentStates) {
    const deviceState = JSON.parse(recentStates[i])
    if (
      deviceState.state === 'available' ||
      deviceState.state === 'trip' ||
      deviceState.state === 'reserved' ||
      deviceState.state === 'unavailable'
    ) {
      count += 1
    }
  }
  //vehicle_counts.deployed = recent_states.filter(function(recent_states: any) {
  //  return recent_states.state === "available"
  //}).length

  const vehicleCounts: VehicleCountMetricObj = {
    registered: currRegistered,
    deployed: count,
    dead: null
  }
  return vehicleCounts
}

async function calcTripCount(id: string, curTime: number): Promise<number> {
  const lastHour = curTime - 3600000
  const tripCount = await db.getTripCount(id, lastHour, curTime)
  return tripCount[0].count
}

async function calcVehicleTripCount(id: string, curTime: number): Promise<string> {
  const maxTrips = 5
  let tripCountArray = new Array(maxTrips + 1).fill(0)
  const rs = await cache.hgetall('device:state')
  const vehicles = Object.keys(rs)
  const lastHour = curTime - 3600000
  // TODO: migrate form inefficient loop once SET is created in cache
  for (let i in vehicles) {
    const [providerID, deviceID] = vehicles[i].split(':')
    if (providerID === id) {
      const tripCount = await db.getVehicleTripCount(deviceID, lastHour, curTime)
      const tripCountIndex = tripCount[0].count
      if (tripCountIndex >= maxTrips) {
        tripCountArray[maxTrips] += 1
      } else {
        tripCountArray[tripCountIndex] += 1
      }
    }
  }
  return String(tripCountArray)
}

async function calcLateEventCount(id: string, curTime: number): Promise<LateMetricObj> {
  const last_hour = curTime - 3600000
  const a = await db.getLateEventCount(id, "('trip_start', 'trip_end')", last_hour, curTime)
  const b = await db.getLateEventCount(id, "('trip_enter', 'trip_leave')", last_hour, curTime)
  const c = await db.getLateEventCount(id, "('telemetry')", last_hour, curTime)

  const lateStartEnd = {
    count: a[0].count
  } as MetricCount
  const lateEnterLeave = {
    count: b[0].count
  } as MetricCount
  const lateTelemetry = {
    count: c[0].count
  } as MetricCount

  const lateMetric: LateMetricObj = {
    start_end: lateStartEnd,
    enter_leave: lateEnterLeave,
    telemetry: lateTelemetry
  }
  return lateMetric
}

async function calcTelemDistViolationCount(id: string, curTime: number): Promise<MetricCount> {
  // Calculating for trips that ended 24 hours ago in an hour bin
  const binEnd = curTime - 86400000
  const binStart = binEnd - 90000000
  const trips = await db.getTrips(id, binStart, binEnd)

  let countArray = trips.map(function(trips: any) {
    return trips.violation_count
  })
  let avgArray = trips.map(function(trip: any) {
    return trip.avg_violation_dist
  })
  let maxArray = trips.map(function(trip: any) {
    return trip.max_violation_dist
  })
  let minArray = trips.map(function(trip: any) {
    return trip.min_violation_dist
  })

  const add = (a: number, b: number) => a + b

  const telemViolations: MetricCount =
    countArray.length > 0
      ? {
          count: countArray.reduce(add),
          average: avgArray.reduce(add) / avgArray.length,
          min: Math.min(...minArray),
          max: Math.max(...maxArray)
        }
      : { count: 0 }
  return telemViolations
}

export = {
  calcEventCounts,
  calcVehicleCounts,
  calcTripCount,
  calcVehicleTripCount,
  calcLateEventCount,
  calcTelemDistViolationCount
}
