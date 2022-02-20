/**
 * Copyright 2019 City of Los Angeles
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

/* eslint-reason extends object.prototype */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-enable prettier/prettier */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { IngestServiceClient, IngestServiceManager } from '@mds-core/mds-ingest-service'
import { JUMP_PROVIDER_ID, JUMP_TEST_DEVICE_1, makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { Device, Recorded, Telemetry, VehicleEvent } from '@mds-core/mds-types'
import { now, rangeRandomInt, uuid } from '@mds-core/mds-utils'
import MDSDBPostgres from '../index'
import { initializeDB, pg_info, shutdownDB } from './helpers'

const startTime = now() - 200
const shapeUUID = 'e3ed0a0e-61d3-4887-8b6a-4af4f3769c14'

/* You'll need postgres running and the env variable PG_NAME
 * to be set to run these tests.
 */
/* istanbul ignore next */

async function seedDB() {
  await MDSDBPostgres.reinitialize()
  const devices: Device[] = makeDevices(9, startTime, JUMP_PROVIDER_ID) as Device[]
  devices.push(JUMP_TEST_DEVICE_1 as Device)
  const decommissionEvents: VehicleEvent[] = makeEventsWithTelemetry(devices.slice(0, 9), startTime + 10, shapeUUID, {
    event_types: ['decommissioned'],
    vehicle_state: 'removed',
    speed: rangeRandomInt(0, 10)
  })
  const tripEndEvent: VehicleEvent[] = makeEventsWithTelemetry(devices.slice(9, 10), startTime + 10, shapeUUID, {
    event_types: ['trip_end'],
    vehicle_state: 'available',
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

/**
 * @param reinit wipe the data first
 */
async function seedTripEvents(reinit = true) {
  reinit ? await MDSDBPostgres.reinitialize() : null

  const devices: Device[] = makeDevices(9, startTime, JUMP_PROVIDER_ID) as Device[]
  const trip_id = uuid()
  const tripStartEvents: VehicleEvent[] = makeEventsWithTelemetry(devices.slice(0, 9), startTime + 10, shapeUUID, {
    event_types: ['trip_start'],
    vehicle_state: 'on_trip',
    speed: rangeRandomInt(10),
    trip_id
  })
  const tripEndEvents: VehicleEvent[] = makeEventsWithTelemetry(devices.slice(9, 10), startTime + 10, shapeUUID, {
    event_types: ['trip_end'],
    vehicle_state: 'available',
    speed: rangeRandomInt(10),
    trip_id
  })
  const telemetry: Telemetry[] = []
  const events: VehicleEvent[] = tripStartEvents.concat(tripEndEvents)
  events.map(event => {
    if (event.telemetry) {
      telemetry.push(event.telemetry)
    }
  })

  await MDSDBPostgres.seed({ devices, events, telemetry })
}

const IngestServer = IngestServiceManager.controller()

if (pg_info.database) {
  describe('Test mds-db-postgres', () => {
    describe('test reads and writes', () => {
      beforeEach(async () => {
        await initializeDB()
        await IngestServer.start()
      })

      afterEach(async () => {
        await shutdownDB()
        await IngestServer.stop()
      })

      it('can make successful writes', async () => {
        await MDSDBPostgres.reinitialize()
        await MDSDBPostgres.writeDevice(JUMP_TEST_DEVICE_1)
        const device: Device = (await IngestServiceClient.getDevice({
          device_id: JUMP_TEST_DEVICE_1.device_id,
          provider_id: JUMP_PROVIDER_ID
        })) as Device
        expect(device.device_id).toEqual(JUMP_TEST_DEVICE_1.device_id)
      })

      it('can make a successful read query after shutting down a DB client', async () => {
        await shutdownDB()
        await MDSDBPostgres.writeDevice(JUMP_TEST_DEVICE_1)
        await shutdownDB()
        const device = await IngestServiceClient.getDevice({
          device_id: JUMP_TEST_DEVICE_1.device_id,
          provider_id: JUMP_PROVIDER_ID
        })
        expect(device?.device_id).toEqual(JUMP_TEST_DEVICE_1.device_id)
      })

      it('can read and write Devices, VehicleEvents, and Telemetry', async () => {
        await seedDB()

        const devicesResult: Device[] = (await MDSDBPostgres.readDeviceIds(JUMP_PROVIDER_ID, 0, 20)) as Device[]
        expect(devicesResult).toHaveLength(10)
        const vehicleEventsResult = await MDSDBPostgres.readEvents({
          start_time: String(startTime)
        })
        expect(vehicleEventsResult.count).toEqual(10)

        const telemetryResults: Recorded<Telemetry>[] = await MDSDBPostgres.readTelemetry(
          devicesResult[0].device_id,
          startTime,
          now()
        )

        expect(telemetryResults.length).toBeGreaterThan(0)
      })

      it('can read VehicleEvents and Telemetry as collections of trips', async () => {
        await seedTripEvents()
        await seedTripEvents(false)

        const devicesResult: Device[] = (await MDSDBPostgres.readDeviceIds(JUMP_PROVIDER_ID, 0, 18)) as Device[]
        expect(devicesResult).toHaveLength(18)

        const vehicleEventsResult = await MDSDBPostgres.readEvents({
          start_time: String(startTime)
        })
        const trip_ids = vehicleEventsResult.events.reduce((acc, event) => acc.add(event.trip_id), new Set())

        const tripEventsResult = await MDSDBPostgres.readTripEvents({
          start_time: String(startTime)
        })
        expect(tripEventsResult.tripCount).toEqual(trip_ids.size)

        // there should be X trips
        expect(Object.keys(tripEventsResult.trips)).toHaveLength(trip_ids.size)

        // telemetry on each event should not be undefined
        Object.values(tripEventsResult.trips).forEach(trip => {
          trip.forEach(event => {
            expect(event.telemetry).not.toBeUndefined()
          })
        })
      })

      it('can wipe a device', async () => {
        await seedDB()
        const result = await MDSDBPostgres.wipeDevice(JUMP_PROVIDER_ID)
        expect(result).not.toBeUndefined()
      })
    })

    describe('unit test read only functions', () => {
      beforeEach(initializeDB)

      afterEach(shutdownDB)

      it('.health', async () => {
        const result = await MDSDBPostgres.health()
        expect(result.using).toEqual('postgres')
        expect(result.stats.current_running_queries).not.toBeNull()
        expect(result.stats.current_running_queries).not.toBeUndefined()
      })
    })
  })
}
