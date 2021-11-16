import { createObjectCsvWriter } from 'csv-writer'
import { ComplianceCsvRow, MetricsCsvRow } from './types'

export const complianceCsvWriterFactory = () =>
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

export const metricsCsvWriterFactory = () =>
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

export const complianceRowToMetricsRow = (row: ComplianceCsvRow): MetricsCsvRow => {
  const { INTERVAL } = process.env
  if (!INTERVAL) {
    throw new Error('Invalid interval')
  }
  const { timestamp, provider_id, policy_id, total_violations } = row
  return {
    measure: 'compliance.aggregate.avg',
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
