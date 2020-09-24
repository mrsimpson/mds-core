import logger from '@mds-core/mds-logger'
import {
  ServiceResult,
  ServiceException,
  ServiceProvider,
  ProcessController,
  ServiceResponse
} from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { ComplianceResponseRepository } from '../repository'
import { ComplianceResponseDomainModel, ComplianceResponseService } from '../@types'
import { ValidateComplianceResponseDomainModel } from './validators'
// import { ValidateComplianceResponseDomainModel } from './validators'

export const ComplianceResponseServiceProvider: ServiceProvider<ComplianceResponseService> & ProcessController = {
  start: ComplianceResponseRepository.initialize,
  stop: ComplianceResponseRepository.shutdown,
  createComplianceResponse: async (
    complianceResponse: ComplianceResponseDomainModel
  ): Promise<ServiceResponse<ComplianceResponseDomainModel>> => {
    try {
      return ServiceResult(
        await ComplianceResponseRepository.writeComplianceResponse(
          ValidateComplianceResponseDomainModel(complianceResponse)
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceResponse', error)
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceResponse: async (compliance_response_id: UUID) => {
    try {
      return ServiceResult(await ComplianceResponseRepository.getComplianceResponse({ compliance_response_id }))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting Compliance Response: ${compliance_response_id}`, error)
      logger.error(exception, error)
      return exception
    }
  }
}
