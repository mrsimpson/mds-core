import { Device_v1_0_0 } from '../../index'
import { Device_v0_4_1 } from '../@types'

/* The partial types are because the transformer may be used in a context where conversion is necessary,
 * but not all fields have been filled yet. E.g. in `mds-agency`, when a vehicle is registered,
 * the provider does not set the vehicle state. Agency sets the state to `removed`.
 * Also, the upconversion might happen before the validation does.
 */
export function convert_v0_4_1_device_to_v1_0_0(device: Partial<Device_v0_4_1>): Partial<Device_v1_0_0> {
  const { provider_id, device_id, vehicle_id, type, propulsion, year, mfgr, model, recorded, status } = device
  return {
    provider_id,
    device_id,
    vehicle_id,
    vehicle_type: type,
    propulsion_types: propulsion,
    year,
    mfgr,
    model,
    recorded,
    state: status
  }
}
