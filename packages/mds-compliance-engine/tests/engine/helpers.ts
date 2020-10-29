import { Device, Policy } from '@mds-core/mds-types'
import fs from 'fs'

export function generateDeviceMap(devices: Device[]): { [d: string]: Device } {
  return [...devices].reduce((deviceMapAcc: { [d: string]: Device }, device: Device) => {
    return Object.assign(deviceMapAcc, { [device.device_id]: device })
  }, {})
}

export async function readJson(path: string): Promise<Policy[]> {
  return Promise.resolve(JSON.parse(fs.readFileSync(path).toString()))
}
