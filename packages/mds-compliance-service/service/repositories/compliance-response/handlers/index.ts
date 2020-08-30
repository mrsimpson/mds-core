/*
import { ServiceResponse, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import logger from '@mds-core/mds-logger'
import { CreateInvoiceDomainModel, InvoiceDomainModel } from '../../@types'
import { InvoiceRepository } from '../repository'
import { ValidateCreateInvoice } from './invoice-schema-validators'

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
