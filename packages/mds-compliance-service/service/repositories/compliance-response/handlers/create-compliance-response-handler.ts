import { ServiceResponse, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import logger from '@mds-core/mds-logger'
import { ComplianceResponseDomainModel } from '../../../@types'
import { ValidateComplianceResponseDomainModel } from '../../../validators'
import { ComplianceResponseRepository } from '../repository'

export const CreateComplianceResponseModel = async (
  model: ComplianceResponseDomainModel
): Promise<ServiceResponse<ComplianceResponseDomainModel>> => {
  try {
    const [invoice] = await ComplianceResponseRepository.writeComplianceResponse([
      ValidateComplianceResponseDomainModel({
        ...model
      })
    ])
    return ServiceResult(invoice)
  } catch (error) {
    const exception = ServiceException('Error Creating Invoices', error)
    logger.error(exception, error)
    return exception
  }
}
