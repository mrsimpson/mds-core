import { DateTime } from 'luxon'
import { Device, Geography, Policy, UUID } from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import { days, filterDefined } from '@mds-core/mds-utils'
import { providers } from '@mds-core/mds-providers'
import { processPolicy } from '../mds-compliance-engine'
import { complianceCsvWriterFactory, complianceRowToMetricsRow, metricsCsvWriterFactory } from './csv-writers'
import { ComplianceCsvRow, CsvRows } from './types'
import { getRawInputs } from './input-handlers'

const complianceCsvWriter = complianceCsvWriterFactory()
const metricsCsvWriter = metricsCsvWriterFactory()

const writeCsvRows = async ({ complianceRows, metricsRows }: CsvRows) => {
  return Promise.all([
    ...(complianceRows.length > 0 ? [await complianceCsvWriter.writeRecords(complianceRows)] : []),
    ...(metricsRows.length > 0 ? [await metricsCsvWriter.writeRecords(metricsRows)] : [])
  ])
}

const computeHistoricalComplianceProvider = async (
  provider_id: UUID,
  provider_name: string,
  start: number,
  end: number,
  geographies: Geography[]
): Promise<CsvRows> => {
  const iso_timestamp = DateTime.fromMillis(end, { zone: 'America/Los_Angeles' }).toISO()

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

  const complianceResults = policies.map(policy =>
    !policy.provider_ids || policy.provider_ids.length === 0 || policy.provider_ids?.includes(provider_id)
      ? processPolicy(policy, events, geographies, devices, end)
      : undefined
  )

  const complianceRows: ComplianceCsvRow[] = complianceResults
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

  const metricsRows = complianceRows.map(complianceRowToMetricsRow)

  return { complianceRows, metricsRows }
}

export const computeHistoricalCompliance = async () => {
  const { startDate, endDate, interval, writeCheckpoint } = getRawInputs()
  const geographies: Geography[] = await db.readGeographies({ get_published: true })

  for (let currentDate = startDate; currentDate <= endDate; currentDate += interval) {
    writeCheckpoint(currentDate)

    // Build a buffer so that we can write all of the results for a given date at once (to make checkpointing easier)
    const buffer: CsvRows = { complianceRows: [], metricsRows: [] }

    for (const { provider_id, provider_name } of Object.values(providers)) {
      // eslint-disable-next-line no-await-in-loop
      const { complianceRows, metricsRows } = await computeHistoricalComplianceProvider(
        provider_id,
        provider_name,
        currentDate - days(2),
        currentDate,
        geographies
      )

      buffer.complianceRows.push(...complianceRows)
      buffer.metricsRows.push(...metricsRows)
    }

    // eslint-disable-next-line no-await-in-loop
    await writeCsvRows(buffer)
  }
}
