import { Nullable, UUID } from '@mds-core/mds-types'

export type ComplianceCsvRow = {
  provider_id: UUID
  provider_name: string
  policy_id: UUID
  policy_name: string
  total_violations: number
  timestamp: number
  iso_timestamp: string
}

export type MetricsCsvRow = {
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

export type CsvRows = {
  complianceRows: ComplianceCsvRow[]
  metricsRows: MetricsCsvRow[]
}
