import { VehicleEvent, Telemetry, Device, TripMetadata } from '@mds-core/mds-types'
import { getEnvVar } from '@mds-core/mds-utils'
import { AgencyStreamInterface } from '../agency-stream-interface'
import { NatsStreamProducer } from './stream-producer'

const { TENANT_ID } = getEnvVar({
  TENANT_ID: 'mds'
})
const deviceProducer = NatsStreamProducer<Device>(`${TENANT_ID}.device`)
const eventProducer = NatsStreamProducer<VehicleEvent>(`${TENANT_ID}.event`)
const telemetryProducer = NatsStreamProducer<Telemetry>(`${TENANT_ID}.telemetry`)
const tripMetadataProducer = NatsStreamProducer<TripMetadata>(`${TENANT_ID}.trip_metadata`)

export const AgencyStreamNats: AgencyStreamInterface = {
  initialize: async () => {
    await Promise.all([
      deviceProducer.initialize(),
      eventProducer.initialize(),
      telemetryProducer.initialize(),
      tripMetadataProducer.initialize()
    ])
  },
  writeEvent: eventProducer.write,
  writeTelemetry: telemetryProducer.write,
  writeDevice: deviceProducer.write,
  writeTripMetadata: tripMetadataProducer.write,
  shutdown: async () => {
    await Promise.all([
      deviceProducer.shutdown(),
      eventProducer.shutdown(),
      telemetryProducer.shutdown(),
      tripMetadataProducer.shutdown()
    ])
  }
}
