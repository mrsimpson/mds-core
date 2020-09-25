import { RpcServer } from '@mds-core/mds-rpc-common'
import { ComplianceResponseServiceProvider } from './provider'
import { ComplianceResponseServiceDefinition } from '../@types'

export const ComplianceResponseServiceManager = RpcServer(
  ComplianceResponseServiceDefinition,
  {
    onStart: ComplianceResponseServiceProvider.start,
    onStop: ComplianceResponseServiceProvider.stop
  },
  {
    createComplianceResponse: async ([compliance_response]) =>
      ComplianceResponseServiceProvider.createComplianceResponse(compliance_response),
    //    createComplianceResponses: async ([blogs]) => ComplianceResponseServiceProvider.createBlogs(blogs),
    getComplianceResponse: async ([compliance_response_id]) =>
      ComplianceResponseServiceProvider.getComplianceResponse(compliance_response_id)
    //    getComplianceResponses: async () => ComplianceResponseServiceProvider.getBlogs(),
    //    updateComplianceResponse: async ([payload]) => ComplianceResponseServiceProvider.updateBlog(payload),
    //    deleteComplianceResponse: async ([name]) => ComplianceResponseServiceProvider.deleteBlog(name)
  },
  { port: process.env.BLOG_SERVICE_RPC_PORT }
)
