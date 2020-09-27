import * as Joi from 'joi'
import { ValidationError } from '@mds-core/mds-utils'
import {
  uuidSchema,
  timestampSchema,
  numberSchema,
  stringSchema,
  vehicleEventTypeSchema,
  vehicleStatusSchema
} from '@mds-core/mds-schema-validators'
import { ComplianceResponseDomainModel } from '../@types'

/* const complianceResponseSchema = {
  compliance_response_id: uuidSchema

}
export interface MatchedVehicleInformation {
  device_id: UUID
  state: VEHICLE_STATUS
  event_types: VEHICLE_EVENT[]
  timestamp: Timestamp
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

*/

const gpsSchema = Joi.object().keys({
  lat: numberSchema.min(-90).max(90).required(),
  lng: numberSchema.min(-180).max(180).required()
})

export const matchedVehicleInformationSchema = Joi.object().keys({
  device_id: uuidSchema.required(),
  state: vehicleStatusSchema.required(),
  event_types: Joi.array().items(vehicleEventTypeSchema).required(),
  timestamp: timestampSchema.required(),
  rules_matched: Joi.array().items(uuidSchema).required(),
  rule_applied: uuidSchema,
  speed: numberSchema.allow(null).optional(),
  speed_unit: numberSchema.allow(null).optional(),
  speed_measurement_type: stringSchema.valid('instantaneous', 'average').allow(null).optional(),
  gps: gpsSchema.required()
})

export const complianceResponsePolicyInfoSchema = Joi.object().keys({
  policy_id: uuidSchema.required(),
  name: stringSchema.required()
})

export const complianceResponseDomainModelSchema = Joi.object().keys({
  compliance_response_id: uuidSchema,
  compliance_as_of: timestampSchema,
  excess_vehicles_count: numberSchema,
  policy: complianceResponsePolicyInfoSchema,
  total_violations: numberSchema,
  vehicles_found: Joi.array().items(matchedVehicleInformationSchema).required()
})

export const ValidateComplianceResponseDomainModel = (
  complianceResponse: ComplianceResponseDomainModel
): ComplianceResponseDomainModel => {
  const { error } = complianceResponseDomainModelSchema.validate(complianceResponse)
  if (error) {
    throw new ValidationError(error.message, complianceResponse)
  }
  return complianceResponse
}
