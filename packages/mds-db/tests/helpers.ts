import { Telemetry, VehicleEvent, Device, Geography } from '@mds-core/mds-types'
import {
  JUMP_TEST_DEVICE_1,
  makeDevices,
  makeEventsWithTelemetry,
  JUMP_PROVIDER_ID,
  GEOGRAPHY_UUID,
  GEOGRAPHY2_UUID,
  LA_CITY_BOUNDARY,
  DISTRICT_SEVEN
} from '@mds-core/mds-test-data'
import { now, rangeRandomInt } from '@mds-core/mds-utils'
import MDSDBPostgres from '../index'
import { dropTables, createTables, updateSchema } from '../migration'
import { configureClient, MDSPostgresClient, PGInfo } from '../sql-utils'

const { env } = process

export const pg_info: PGInfo = {
  database: env.PG_NAME,
  host: env.PG_HOST || 'localhost',
  user: env.PG_USER,
  password: env.PG_PASS,
  port: Number(env.PG_PORT) || 5432
}
export const startTime = now() - 200
export const shapeUUID = 'e3ed0a0e-61d3-4887-8b6a-4af4f3769c14'
export async function seedDB() {
  await MDSDBPostgres.initialize()
  const devices: Device[] = makeDevices(9, startTime, JUMP_PROVIDER_ID) as Device[]
  devices.push(JUMP_TEST_DEVICE_1 as Device)
  const decommissionEvents: VehicleEvent[] = makeEventsWithTelemetry(devices.slice(0, 9), startTime + 10, shapeUUID, {
    event_types: ['decommissioned'],
    vehicle_state: 'removed',
    speed: rangeRandomInt(0, 10)
  })
  const tripEndEvent: VehicleEvent[] = makeEventsWithTelemetry(devices.slice(9, 10), startTime + 10, shapeUUID, {
    event_types: ['decommissioned'],
    vehicle_state: 'removed',
    speed: rangeRandomInt(0, 10)
  })
  const telemetry: Telemetry[] = []
  const events: VehicleEvent[] = decommissionEvents.concat(tripEndEvent)
  events.map(event => {
    if (event.telemetry) {
      telemetry.push(event.telemetry)
    }
  })

  await MDSDBPostgres.seed({ devices, events, telemetry })
}

export async function setFreshDB() {
  const client: MDSPostgresClient = configureClient(pg_info)
  await client.connect()
  await dropTables(client)
  await createTables(client)
  await updateSchema(client)
  await client.end()
}

export const LAGeography: Geography = {
  name: 'Los Angeles',
  geography_id: GEOGRAPHY_UUID,
  geography_json: LA_CITY_BOUNDARY
}
export const DistrictSeven: Geography = {
  name: 'District Seven',
  geography_id: GEOGRAPHY2_UUID,
  geography_json: DISTRICT_SEVEN
}
