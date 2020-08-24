import { Geography, UUID, Timestamp, Device } from '@mds-core/mds-types'
import cache from '@mds-core/mds-agency-cache'
import db from '@mds-core/mds-db'
import * as compliance_engine from './mds-compliance-engine'

export async function getComplianceInputs(provider_id: string | undefined, timestamp: Timestamp | undefined) {
  const [geographies, deviceRecords] = await Promise.all([
    db.readGeographies() as Promise<Geography[]>,
    db.readDeviceIds(provider_id)
  ])
  const deviceIdSubset = deviceRecords.map((record: { device_id: UUID; provider_id: UUID }) => record.device_id)
  const devices = await cache.readDevices(deviceIdSubset)
  // If a timestamp was supplied, the data we want is probably old enough it's going to be in the db
  const events = timestamp
    ? await db.readHistoricalEvents({ provider_id, end_date: timestamp })
    : await cache.readEvents(deviceIdSubset)

  const deviceMap = devices.reduce((map: { [d: string]: Device }, device) => {
    return device ? Object.assign(map, { [device.device_id]: device }) : map
  }, {})

  const filteredEvents = compliance_engine.getRecentEvents(events)
  return { filteredEvents, geographies, deviceMap }
}
