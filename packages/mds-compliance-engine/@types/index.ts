import { Telemetry, VehicleEvent } from '@mds-core/mds-types'

export type VehicleEventWithTelemetry = VehicleEvent & { telemetry: Telemetry }
