import Joi from '@hapi/joi'
import { ValidationError } from '@mds-core/mds-utils'
import { ComplianceResponseDomainModel } from '../@types'

export const complianceResponseDomainModelSchema = Joi.object().keys({
  // todo
})

export const ValidateBlogDomainModel = (
  complianceResponse: ComplianceResponseDomainModel
): ComplianceResponseDomainModel => {
  const { error } = complianceResponseDomainModelSchema.validate(complianceResponse)
  if (error) {
    throw new ValidationError(error.message, complianceResponse)
  }
  return complianceResponse
}
