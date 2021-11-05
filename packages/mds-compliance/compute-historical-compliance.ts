import { ProcessManager } from '@mds-core/mds-service-helpers'
import { DateTime, Duration } from 'luxon'
import { Device, Geography, Policy, UUID } from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import { processPolicy } from './mds-compliance-engine'

const computeHistoricalCompliance = async () => {
  // get env vars for start_time, end_time, and interval
  // loop over each interval
  //   fetch historical event/telemetry using db.getLatestEventPerVehicle with _current loop_ bounds
  //   compute compliance
  //   log out total violations (for now)

  const { START_DATE: startDateUnparsed, END_DATE: endDateUnparsed, INTERVAL: intervalUnparsed } = process.env

  if (!startDateUnparsed || !endDateUnparsed || !intervalUnparsed) {
    throw new Error('Invalid start date and/or end date')
  }

  const startDate = DateTime.fromISO(startDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const endDate = DateTime.fromISO(endDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const interval = Duration.fromISO(intervalUnparsed).toMillis()

  // for (let currentDate = startDate; currentDate <= endDate; currentDate += interval) {

  // }
}

const computeHistoricalComplianceProvider = async (provider_id: UUID, start: number, end: number) => {
  const events = await db.getLatestEventPerVehicle({
    provider_ids: [provider_id],
    time_range: { start, end },
    grouping_type: 'latest_per_vehicle'
  })

  const deviceIdList = events.map(event => event.device_id)
  const devices = (await db.readDeviceList(deviceIdList)).reduce((acc, device) => {
    acc[device.id] = device
    return acc
  }, {} as { [device_id: UUID]: Device })

  const policies: Policy[] = []
  const geographies: Geography[] = []

  policies.map(policy => processPolicy(policy, events, geographies, devices, end))
}

ProcessManager({
  start: async () => {
    await computeHistoricalCompliance()
    process.exit(0)
  },
  stop: async () => process.exit(0)
}).monitor()
