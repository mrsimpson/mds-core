import {
  Timestamp,
  UUID,
  VEHICLE_TYPE,
  // Nullable,
  // NonEmptyArray,
  VehicleEvent,
  Enum,
  VEHICLE_STATUS,
  STATUS_EVENT_MAP,
  DAY_OF_WEEK,
  PolicyMessage,
  VEHICLE_EVENT
} from '@mds-core/mds-types'
// import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'

export const RULE_TYPES = Enum('count', 'speed', 'time', 'user')
export type RULE_TYPE = keyof typeof RULE_TYPES

interface BaseRule<RuleType = 'count' | 'speed' | 'time'> {
  name: string
  rule_id: UUID
  geographies: UUID[]
  statuses: Partial<{ [S in VEHICLE_STATUS]: (keyof typeof STATUS_EVENT_MAP[S])[] | [] }> | null
  rule_type: RuleType
  vehicle_types?: VEHICLE_TYPE[] | null
  maximum?: number | null
  minimum?: number | null
  start_time?: string | null
  end_time?: string | null
  days?: DAY_OF_WEEK[] | null
  /* eslint-reason TODO: message types haven't been defined well yet */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  messages?: PolicyMessage
  value_url?: URL | null
}

export type CountRule = BaseRule<'count'>

export interface TimeRule extends BaseRule<'time'> {
  rule_units: 'minutes' | 'hours'
}

export interface SpeedRule extends BaseRule<'speed'> {
  rule_units: 'kph' | 'mph'
}

export type UserRule = BaseRule<'user'>

export type Rule = CountRule | TimeRule | SpeedRule | UserRule

export type VehicleEventWithTelemetry = VehicleEvent & { telemetry: { gps: { lat: number; lng: number } } }
export interface MatchedVehicleInformation {
  device_id: UUID
  state: VEHICLE_STATUS
  event_types: VEHICLE_EVENT[]
  timestamp: Timestamp
  /* Sometimes a device can match more than one rule, and it's helpful to know all of them,
     for instance, with a count policy.
  */
  rules_matched: UUID[]
  rule_applied: UUID // a device can only ever match one rule for the purpose of computing compliance, however
  speed?: number | null
  speed_unit?: number | null
  speed_measurement?: number | null
  gps: {
    lat: number
    lng: number
  }
}

export interface ComplianceResponse {
  compliance_response_id: UUID
  compliance_as_of: Timestamp
  excess_vehicles_count: number
  policy: {
    policy_id: UUID
    policy_name: string
  }
  total_violations: number
  vehicles_found: MatchedVehicleInformation[]
}

// export type ComplianceResponseDomainCreateModel = DomainModelCreate<ComplianceResponseDomainModel>
/*


export interface ReadMetricsTimeOptions {
  time_bin_duration: string
  time_bin_start: Timestamp
  time_bin_end?: Timestamp
}

export interface ReadMetricsFilterOptions {
  provider_id: Nullable<UUID>[]
  geography_id: Nullable<UUID>[]
  stop_id: Nullable<UUID>[]
  spot_id: Nullable<UUID>[]
  vehicle_type: Nullable<VEHICLE_TYPE>[]
  service_type: Nullable<SERVICE_TYPE>[]
}

export interface MetricSelector {
  name: string
  aggregate: MetricAggregate
}

export interface ReadMetricsOptions extends ReadMetricsTimeOptions, Partial<ReadMetricsFilterOptions> {
  metrics: NonEmptyArray<MetricSelector>
}

export type AggregateMetricDomainModel<D extends MetricDimension, M extends string> = Pick<
  MetricDomainModel,
  'time_bin_start' | 'time_bin_duration' | D
> &
  { [P in M]: number }

export type AggregateMetricsOptions = ReadMetricsOptions & {
  dimensions?: Array<MetricDimension>
}

export interface MetricsService {
  writeMetrics: (metrics: MetricDomainCreateModel[]) => MetricDomainModel[]
  readMetrics: (options: ReadMetricsOptions) => MetricDomainModel[]
  aggregateMetrics: <D extends MetricDimension, T extends string>(
    options: AggregateMetricsOptions
  ) => AggregateMetricDomainModel<D, T>[]
}

export const MetricsServiceDefinition: RpcServiceDefinition<MetricsService> = {
  readMetrics: RpcRoute<MetricsService['readMetrics']>(),
  writeMetrics: RpcRoute<MetricsService['writeMetrics']>(),
  aggregateMetrics: RpcRoute<MetricsService['aggregateMetrics']>()
}
*/
