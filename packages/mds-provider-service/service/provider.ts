import type { ProcessController, ServiceProvider } from '@mds-core/mds-service-helpers'
import { ServiceException, ServiceResult } from '@mds-core/mds-service-helpers'
import { isDefined } from '@mds-core/mds-utils'
import type { ProviderDomainModel, ProviderService, ProviderServiceRequestContext } from '../@types'
import { ProviderRepository } from '../repository'
import { FALLBACK_PROVIDERS } from '../repository/fallback_providers'
import { ProviderServiceLogger as logger } from './logger'
import { validateProviderDomainModel } from './validators'

export const ProviderServiceProvider: ServiceProvider<ProviderService, ProviderServiceRequestContext> &
  ProcessController = {
  start: ProviderRepository.initialize,
  stop: ProviderRepository.shutdown,

  createProvider: async (context, mdsProvider) => {
    try {
      mdsProvider.color_code_hex = mdsProvider.color_code_hex ?? '#000'
      if (mdsProvider.provider_types.length === 0) mdsProvider.provider_types = ['mds_micromobility']
      return ServiceResult(await ProviderRepository.createProvider(validateProviderDomainModel(mdsProvider)))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Provider', error)
      logger.error('mds-provider-service::createProvider exception', { exception, error })
      return exception
    }
  },

  createProviders: async (context, mdsProviders) => {
    try {
      return ServiceResult(await ProviderRepository.createProviders(mdsProviders.map(validateProviderDomainModel)))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Providers', error)
      logger.error('mds-provider-service::createProviders exception', { exception, error })
      return exception
    }
  },

  getProvider: async (context, provider_id) => {
    try {
      return ServiceResult(await ProviderRepository.getProvider(provider_id))
    } catch (error) /* istanbul ignore next */ {
      const provider = FALLBACK_PROVIDERS.find(p => p.provider_id === provider_id)
      if (isDefined(provider)) {
        return ServiceResult(provider as ProviderDomainModel)
      }
      const exception = ServiceException(`Error Getting Provider: ${provider_id}`, error)
      logger.error('mds-provider-service::getProvider exception', { exception, error })
      return exception
    }
  },

  getProviders: async (context, options) => {
    try {
      const result = await ProviderRepository.getProviders(options ?? {})
      if (result.length > 0) return ServiceResult(result)
      else return ServiceResult(FALLBACK_PROVIDERS)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Providers', error)
      logger.error('mds-provider-service::getProviders exception', { exception, error })
      // TODO when we move away from mds-providers for good, return to re-throwing the exception
      return ServiceResult(FALLBACK_PROVIDERS)
    }
  },

  updateProvider: async (context, mdsProvider) => {
    try {
      return ServiceResult(await ProviderRepository.updateProvider(mdsProvider))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Updating Provider', error)
      logger.error('mds-provider-service::updateProvider exception', { exception, error })
      return exception
    }
  },

  deleteProvider: async (context, name) => {
    try {
      return ServiceResult(await ProviderRepository.deleteProvider(name))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Deleting Provider: ${name}`, error)
      logger.error('mds-provider-service::deleteProvider exception', { exception, error })
      return exception
    }
  }
}
