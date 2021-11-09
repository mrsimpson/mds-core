import { ProcessManager } from '@mds-core/mds-service-helpers'
import { DateTime, Duration } from 'luxon'
import { Device, Geography, Nullable, Policy, UUID } from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import { days, filterDefined } from '@mds-core/mds-utils'
import { providers } from '@mds-core/mds-providers'
import { createObjectCsvWriter } from 'csv-writer'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import hash from 'object-hash'
import { processPolicy } from './mds-compliance-engine'

type ComplianceCsvRow = {
  provider_id: UUID
  provider_name: string
  policy_id: UUID
  policy_name: string
  total_violations: number
  timestamp: number
  iso_timestamp: string
}

type MetricsCsvRow = {
  measure: string
  time_bin_duration: string
  time_bin_start: number
  provider_id: UUID
  geography_type: Nullable<string>
  geography_id: Nullable<UUID>
  policy_id: Nullable<UUID>
  vehicle_type: Nullable<string>
  service_type: Nullable<string>
  transaction_type: Nullable<string>
  value: number
  weight: number
  timestamp: number
}

type CsvRows = {
  complianceRows: ComplianceCsvRow[]
  metricsRows: MetricsCsvRow[]
}

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

const metricsCsvWriterFactory = () =>
  createObjectCsvWriter({
    path: `metrics.csv`,
    header: [
      { id: 'measure', title: 'MEASURE' },
      { id: 'time_bin_start', title: 'TIME_BIN_START' },
      { id: 'provider_id', title: 'PROVIDER_ID' },
      { id: 'geography_id', title: 'GEOGRAPHY_ID' },
      { id: 'vehicle_type', title: 'VEHICLE_TYPE' },
      { id: 'timestamp', title: 'TIMESTAMP' },
      { id: 'time_bin_duration', title: 'TIME_BIN_DURATION' },
      { id: 'service_type', title: 'SERVICE_TYPE' },
      { id: 'geography_type', title: 'GEOGRAPHY_TYPE' },
      { id: 'weight', title: 'WEIGHT' },
      { id: 'value', title: 'VALUE' },
      { id: 'transaction_type', title: 'TRANSACTION_TYPE' },
      { id: 'policy_id', title: 'POLICY_ID' }
    ]
  })

const complianceCsvWriter = complianceCsvWriterFactory()
const metricsCsvWriter = metricsCsvWriterFactory()

const complianceRowToMetricsRow = (row: ComplianceCsvRow): MetricsCsvRow => {
  const { INTERVAL } = process.env
  if (!INTERVAL) {
    throw new Error('Invalid interval')
  }
  const { timestamp, provider_id, policy_id, total_violations } = row
  return {
    measure: 'compliance',
    time_bin_duration: INTERVAL,
    time_bin_start: timestamp,
    provider_id,
    geography_type: null,
    geography_id: null,
    policy_id,
    vehicle_type: null,
    service_type: null,
    transaction_type: null,
    value: total_violations,
    weight: 1,
    timestamp
  }
}

const getRawInputs = () => {
  const { START_DATE: startDate, END_DATE: endDate, INTERVAL: interval } = process.env

  const inputs = { startDate, endDate, interval }
  const inputsHashed = hash(inputs)

  if (existsSync(`checkpoint-${inputsHashed}.json`)) {
    const { checkpoint } = JSON.parse(readFileSync(`checkpoint-${inputsHashed}.json`).toString())

    console.log(`Found checkpoint for: ${JSON.stringify(inputs)}, setting startDate to ${checkpoint}`)
    return { startDate: checkpoint, endDate, interval, inputsHashed }
  }

  return { ...inputs, inputsHashed }
}

const writeCsvRows = async ({ complianceRows, metricsRows }: CsvRows) => {
  return Promise.all([
    ...(complianceRows.length > 0 ? [await complianceCsvWriter.writeRecords(complianceRows)] : []),
    ...(metricsRows.length > 0 ? [await metricsCsvWriter.writeRecords(metricsRows)] : [])
  ])
}

const computeHistoricalCompliance = async () => {
  const {
    startDate: startDateUnparsed,
    endDate: endDateUnparsed,
    interval: intervalUnparsed,
    inputsHashed
  } = getRawInputs()

  if (!startDateUnparsed || !endDateUnparsed || !intervalUnparsed) {
    throw new Error('Invalid start date and/or end date')
  }

  const startDate = DateTime.fromISO(startDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const endDate = DateTime.fromISO(endDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const interval = Duration.fromISO(intervalUnparsed).toMillis()

  const geographies: Geography[] = await db.readGeographies({ get_published: true })

  for (let currentDate = startDate; currentDate <= endDate; currentDate += interval) {
    writeFileSync(
      `checkpoint-${inputsHashed}.json`,
      JSON.stringify({
        startDate: startDateUnparsed,
        endDate: endDateUnparsed,
        interval: intervalUnparsed,
        checkpoint: DateTime.fromMillis(currentDate, { zone: 'America/Los_Angeles' }).toISO()
      })
    )

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

ProcessManager({
  start: async () => {
    await computeHistoricalCompliance()
    process.exit(0)
  },
  stop: async () => process.exit(0)
}).monitor()
