/**
 * Copyright 2020 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { InsertReturning } from '@mds-core/mds-repository'
import { ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import type { UUID } from '@mds-core/mds-types'
import { isDefined, zip } from '@mds-core/mds-utils'
import { Any } from 'typeorm'
import { buildPaginator } from 'typeorm-cursor-pagination'
import type {
  DeviceDomainCreateModel,
  DeviceDomainModel,
  EventAnnotationDomainCreateModel,
  EventAnnotationDomainModel,
  EventDomainCreateModel,
  EventDomainModel,
  GetDeviceOptions,
  GetDevicesOptions,
  GetDevicesResponse,
  GetEventsWithDeviceAndTelemetryInfoOptions,
  GetEventsWithDeviceAndTelemetryInfoResponse,
  GetH3BinOptions,
  GetPartialVehicleEventsResponse,
  GetVehicleEventsFilterParams,
  H3Bin,
  NoColumns,
  ReadDeviceEventsQueryParams,
  ReadTripEventsQueryParams,
  TelemetryAnnotationDomainCreateModel,
  TelemetryDomainCreateModel,
  TelemetryDomainModel,
  WithColumns,
  WithCursorOptions
} from '../@types'
import entities from './entities'
import { DeviceEntity } from './entities/device-entity'
import { EventAnnotationEntity } from './entities/event-annotation-entity'
import { EventEntity } from './entities/event-entity'
import { TelemetryAnnotationEntity } from './entities/telemetry-annotation-entity'
import { TelemetryEntity } from './entities/telemetry-entity'
import {
  DeviceDomainToEntityCreate,
  DeviceEntityToDomain,
  EventAnnotationDomainToEntityCreate,
  EventAnnotationEntityToDomain,
  EventDomainToEntityCreate,
  EventEntityToDomain,
  TelemetryDomainToEntityCreate,
  TelemetryEntityToDomain
} from './mappers'
import {
  TelemetryAnnotationDomainToEntityCreate,
  TelemetryAnnotationEntityToDomain
} from './mappers/telemetry-annotation-mappers'
import migrations from './migrations'
import { getEvents, getEventsWithDeviceAndTelemetryInfo, getPartialEvents } from './queries/events'
import { buildCursor, parseCursor } from './queries/helpers'
import views from './views'

export const IngestRepository = ReadWriteRepository.Create(
  'ingest',
  { entities: [...entities, ...views], migrations },
  repository => {
    const createTelemetriesEntityReturning = async (telemetries: TelemetryDomainCreateModel[]) => {
      try {
        const connection = await repository.connect('rw')
        const { raw: entities }: InsertReturning<TelemetryEntity> = await connection
          .getRepository(TelemetryEntity)
          .createQueryBuilder()
          .insert()
          .values(telemetries.map(TelemetryDomainToEntityCreate.mapper()))
          .returning('*')
          .execute()
        return entities
      } catch (error) {
        throw RepositoryError(error)
      }
    }
    const getDevicesQuery = async ({
      limit = 100,
      provider_id,
      beforeCursor,
      afterCursor
    }: WithCursorOptions<GetDevicesOptions>): Promise<GetDevicesResponse> => {
      try {
        const connection = await repository.connect('ro')
        const query = connection.createQueryBuilder(DeviceEntity, 'device')
        if (isDefined(provider_id)) {
          query.where('device.provider_id = :provider_id', { provider_id })
        }

        const pager = buildPaginator({
          entity: DeviceEntity,
          alias: 'device',
          paginationKeys: ['recorded', 'id'],
          query: {
            limit,
            beforeCursor: beforeCursor ?? undefined,
            afterCursor: afterCursor ?? undefined
          }
        })

        const {
          data,
          cursor: { beforeCursor: nextBeforeCursor, afterCursor: nextAfterCursor }
        } = await pager.paginate(query)

        const cursor = { limit }

        return {
          devices: data.map(DeviceEntityToDomain.mapper()),
          cursor: {
            prev:
              nextBeforeCursor &&
              buildCursor<GetDevicesOptions>({ ...cursor, beforeCursor: nextBeforeCursor, afterCursor: null }),
            next:
              nextAfterCursor &&
              buildCursor<GetDevicesOptions>({ ...cursor, beforeCursor: null, afterCursor: nextAfterCursor })
          }
        }
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    return {
      createEvents: async (events: EventDomainCreateModel[]): Promise<EventDomainModel[]> => {
        try {
          const telemetryEntities = await createTelemetriesEntityReturning(events.map(({ telemetry }) => telemetry))

          const connection = await repository.connect('rw')
          const { raw: eventEntities }: InsertReturning<EventEntity> = await connection
            .getRepository(EventEntity)
            .createQueryBuilder()
            .insert()
            .values(events.map(EventDomainToEntityCreate.mapper()))
            .returning('*')
            .execute()

          return zip(eventEntities, telemetryEntities, (event, telemetry) =>
            EventEntityToDomain.map({
              ...event,
              telemetry
            })
          )
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      createTelemetries: async (telemetries: TelemetryDomainCreateModel[]) => {
        try {
          const entities = await createTelemetriesEntityReturning(telemetries)
          return entities.map(TelemetryEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      createTelemetryAnnotations: async (telemetryAnnotations: TelemetryAnnotationDomainCreateModel[]) => {
        try {
          const connection = await repository.connect('rw')
          const { raw: entities }: InsertReturning<TelemetryAnnotationEntity> = await connection
            .getRepository(TelemetryAnnotationEntity)
            .createQueryBuilder()
            .insert()
            .values(telemetryAnnotations.map(TelemetryAnnotationDomainToEntityCreate.mapper()))
            .returning('*')
            .execute()

          return entities.map(TelemetryAnnotationEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getH3Bins: async (params: GetH3BinOptions) => {
        try {
          const { start, end, h3_resolution, k } = params

          const connection = await repository.connect('ro')
          const entities = await connection
            .createQueryBuilder()
            .select(['provider_id'])
            .addSelect(h3_resolution, 'h3_identifier')
            .addSelect(`COUNT(${h3_resolution})`, 'count')
            .from('telemetry_annotations', 'annotation')
            .where('timestamp >= :start', { start })
            .andWhere('timestamp <= :end', { end })
            .groupBy(`provider_id, ${h3_resolution}`)
            .having(`COUNT(${h3_resolution}) >= :k`, { k })
            .execute()

          return entities as H3Bin[]
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      createDevices: async (events: DeviceDomainCreateModel[]) => {
        try {
          const connection = await repository.connect('rw')
          const { raw: entities }: InsertReturning<DeviceEntity> = await connection
            .getRepository(DeviceEntity)
            .createQueryBuilder()
            .insert()
            .values(events.map(DeviceDomainToEntityCreate.mapper()))
            .returning('*')
            .execute()
          return entities.map(DeviceEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      createEventAnnotations: async (
        eventAnnotations: EventAnnotationDomainCreateModel[]
      ): Promise<EventAnnotationDomainModel[]> => {
        try {
          const connection = await repository.connect('rw')
          const { raw: entities }: InsertReturning<EventAnnotationEntity> = await connection
            .getRepository(EventAnnotationEntity)
            .createQueryBuilder()
            .insert()
            .values(eventAnnotations.map(EventAnnotationDomainToEntityCreate.mapper()))
            .returning('*')
            .execute()
          return entities.map(EventAnnotationEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getDevices: async (device_ids: UUID[]): Promise<DeviceDomainModel[]> => {
        try {
          const connection = await repository.connect('ro')
          const entities = await connection
            .getRepository(DeviceEntity)
            .find(device_ids ? { where: { device_id: Any(device_ids) } } : {})
          return entities.map(DeviceEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getDevice: async (options: GetDeviceOptions): Promise<DeviceDomainModel | undefined> => {
        try {
          const { device_id, provider_id } = options
          const connection = await repository.connect('ro')
          const query = connection
            .getRepository(DeviceEntity)
            .createQueryBuilder('devices')
            .where('"device_id" = :device_id', { device_id })

          if (provider_id) {
            query.andWhere('"provider_id" = :provider_id', { provider_id })
          }

          const entity = await query.getOne()
          if (isDefined(entity)) {
            return DeviceEntityToDomain.map(entity)
          }
          return entity ?? undefined
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getDevicesUsingOptions: async (options: GetDevicesOptions): Promise<GetDevicesResponse> =>
        getDevicesQuery({ ...options, beforeCursor: null, afterCursor: null }),

      getDevicesUsingCursor: async (cursor: string): Promise<GetDevicesResponse> =>
        getDevicesQuery(parseCursor<GetDevicesOptions>(cursor)),

      getEventsUsingOptions: async (options: NoColumns<GetVehicleEventsFilterParams>) =>
        getEvents(repository, {
          ...options,
          beforeCursor: null,
          afterCursor: null,
          limit: options.limit ?? 100
        }),

      getPartialEventsUsingOptions: async (options: WithColumns<GetVehicleEventsFilterParams>) =>
        getPartialEvents(repository, {
          ...options,
          beforeCursor: null,
          afterCursor: null,
          limit: options.limit ?? 100
        }),

      getEventsUsingCursor: async (cursor: string) =>
        getEvents(repository, parseCursor<NoColumns<GetVehicleEventsFilterParams>>(cursor)),

      getPartialEventsUsingCursor: async (cursor: string): Promise<GetPartialVehicleEventsResponse> =>
        getPartialEvents(repository, parseCursor<WithColumns<GetVehicleEventsFilterParams>>(cursor)),

      getTripEvents: async (params: ReadTripEventsQueryParams) => {
        const { skip, take = 100, start_time, end_time, provider_id } = params
        try {
          const connection = await repository.connect('rw')
          const tripIdQuery = connection
            .getRepository(EventEntity)
            .createQueryBuilder()
            .select('distinct trip_id')
            .limit(take)

          if (start_time) tripIdQuery.where('timestamp >= :start_time', { start_time })
          if (end_time) tripIdQuery.andWhere('timestamp <= :end_time', { end_time })
          if (provider_id) tripIdQuery.andWhere('provider_id = :provider_id', { provider_id })
          if (skip) tripIdQuery.andWhere('trip_id > :skip', { skip })

          const bigQuery = connection
            .createQueryBuilder()
            .select('et.trip_id, array_agg(row_to_json(et.*) ORDER BY et.timestamp) AS events')
            .from(
              qb =>
                qb
                  .select('e.*, to_json(t.*) AS telemetry')
                  .from('events', 'e')
                  .innerJoin(
                    'telemetry',
                    't',
                    `e.device_id = t.device_id AND e.telemetry_timestamp = t.timestamp AND e.trip_id IN (${tripIdQuery.getQuery()})`
                  ),
              'et'
            )
            .setParameters(tripIdQuery.getParameters())
            .groupBy('et.trip_id')
            .orderBy('et.trip_id')

          const entities: { trip_id: UUID; events: EventEntity[] }[] = await bigQuery.execute()

          return entities.reduce<Record<UUID, EventDomainModel[]>>((acc, { trip_id, events }) => {
            const mappedEvents = events.map(EventEntityToDomain.map)
            return Object.assign(acc, { [trip_id]: mappedEvents })
          }, {})
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getDeviceEvents: async (params: ReadDeviceEventsQueryParams) => {
        const { skip, take = 100, start_time, end_time, provider_id } = params
        try {
          const connection = await repository.connect('rw')

          const bigQuery = connection
            .createQueryBuilder()
            .select('et.device_id, array_agg(row_to_json(et.*) ORDER BY et.timestamp) AS events')
            .from(qb => {
              /**
               * JOIN events and telemetry
               */
              qb.select('e.*, to_json(t.*) AS telemetry')
                .from('events', 'e')
                .innerJoin('telemetry', 't', `e.device_id = t.device_id AND e.telemetry_timestamp = t.timestamp`)

              /**
               * Add query filters
               */
              if (start_time) qb.where('e.timestamp >= :start_time', { start_time })
              if (end_time) qb.andWhere('e.timestamp <= :end_time', { end_time })
              if (provider_id) qb.andWhere('e.provider_id = :provider_id', { provider_id })
              if (skip) qb.andWhere('e.device_id > :skip', { skip })

              return qb
            }, 'et')
            .groupBy('et.device_id')
            .orderBy('et.device_id')
            .limit(take)

          const entities: { device_id: UUID; events: EventEntity[] }[] = await bigQuery.execute()

          return entities.reduce<Record<UUID, EventDomainModel[]>>((acc, { device_id, events }) => {
            const mappedEvents = events.map(EventEntityToDomain.map)
            return Object.assign(acc, { [device_id]: mappedEvents })
          }, {})
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getLatestTelemetryForDevices: async (device_ids: UUID[]): Promise<TelemetryDomainModel[]> => {
        try {
          const connection = await repository.connect('ro')

          /**
           * Run the query within a transaction so we can safely disable bitmapscan
           * https://github.com/typeorm/typeorm/blob/master/docs/transactions.md
           */
          const entities = await connection.transaction(async manager => {
            await manager.query(`select set_config('enable_bitmapscan','off', true)`)
            return await manager
              .createQueryBuilder(TelemetryEntity, 'telemetry')
              .distinctOn(['device_id'])
              .orderBy('device_id', 'DESC')
              .addOrderBy('timestamp', 'DESC')
              .where('device_id = ANY (:device_ids)', { device_ids })
              .getMany()
          })

          return entities.map(TelemetryEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getEventsWithDeviceAndTelemetryInfoUsingOptions: async (
        options: GetEventsWithDeviceAndTelemetryInfoOptions
      ): Promise<GetEventsWithDeviceAndTelemetryInfoResponse> =>
        getEventsWithDeviceAndTelemetryInfo(repository, { ...options, beforeCursor: null, afterCursor: null }),

      getEventsWithDeviceAndTelemetryInfoUsingCursor: async (
        cursor: string
      ): Promise<GetEventsWithDeviceAndTelemetryInfoResponse> =>
        getEventsWithDeviceAndTelemetryInfo(repository, parseCursor<GetEventsWithDeviceAndTelemetryInfoOptions>(cursor))
    }
  }
)
