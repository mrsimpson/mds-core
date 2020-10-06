import {
  Timestamp,
  UUID,
  VEHICLE_TYPE,
  // Nullable,
  // NonEmptyArray,
  VehicleEvent,
  Enum,
  VEHICLE_STATE,
  STATE_EVENT_MAP,
  DAY_OF_WEEK,
  PolicyMessage,
  VEHICLE_EVENT
} from '@mds-core/mds-types'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'

// import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'

export const RULE_TYPES = Enum('count', 'speed', 'time', 'user')
export type RULE_TYPE = keyof typeof RULE_TYPES

interface BaseRule<RuleType = 'count' | 'speed' | 'time'> {
  name: string
  rule_id: UUID
  geographies: UUID[]
  statuses: Partial<{ [S in VEHICLE_STATE]: (keyof typeof STATE_EVENT_MAP[S])[] | [] }> | null
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
  state: VEHICLE_STATE
  event_types: VEHICLE_EVENT[]
  timestamp: Timestamp
  /* Sometimes a device can match more than one rule, and it's helpful to know all of them,
     for instance, with a count policy.
  */
  rules_matched: UUID[]
  rule_applied: UUID // a device can only ever match one rule for the purpose of computing compliance, however
  speed?: number | null
  speed_unit?: number | null
  speed_measurement_type?: 'instantaneous' | 'average' | null
  gps: {
    lat: number
    lng: number
  }
}

export interface ComplianceResponseDomainModel {
  compliance_response_id: UUID
  compliance_as_of: Timestamp
  provider_id: UUID
  excess_vehicles_count: number
  policy: {
    policy_id: UUID
    name: string
  }
  total_violations: number
  vehicles_found: MatchedVehicleInformation[]
}

export interface ComplianceResponseService {
  //  createComplianceResponses: (blogs: ComplianceResponseDomainModel[]) => ComplianceResponseDomainModel[]
  createComplianceResponse: (blog: ComplianceResponseDomainModel) => ComplianceResponseDomainModel
  //  getComplianceResponses: () => ComplianceResponseDomainModel[]
  getComplianceResponse: (name: string) => ComplianceResponseDomainModel
  // updateComplianceResponse: (blog: ComplianceResponseDomainModel) => ComplianceResponseDomainModel
  // deleteComplianceResponse: (name: string) => ComplianceResponseDomainModel['compliance_response_id']
}

export const ComplianceResponseServiceDefinition: RpcServiceDefinition<ComplianceResponseService> = {
  //  createComplianceResponses: RpcRoute<ComplianceResponseService['createComplianceResponses']>(),
  createComplianceResponse: RpcRoute<ComplianceResponseService['createComplianceResponse']>(),
  // getComplianceResponses: RpcRoute<ComplianceResponseService['getComplianceResponses']>(),
  getComplianceResponse: RpcRoute<ComplianceResponseService['getComplianceResponse']>()
  // updateComplianceResponse: RpcRoute<ComplianceResponseService['updateComplianceResponse']>(),
  // deleteComplianceResponse: RpcRoute<ComplianceResponseService['deleteComplianceResponse']>()
}
