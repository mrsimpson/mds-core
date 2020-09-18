import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'
import { Timestamp, UUID } from '@mds-core/mds-types'
import { ComplianceResponse } from '../../@types'

export interface ComplianceResponseDomainModel {
  compliance_response_id: UUID
  provider_id: UUID
  compliance_json: ComplianceResponse // in typeorm this will be a json or jsonb column
  timestamp: Timestamp
}

export interface ComplianceResponseService {
  createComplianceResponses: (blogs: ComplianceResponseDomainModel[]) => ComplianceResponseDomainModel[]
  createComplianceResponse: (blog: ComplianceResponseDomainModel) => ComplianceResponseDomainModel
  getComplianceResponses: () => ComplianceResponseDomainModel[]
  getComplianceResponse: (name: string) => ComplianceResponseDomainModel
  updateComplianceResponse: (blog: ComplianceResponseDomainModel) => ComplianceResponseDomainModel
  deleteComplianceResponse: (name: string) => ComplianceResponseDomainModel['compliance_response_id']
}

export const ComplianceResponseServiceDefinition: RpcServiceDefinition<ComplianceResponseService> = {
  createComplianceResponses: RpcRoute<ComplianceResponseService['createComplianceResponses']>(),
  createComplianceResponse: RpcRoute<ComplianceResponseService['createComplianceResponse']>(),
  getComplianceResponses: RpcRoute<ComplianceResponseService['getComplianceResponses']>(),
  getComplianceResponse: RpcRoute<ComplianceResponseService['getComplianceResponse']>(),
  updateComplianceResponse: RpcRoute<ComplianceResponseService['updateComplianceResponse']>(),
  deleteComplianceResponse: RpcRoute<ComplianceResponseService['deleteComplianceResponse']>()
}
