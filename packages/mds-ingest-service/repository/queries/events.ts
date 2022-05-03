import type {
  ModelMapper,
  ReadOnlyRepositoryProtectedMethods,
  ReadWriteRepositoryProtectedMethods
} from '@mds-core/mds-repository'
import { RepositoryError } from '@mds-core/mds-repository'
import type { Nullable } from '@mds-core/mds-types'
import { head, isDefined, isUUID, tail } from '@mds-core/mds-utils'
import type { DataSource, SelectQueryBuilder } from 'typeorm'
import type { PagingResult } from 'typeorm-cursor-pagination'
import { buildPaginator } from 'typeorm-cursor-pagination'
import type {
  EventDomainModel,
  GetEventsWithDeviceAndTelemetryInfoOptions,
  GetEventsWithDeviceAndTelemetryInfoResponse,
  GetVehicleEventsFilterParams,
  GetVehicleEventsOrderOption,
  PartialEventDomainModel,
  ResponseWithCursor,
  WithCursorOptions
} from '../../@types'
import { DeviceEntity } from '../entities/device-entity'
import { EventAnnotationEntity } from '../entities/event-annotation-entity'
import type { EventEntityModel } from '../entities/event-entity'
import { EventEntity } from '../entities/event-entity'
import type { TelemetryEntity } from '../entities/telemetry-entity'
import type { PartialEventEntityModel } from '../mappers'
import {
  EventEntityToDomain,
  EventWithDeviceAndTelemetryInfoEntityToDomain,
  PartialEventEntityToDomain
} from '../mappers'
import type { EventWithDeviceAndTelemetryInfoEntityModel } from '../views/event-with-device-and-telemetry-info'
import { EventWithDeviceAndTelemetryInfoEntity } from '../views/event-with-device-and-telemetry-info'
import { base64encode, buildCursor } from './helpers'

export const getEvents = async (
  repository: ReadWriteRepositoryProtectedMethods,
  params: WithCursorOptions<GetVehicleEventsFilterParams>
) => {
  return getEventsOrPartialEvents(repository, params, EventEntityToDomain)
}

export const getPartialEvents = async (
  repository: ReadWriteRepositoryProtectedMethods,
  params: WithCursorOptions<GetVehicleEventsFilterParams>
) => {
  return getEventsOrPartialEvents(repository, params, PartialEventEntityToDomain)
}

const getEventsOrPartialEvents = async <
  E extends EventEntityModel | PartialEventEntityModel,
  D extends EventDomainModel | PartialEventDomainModel
>(
  repository: ReadWriteRepositoryProtectedMethods,
  params: WithCursorOptions<GetVehicleEventsFilterParams>,
  mapper: ModelMapper<E, D>
): Promise<ResponseWithCursor<{ events: D[] }>> => {
  const { limit = 100, beforeCursor, afterCursor, order } = params

  try {
    const connection = await repository.connect('ro')

    const { query, cursor } = buildQueryAndCursor(connection, params)

    const {
      data,
      cursor: { beforeCursor: nextBeforeCursor, afterCursor: nextAfterCursor }
    } = await paginateEventTelemetry<E>(query, limit, beforeCursor, afterCursor, order)

    const events = data.map(mapper.mapper())

    return {
      events,
      cursor: buildNextAndPrevCursor(nextBeforeCursor, nextAfterCursor, cursor)
    }
  } catch (error) {
    throw RepositoryError(error)
  }
}

const buildNextAndPrevCursor = <T extends GetVehicleEventsFilterParams>(
  nextBeforeCursor: string | null,
  nextAfterCursor: string | null,
  cursor: T
) => {
  return {
    prev:
      nextBeforeCursor &&
      buildCursor<T>({
        ...cursor,
        beforeCursor: nextBeforeCursor,
        afterCursor: null
      }),
    next:
      nextAfterCursor &&
      buildCursor<T>({
        ...cursor,
        beforeCursor: null,
        afterCursor: nextAfterCursor
      })
  }
}

const buildQueryAndCursor = (connection: DataSource, params: WithCursorOptions<GetVehicleEventsFilterParams>) => {
  const {
    time_range,
    geography_ids,
    grouping_type = 'latest_per_vehicle',
    event_types,
    vehicle_states,
    vehicle_types,
    vehicle_id,
    device_ids,
    propulsion_types,
    provider_ids,
    limit = 100,
    order,
    columns,
    events
  } = params

  const joinDevices =
    (columns?.device?.length ?? 0) > 0 ||
    isDefined(propulsion_types) ||
    isDefined(vehicle_types) ||
    isDefined(vehicle_id)

  const joinAnnotations = (columns?.annotation?.length ?? 0) > 0 || isDefined(geography_ids)
  const query = connection
    .getRepository(EventEntity)
    .createQueryBuilder('events')
    .innerJoin(
      'telemetry',
      'telemetry',
      'telemetry.device_id = events.device_id AND telemetry.timestamp = events.telemetry_timestamp'
    )

  if (joinDevices) {
    query.innerJoin(DeviceEntity, 'devices', 'devices.device_id = events.device_id')
    if (propulsion_types) {
      query.andWhere('devices.propulsion_types && :propulsion_types', { propulsion_types })
    }

    if (vehicle_types) {
      query.andWhere('devices.vehicle_type = ANY(:vehicle_types)', { vehicle_types })
    }

    if (vehicle_id) {
      query.andWhere('lower(devices.vehicle_id) = :vehicle_id', { vehicle_id: vehicle_id.toLowerCase() })
    }
  }

  if (joinAnnotations) {
    query.innerJoin(EventAnnotationEntity, 'event_annotations', 'event_annotations.events_row_id = events.id')

    if (geography_ids) {
      query.andWhere('event_annotations.geography_ids && :geography_ids', { geography_ids })
    }
  }

  if (grouping_type === 'latest_per_vehicle') {
    query.innerJoin(
      qb => {
        const subquery = qb
          .select('id as event_id, RANK() OVER (PARTITION BY device_id ORDER BY timestamp DESC) AS rownum')
          .from(EventEntity, 'e')
        return time_range ? subquery.where('timestamp >= :start AND timestamp <= :end', time_range) : subquery
      },
      'last_device_event',
      'last_device_event.event_id = events.id AND last_device_event.rownum = 1'
    )
  }

  if (grouping_type === 'latest_per_trip') {
    query.innerJoin(
      qb => {
        const subquery = qb
          .select('trip_id, id as event_id, RANK() OVER (PARTITION BY trip_id ORDER BY timestamp DESC) AS rownum')
          .from(EventEntity, 'e')
        return time_range ? subquery.where('timestamp >= :start AND timestamp <= :end', time_range) : subquery
      },
      'last_trip_event',
      'last_trip_event.event_id = events.id AND last_trip_event.rownum = 1'
    )
  }

  if (grouping_type === 'all_events' && time_range) {
    query.andWhere('events.timestamp >= :start AND events.timestamp <= :end', time_range)
  }

  if (events) {
    const whereIn = '(events.timestamp, events.device_id) IN '
    const binds: Record<string, number | string> = {}
    const pairs = events.reduce((acc, { timestamp, device_id }, idx) => {
      acc.push(`(:timestamp${idx}, :device_id${idx})`)
      binds[`timestamp${idx}`] = timestamp
      binds[`device_id${idx}`] = device_id
      return acc
    }, [] as string[])

    query.andWhere(whereIn + `(${pairs.join(',')})`, binds)
  }

  if (event_types) {
    query.andWhere('events.event_types && :event_types', { event_types })
  }

  if (device_ids) {
    query.andWhere('events.device_id = ANY(:device_ids)', { device_ids })
  }

  if (vehicle_states) {
    query.andWhere('events.vehicle_state = ANY(:vehicle_states)', { vehicle_states })
  }

  if (provider_ids && provider_ids.every(isUUID)) {
    query.andWhere('events.provider_id = ANY(:provider_ids)', { provider_ids })
  }

  /**
   * results are selected as JSON, so that we can skip the TypeORM entity builder.
   */
  if (columns) {
    /* id must always be selected, for use with pagination cursor */
    if (!columns.event.includes('id')) {
      columns.event.push('id')
    }
    const row = columns.event.map(field => `'${field}', events.${field}`).join(', ')
    query.select(`jsonb_build_object(${row}) as event`)

    const telemetryColumns = columns.telemetry.base?.map(field => `'${field}', telemetry.${field}`)
    const gpsColumns = columns.telemetry.gps.map(field => `'${field}', telemetry.${field}`)

    const telemetryObject = telemetryColumns
      ? `jsonb_build_object(${telemetryColumns.join(', ')}, 'gps', jsonb_build_object(${gpsColumns.join(', ')}))`
      : `jsonb_build_object('gps', jsonb_build_object(${gpsColumns.join(', ')}))`
    query.addSelect(`${telemetryObject} as telemetry`)

    if (columns.annotation) {
      const row = columns.annotation.map(field => `'${field}', event_annotations.${field}`).join(', ')
      query.addSelect(`jsonb_build_object(${row}) as annotation`)
    }
    if (columns.device) {
      const row = columns.device.map(field => `'${field}', devices.${field}`).join(', ')
      query.addSelect(`jsonb_build_object(${row}) as device`)
    }
  } else {
    query.select('row_to_json(events.*) as event, row_to_json(telemetry.*) as telemetry')
  }

  const cursor = {
    time_range,
    geography_ids,
    grouping_type,
    event_types,
    vehicle_states,
    vehicle_types,
    vehicle_id,
    device_ids,
    propulsion_types,
    provider_ids,
    limit,
    order,
    columns
  }

  return { query, cursor }
}

/**
 * TypeORM does not handle joined-models and pagination very well, at all.
 * The second you supply a .take(N) value, it follows a completely different builder plan
 * to generate your results in a two-phase query. The results were at least 100x slower
 * than just doing a join and parsing the objects.
 *
 * this method is yanked from the `typeorm-cursor-pagination/Paginator.paginate()` source,
 * and avoids calling .getMany()
 */
const paginateEventTelemetry = async <E extends EventEntityModel | PartialEventEntityModel>(
  query: SelectQueryBuilder<EventEntity>,
  limit: number,
  beforeCursor: string | null,
  afterCursor: string | null,
  order?: GetVehicleEventsOrderOption
): Promise<PagingResult<E>> => {
  const pager = buildPaginator({
    entity: EventEntity,
    alias: 'events',
    paginationKeys: [order?.column ?? 'timestamp', 'id'],
    query: {
      limit,
      order: order?.direction ?? (order?.column === undefined ? 'DESC' : 'ASC'),
      beforeCursor: beforeCursor ?? undefined, // typeorm-cursor-pagination type weirdness
      afterCursor: afterCursor ?? undefined // typeorm-cursor-pagination type weirdness
    }
  })

  /* you have to manually declare a limit, since we're skipping the .take() call that normally happens in .getMany() */
  query.limit(limit + 1)
  const pagedQuery: SelectQueryBuilder<{
    event: EventEntity
    telemetry: TelemetryEntity
    device?: DeviceEntity
    annotation?: EventAnnotationEntity
  }> = pager['appendPagingQuery'](query)

  const results: {
    event: EventEntity
    telemetry: TelemetryEntity
    annotation?: EventAnnotationEntity
    device?: DeviceEntity
  }[] = await pagedQuery.execute()
  const entities = results.map(({ event, telemetry, annotation, device }) => ({
    ...event,
    telemetry,
    annotation,
    device
  }))
  const hasMore = entities.length > (limit || 100)
  if (hasMore) {
    entities.splice(entities.length - 1, 1)
  }
  if (entities.length === 0) {
    return pager['toPagingResult'](entities)
  }
  if (!pager['hasAfterCursor']() && pager['hasBeforeCursor']()) {
    entities.reverse()
  }
  if (pager['hasBeforeCursor']() || hasMore) {
    pager['nextAfterCursor'] = pager['encode'](entities[entities.length - 1])
  }
  if (pager['hasAfterCursor']() || (hasMore && pager['hasBeforeCursor']())) {
    pager['nextBeforeCursor'] = pager['encode'](entities[0])
  }

  return pager['toPagingResult'](entities) as PagingResult<E>
}

export const getEventsWithDeviceAndTelemetryInfo = async (
  repository: ReadOnlyRepositoryProtectedMethods,
  {
    provider_ids,
    device_ids,
    time_range,
    limit = 100,
    follow = false,
    ...cursor
  }: WithCursorOptions<GetEventsWithDeviceAndTelemetryInfoOptions>
): Promise<GetEventsWithDeviceAndTelemetryInfoResponse> => {
  const paginationKeys: Array<keyof EventWithDeviceAndTelemetryInfoEntityModel> = ['id']

  const buildPrevCursor = (
    options: GetEventsWithDeviceAndTelemetryInfoOptions,
    nextBeforeCursor: Nullable<string>,
    entities: EventWithDeviceAndTelemetryInfoEntityModel[]
  ) =>
    nextBeforeCursor === null && options.follow && entities.length > 0
      ? buildCursor<GetEventsWithDeviceAndTelemetryInfoOptions>({
          ...options,
          beforeCursor: base64encode(paginationKeys.map(key => `${key}:${head(entities)[key]}`).join(',')),
          afterCursor: null
        })
      : nextBeforeCursor &&
        buildCursor<GetEventsWithDeviceAndTelemetryInfoOptions>({
          ...options,
          beforeCursor: nextBeforeCursor,
          afterCursor: null
        })

  const buildNextCursor = (
    options: GetEventsWithDeviceAndTelemetryInfoOptions,
    nextAfterCursor: Nullable<string>,
    entities: EventWithDeviceAndTelemetryInfoEntityModel[]
  ) =>
    nextAfterCursor === null && options.follow && entities.length > 0
      ? buildCursor<GetEventsWithDeviceAndTelemetryInfoOptions>({
          ...options,
          beforeCursor: null,
          afterCursor: base64encode(paginationKeys.map(key => `${key}:${tail(entities)[key]}`).join(','))
        })
      : nextAfterCursor &&
        buildCursor<GetEventsWithDeviceAndTelemetryInfoOptions>({
          ...options,
          beforeCursor: null,
          afterCursor: nextAfterCursor
        })

  try {
    const connection = await repository.connect('ro')

    const query = connection.getRepository(EventWithDeviceAndTelemetryInfoEntity).createQueryBuilder('events')

    if (provider_ids?.length) {
      query.andWhere('provider_id = ANY(:provider_ids)', { provider_ids })
    }

    if (device_ids?.length) {
      query.andWhere('device_id = ANY(:device_ids)', { device_ids })
    }

    if (time_range?.start) {
      query.andWhere('timestamp >= :start', time_range)
    }

    if (time_range?.end) {
      query.andWhere('timestamp <= :end', time_range)
    }

    const {
      data: entities,
      cursor: { beforeCursor: nextBeforeCursor, afterCursor: nextAfterCursor }
    } = await buildPaginator({
      alias: query.alias,
      entity: EventWithDeviceAndTelemetryInfoEntity,
      query: {
        limit,
        order: 'ASC',
        afterCursor: cursor.afterCursor ?? undefined,
        beforeCursor: cursor.beforeCursor ?? undefined
      },
      paginationKeys
    }).paginate(query)

    const options = { limit, follow, time_range, provider_ids, device_ids }

    return {
      events: entities.map(EventWithDeviceAndTelemetryInfoEntityToDomain.mapper()),
      cursor: {
        prev: buildPrevCursor(options, nextBeforeCursor, entities),
        next: buildNextCursor(options, nextAfterCursor, entities)
      }
    }
  } catch (error) {
    throw RepositoryError(error)
  }
}
