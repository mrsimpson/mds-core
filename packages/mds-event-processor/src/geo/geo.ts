import { TripTelemetry, GpsData } from '@mds-core/mds-types'

import turfMain, { Polygon, MultiPolygon, Feature, Properties } from '@turf/helpers'
import turf from '@turf/boolean-point-in-polygon'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAreas = require('./service-areas')

const districtAreas: { [key: string]: Polygon | MultiPolygon | Feature<Polygon | MultiPolygon, Properties> } = {}

/* eslint-reason FIXME use map() */
/* eslint-disable-next-line guard-for-in */
for (const index in serviceAreas.features) {
  const district_uuid = serviceAreas.features[index].properties.dist_uuid
  // still servicing
  districtAreas[district_uuid] = serviceAreas.features[index] // turf_main.polygon(area[0]));
}

function findServiceAreas(lng: number, lat: number) {
  const areas = []
  const turfPT = turfMain.point([lng, lat])
  for (const key in districtAreas) {
    if (turf(turfPT, districtAreas[key])) {
      areas.push({ id: key, type: 'district' })
    }
  }
  return areas
}

function moved(latA: number, lngA: number, latB: number, lngB: number) {
  const limit = 0.00001 // arbitrary amount
  const latDiff = Math.abs(latA - latB)
  const lngDiff = Math.abs(lngA - lngB)
  return lngDiff > limit || latDiff > limit // very computational efficient basic check (better than sqrts & trig)
}

// Helper funtion to calculate distance between two points given latitudes and longitudes
// Unit is default miles but can be expressed in kilometers given the value 'K'
function gpsDistance(latA: number, lngA: number, latB: number, lngB: number, unit = 'M'): number {
  if (latA === latB && lngA === lngB) {
    return 0
  }
  const radlat1 = (Math.PI * latA) / 180
  const radlat2 = (Math.PI * latB) / 180
  const theta = lngA - lngB
  const radtheta = (Math.PI * theta) / 180
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  if (dist > 1) {
    dist = 1
  }
  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  dist = dist * 60 * 1.1515
  if (unit === 'K') {
    dist *= 1.609344
  }
  return dist
}

export interface DistanceMeasure {
  totalDist: number
  points: number[]
}

const calcDistance = (telemetry: TripTelemetry[][], startGps: GpsData, units = 'M'): DistanceMeasure => {
  let tempX = startGps.lat
  let tempY = startGps.lng
  let distance = 0
  const points: number[] = []
  for (let n = 0; n < telemetry.length; n++) {
    for (let m = 0; m < telemetry[n].length; m++) {
      const currPing = telemetry[n][m]
      const pointDist = gpsDistance(currPing.latitude, currPing.longitude, tempX, tempY, units)
      distance += pointDist
      points.push(pointDist)
      tempX = currPing.latitude
      tempY = currPing.longitude
    }
  }
  return { totalDist: distance, points }
}

export { findServiceAreas, moved, calcDistance }
