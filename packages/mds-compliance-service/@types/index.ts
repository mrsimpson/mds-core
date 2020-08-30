import {
  Timestamp,
  UUID,
  VEHICLE_TYPE,
  // Nullable,
  // NonEmptyArray,
  VehicleEvent,
  Device,
  Enum,
  Policy,
  VEHICLE_STATUS,
  STATUS_EVENT_MAP,
  DAY_OF_WEEK,
  PolicyMessage
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

export type MatchedVehiclePlusRule = MatchedVehicle & { rule_id: UUID }

export type VehicleEventWithTelemetry = VehicleEvent & { telemetry: { gps: { lat: number; lng: number } } }
export interface MatchedVehicle {
  device: Device
  event: VehicleEvent
}

export interface CountMatch {
  measured: number
  geography_id: UUID
  matched_vehicles: MatchedVehicle[]
}

export interface TimeMatch {
  measured: number
  geography_id: UUID
  matched_vehicle: MatchedVehicle
}

export interface SpeedMatch {
  measured: number
  geography_id: UUID
  matched_vehicle: MatchedVehicle
}

export interface ReducedMatch {
  measured: number
  geography_id: UUID
}

export interface RuleCompliance {
  rule: Rule
  matches: ReducedMatch[] | CountMatch[] | TimeMatch[] | SpeedMatch[]
}
export interface ComplianceResponse {
  policy: Policy
  rule_compliances: RuleCompliance[]
  total_violations: number
  vehicles_in_violation: MatchedVehiclePlusRule[]
}

export interface ComplianceResponseDomainModel {
  compliance_id: UUID
  provider_id: UUID
  compliance_json: ComplianceResponse // in typeorm this will be a json or jsonb column
  total_violations: number
  recorded: Timestamp
  timestamp: Timestamp
}

export type ComplianceDomainCreateModel = ComplianceResponseDomainModel
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
