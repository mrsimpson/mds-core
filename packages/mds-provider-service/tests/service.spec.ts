import { uuid } from '@mds-core/mds-utils'
import type { ProviderDomainCreateModel } from '../@types'
import { ProviderServiceClient } from '../client'
import { ProviderRepository } from '../repository'
import { ProviderServiceManager } from '../service/manager'

const TEST_PROVIDER_ID = uuid()
const TEST_PROVIDER_2_ID = uuid()

function generateProvider(overrides = {}): ProviderDomainCreateModel {
  return {
    color_code_hex: '#000',
    provider_name: 'imatest',
    provider_id: uuid(),
    provider_types: ['mds_micromobility'],
    ...overrides
  }
}

describe('Provider Repository Tests', () => {
  beforeAll(async () => {
    await ProviderRepository.initialize()
  })

  it('Run Migrations', async () => {
    await ProviderRepository.runAllMigrations()
  })

  it('Revert Migrations', async () => {
    await ProviderRepository.revertAllMigrations()
  })

  afterAll(async () => {
    await ProviderRepository.shutdown()
  })
})

const ProviderServer = ProviderServiceManager.controller()

describe('Provider Service Tests', () => {
  beforeAll(async () => {
    await ProviderServer.start()
  })

  afterEach(async () => {
    await ProviderRepository.truncateAllTables()
  })

  afterAll(async () => {
    await ProviderServer.stop()
  })

  it('Post Provider', async () => {
    const provider = await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_ID }))
    expect(provider.provider_name).toEqual('imatest')
  })

  it('Get All Providers', async () => {
    await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_ID }))
    await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_2_ID }))
    const providers = await ProviderServiceClient.getProviders({})
    expect(providers.length).toEqual(2)
  })

  it('Gets Providers By Type', async () => {
    await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_ID }))
    await ProviderServiceClient.createProvider(
      generateProvider({ provider_id: TEST_PROVIDER_2_ID, provider_types: ['gbfs_micromobility'] })
    )
    const providers = await ProviderServiceClient.getProviders({ provider_types: ['mds_micromobility'] })
    expect(providers.length).toEqual(1)
  })

  it('Get One Provider', async () => {
    await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_ID }))
    const provider = await ProviderServiceClient.getProvider(TEST_PROVIDER_ID)
    expect(provider.provider_name).toEqual('imatest')
  })

  it('Updates One Provider', async () => {
    await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_ID }))
    const provider = await ProviderServiceClient.getProvider(TEST_PROVIDER_ID)
    expect(provider.color_code_hex).toEqual('#000')
    await ProviderServiceClient.updateProvider({
      ...provider,
      color_code_hex: '#111',
      provider_types: ['gbfs_micromobility']
    })
    const updatedProvider = await ProviderServiceClient.getProvider(TEST_PROVIDER_ID)
    expect(updatedProvider.color_code_hex).toEqual('#111')
    expect(updatedProvider.provider_types).toEqual(['gbfs_micromobility'])
  })

  it('Deletes One Provider', async () => {
    await ProviderServiceClient.createProvider(generateProvider({ provider_id: TEST_PROVIDER_ID }))
    const result = await ProviderServiceClient.deleteProvider(TEST_PROVIDER_ID)
    expect(result).toEqual(TEST_PROVIDER_ID)
    await expect(ProviderServiceClient.getProvider(TEST_PROVIDER_ID)).rejects.toMatchObject({
      type: 'NotFoundError'
    })
  })

  afterAll(async () => {
    await ProviderServer.stop()
  })
})
