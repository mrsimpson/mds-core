import { createConnection, ConnectionOptions } from 'typeorm'
import { ComplianceResponseRepository } from '../repository'
import { ComplianceResponseServiceManager } from '../service/manager'
import { COMPLIANCE_RESPONSE_1, COMPLIANCE_RESPONSE_ID } from './compliance_response_fixtures'

const ComplianceResponseServer = ComplianceResponseServiceManager.controller()

describe('ComplianceResponses Service Tests', () => {
  beforeAll(async () => {
    await ComplianceResponseServer.start()
  })

  it('Post ComplianceResponse', async () => {
    const blog = await ComplianceResponseServiceClient.createComplianceResponse({
      name: 'Test ComplianceResponse',
      text: 'This is a test'
    })
    expect(blog.name).toEqual('Test ComplianceResponse')
  })

  it('Get All ComplianceResponses', async () => {
    const blogs = await ComplianceResponseServiceClient.getComplianceResponses()
    expect(blogs.length).toEqual(1)
    const [blog] = blogs
    expect(blog.name).toEqual('Test ComplianceResponse')
  })

  it('Get One ComplianceResponse', async () => {
    const blog = await ComplianceResponseServiceClient.getComplianceResponse('Test ComplianceResponse')
    expect(blog.name).toEqual('Test ComplianceResponse')
  })

  afterAll(async () => {
    await ComplianceResponseServer.stop()
  })
})
