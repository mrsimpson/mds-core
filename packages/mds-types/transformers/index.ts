import { convert_v0_4_1_vehicle_event_to_v1_0_0, convert_v0_4_1_device_to_v1_0_0 } from './0_4_1_to_1_0_0'

export const VEHICLE_VERSION_TO_UPCONVERTERS_MAPPING = { '0.4.1': convert_v0_4_1_vehicle_event_to_v1_0_0 }
export const DEVICE_VERSION_TO_UPCONVERTERS_MAPPING = { '0.4.1': convert_v0_4_1_device_to_v1_0_0 }

export * from './0_4_1_to_1_0_0'
export * from './1_0_0_to_0_4_1'
