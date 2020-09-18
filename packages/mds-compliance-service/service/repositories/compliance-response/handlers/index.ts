///*
import { ServiceResponse, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import logger from '@mds-core/mds-logger'
import { CreateComplianceResponseModel, ComplianceDomainModel } from '../../@types'
import { ComplianceResponseRepository } from '../repository'

/*
export const createInvoice = async (model: CreateInvoiceDomainModel): Promise<ServiceResponse<InvoiceDomainModel>> => {
  try {
    const [invoice] = await InvoiceRepository.writeInvoices([
      ValidateCreateInvoice({
        ...model
      })
    ])
    return ServiceResult(invoice)
  } catch (error)  {
    const exception = ServiceException('Error Creating Invoices', error)
    logger.error(exception, error)
    return exception
  }
}
*/
