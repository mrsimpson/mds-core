import { ServiceClient } from '@mds-core/mds-service-helpers'
import { RpcClient, RpcRequest } from '@mds-core/mds-rpc-common'
import { ComplianceResponseService, ComplianceResponseServiceDefinition } from '../@types'

const ComplianceResponseServiceRpcClient = RpcClient(ComplianceResponseServiceDefinition, {
  host: process.env.BLOG_SERVICE_RPC_HOST,
  port: process.env.MBLOG_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const ComplianceResponseServiceClient: ServiceClient<ComplianceResponseService> = {
  getComplianceResponse: name => RpcRequest(ComplianceResponseServiceRpcClient.getComplianceResponse, [name]),
  //  getComplianceResponses: () => RpcRequest(ComplianceResponseServiceRpcClient.getComplianceResponses, []),
  createComplianceResponse: blog => RpcRequest(ComplianceResponseServiceRpcClient.createComplianceResponse, [blog])
  //  createComplianceResponses: blogs => RpcRequest(ComplianceResponseServiceRpcClient.createComplianceResponses, [blogs]),
  //  deleteComplianceResponse: name => RpcRequest(ComplianceResponseServiceRpcClient.deleteComplianceResponse, [name]),
  //  updateComplianceResponse: blog => RpcRequest(ComplianceResponseServiceRpcClient.updateComplianceResponse, [blog])
}
