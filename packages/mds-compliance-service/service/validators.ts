import Joi from '@hapi/joi'
import { ValidationError } from '@mds-core/mds-utils'
import { ComplianceResponseDomainModel } from './@types'
import { uuidSchema } from '@mds-core/mds-types'

const complianceResponseSchema = {
  compliance_response_id: uuidSchema
}

export const complianceResponseDomainModelSchema = Joi.object().keys({})

export const ValidateComplianceResponseDomainModel = (
  complianceResponse: ComplianceResponseDomainModel
): ComplianceResponseDomainModel => {
  const { error } = complianceResponseDomainModelSchema.validate(complianceResponse)
  if (error) {
    throw new ValidationError(error.message, complianceResponse)
  }
  return complianceResponse
}
