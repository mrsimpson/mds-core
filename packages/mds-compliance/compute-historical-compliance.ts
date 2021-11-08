import { ProcessManager } from '@mds-core/mds-service-helpers'
import { DateTime, Duration } from 'luxon'
import { Device, Geography, Policy, UUID } from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import { days, filterDefined } from '@mds-core/mds-utils'
import { providers } from '@mds-core/mds-providers'
import { createObjectCsvWriter } from 'csv-writer'
import { processPolicy } from './mds-compliance-engine'

const complianceCsvWriterFactory = () =>
  createObjectCsvWriter({
    path: `compliance.csv`,
    header: [
      { id: 'provider_id', title: 'PROVIDER_ID' },
      { id: 'provider_name', title: 'PROVIDER_NAME' },
      { id: 'policy_id', title: 'POLICY_ID' },
      { id: 'policy_name', title: 'POLICY_NAME' },
      { id: 'total_violations', title: 'TOTAL_VIOLATIONS' },
      { id: 'timestamp', title: 'TIMESTAMP' },
      { id: 'iso_timestamp', title: 'ISO_TIMESTAMP' }
    ]
  })

const complianceCsvWriter = complianceCsvWriterFactory()

const computeHistoricalCompliance = async () => {
  const { START_DATE: startDateUnparsed, END_DATE: endDateUnparsed, INTERVAL: intervalUnparsed } = process.env

  if (!startDateUnparsed || !endDateUnparsed || !intervalUnparsed) {
    throw new Error('Invalid start date and/or end date')
  }

  const startDate = DateTime.fromISO(startDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const endDate = DateTime.fromISO(endDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const interval = Duration.fromISO(intervalUnparsed).toMillis()

  const geographies: Geography[] = await db.readGeographies({ get_published: true }) // TODO: maybe we can only pull these once?

  for (let currentDate = startDate; currentDate <= endDate; currentDate += interval) {
    for (const { provider_id, provider_name } of Object.values(providers)) {
      // eslint-disable-next-line no-await-in-loop
      await computeHistoricalComplianceProvider(
        provider_id,
        provider_name,
        currentDate - days(2),
        currentDate,
        geographies
      )
    }
  }
}

const computeHistoricalComplianceProvider = async (
  provider_id: UUID,
  provider_name: string,
  start: number,
  end: number,
  geographies: Geography[]
) => {
  const iso_timestamp = DateTime.fromMillis(end).toISO()

  const events = await db.getLatestEventPerVehicle({
    provider_ids: [provider_id],
    time_range: { start, end },
    grouping_type: 'latest_per_vehicle'
  })

  const deviceIdList = events.map(event => event.device_id)
  const devices = (await db.readDeviceList(deviceIdList)).reduce((acc, device) => {
    acc[device.device_id] = device
    return acc
  }, {} as { [device_id: string]: Device })

  const policies: Policy[] = await db.readActivePolicies(end)

  const complianceResults = policies.map(policy => processPolicy(policy, events, geographies, devices, end))

  const thinResults = complianceResults
    .map(res => {
      if (res) {
        const {
          policy: { policy_id, name: policy_name },
          total_violations
        } = res

        return {
          provider_id,
          provider_name,
          policy_id,
          policy_name,
          total_violations,
          timestamp: end,
          iso_timestamp
        }
      }
    })
    .filter(filterDefined())

  await complianceCsvWriter.writeRecords(thinResults)
}

ProcessManager({
  start: async () => {
    await computeHistoricalCompliance()
    process.exit(0)
  },
  stop: async () => process.exit(0)
}).monitor()
