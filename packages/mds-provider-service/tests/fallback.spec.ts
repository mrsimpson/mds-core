import { uuid } from '@mds-core/mds-utils'
import { ProviderServiceClient } from '../client'
import { ProviderRepository } from '../repository'
import { FALLBACK_PROVIDERS, JUMP_PROVIDER_ID } from '../repository/fallback_providers'
import { ProviderServiceManager } from '../service/manager'

const ProviderServer = ProviderServiceManager.controller()

describe('Provider Service Fallback Tests', () => {
  beforeAll(async () => {
    await ProviderServer.start()
  })

  it('Uses fallback providers for .getProvider', async () => {
    jest.spyOn(ProviderRepository, 'getProvider').mockImplementation(
      jest.fn(() => {
        throw new Error()
      })
    )
    const provider = await ProviderServiceClient.getProvider(JUMP_PROVIDER_ID)
    expect(provider?.provider_name).toEqual('JUMP')
  })

  it('Uses fallback providers for .getProviders', async () => {
    jest.spyOn(ProviderRepository, 'getProviders').mockImplementation(
      jest.fn(() => {
        throw new Error()
      })
    )
    const results = await ProviderServiceClient.getProviders()
    expect(results.length).toEqual(FALLBACK_PROVIDERS.length)
  })

  it('Errors out if a provider_id is not in the DB and not in the fallback list', async () => {
    await expect(ProviderServiceClient.getProvider(uuid())).rejects.toMatchObject({ type: 'ServiceException' })
  })

  it('Errors out if a provider_id is not in the DB and not in the fallback list', async () => {
    const result = await ProviderServiceClient.getProviders()
    expect(result).toMatchObject(FALLBACK_PROVIDERS)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await ProviderServer.stop()
  })
})
