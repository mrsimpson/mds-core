import type { InsertReturning } from '@mds-core/mds-repository'
import { ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import type { UUID } from '@mds-core/mds-types'
import { NotFoundError } from '@mds-core/mds-utils'
import type { ProviderDomainModel } from '../@types'
import type { ProviderEntityModel } from './entities/provider-entity'
import { ProviderEntity } from './entities/provider-entity'
import { ProviderDomainToEntityCreate, ProviderEntityToDomain } from './mappers'
import migrations from './migrations'

export const ProviderRepository = ReadWriteRepository.Create(
  'Providers',
  { entities: [ProviderEntity], migrations },
  repository => {
    const getProvider = async (provider_id: UUID): Promise<ProviderDomainModel> => {
      try {
        const connection = await repository.connect('ro')
        const entity = await connection.getRepository(ProviderEntity).findOne({
          where: {
            provider_id
          }
        })
        if (!entity) {
          throw new NotFoundError(`Provider ${provider_id} not found`)
        }
        return ProviderEntityToDomain.map(entity)
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    const updateProvider = async (update: ProviderDomainModel): Promise<ProviderDomainModel> => {
      try {
        const connection = await repository.connect('rw')
        const { provider_id } = update
        const result = await connection.getRepository(ProviderEntity).findOne({ where: { provider_id } })
        if (!result) {
          throw new NotFoundError(`Provider ${provider_id} not found`)
        }
        const {
          raw: [updated]
        } = await connection
          .getRepository(ProviderEntity)
          .createQueryBuilder()
          .update()
          .set(update)
          .where('provider_id = :provider_id', { provider_id })
          .returning('*')
          .execute()
        return ProviderEntityToDomain.map(updated)
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    const getProviders = async (): Promise<ProviderDomainModel[]> => {
      try {
        const connection = await repository.connect('ro')
        const entities = await connection.getRepository(ProviderEntity).find()
        return entities.map(ProviderEntityToDomain.mapper())
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    const createProvider = async (mdsProvider: ProviderDomainModel): Promise<ProviderDomainModel> => {
      try {
        const connection = await repository.connect('rw')
        const {
          raw: [entity]
        }: InsertReturning<ProviderEntity> = await connection
          .getRepository(ProviderEntity)
          .createQueryBuilder()
          .insert()
          .values([ProviderDomainToEntityCreate.map(mdsProvider)])
          .returning('*')
          .execute()

        if (!entity) {
          throw new Error('Failed to write provider')
        }

        return ProviderEntityToDomain.map(entity)
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    const createProviders = async (mdsProviders: ProviderDomainModel[]): Promise<ProviderDomainModel[]> => {
      try {
        const connection = await repository.connect('rw')
        const { raw: entities }: InsertReturning<ProviderEntity> = await connection
          .getRepository(ProviderEntity)
          .createQueryBuilder()
          .insert()
          .values(mdsProviders.map(ProviderDomainToEntityCreate.mapper()))
          .returning('*')
          .execute()
        return entities.map(ProviderEntityToDomain.map)
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    const deleteProvider = async (
      provider_id: ProviderEntityModel['provider_id']
    ): Promise<ProviderEntityModel['provider_id']> => {
      // Try to read mdsProvider first, if not 404
      await getProvider(provider_id)
      try {
        const connection = await repository.connect('rw')
        await connection
          .getRepository(ProviderEntity)
          .createQueryBuilder()
          .delete()
          .where('provider_id = :provider_id', { provider_id })
          .returning('*')
          .execute()
        return provider_id
      } catch (error) {
        throw RepositoryError(error)
      }
    }
    return {
      getProvider,
      updateProvider,
      getProviders,
      createProvider,
      createProviders,
      deleteProvider
    }
  }
)
