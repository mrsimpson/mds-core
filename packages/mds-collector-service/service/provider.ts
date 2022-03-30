/**
 * Copyright 2021 City of Los Angeles
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

import type { Schema } from '@mds-core/mds-schema-validators'
import { SchemaValidator } from '@mds-core/mds-schema-validators'
import type { ProcessController, ServiceProvider } from '@mds-core/mds-service-helpers'
import { ServiceError, ServiceException, ServiceResult } from '@mds-core/mds-service-helpers'
import type { StreamProducer } from '@mds-core/mds-stream'
import stream from '@mds-core/mds-stream'
import type { Nullable } from '@mds-core/mds-types'
import { getEnvVar, isUUID, pluralize, ServerError } from '@mds-core/mds-utils'
import type { CollectorService, CollectorServiceRequestContext } from '../@types'
import { CollectorServiceLogger } from '../logger'
import { CollectorRepository } from '../repository'

const SchemaValidators = new Map<string, SchemaValidator<unknown>>()
type CollectorStreamProducer = Nullable<StreamProducer<{}>>
const StreamProducers = new Map<string, Nullable<CollectorStreamProducer>>()

const { TENANT_ID } = getEnvVar({
  TENANT_ID: 'mds'
})

const createSchemaValidator = async (schema_id: string): Promise<SchemaValidator<unknown>> => {
  const { schema } = await CollectorRepository.getCollectorSchema(schema_id)
  return SchemaValidator<unknown>(schema as Schema<unknown>)
}

const getSchemaValidator = async (schema_id: string) => {
  const validator = SchemaValidators.get(schema_id) ?? (await createSchemaValidator(schema_id))
  if (!SchemaValidators.has(schema_id)) {
    SchemaValidators.set(schema_id, validator)
  }
  return validator
}

const createStreamProducer = async (schema_id: string): Promise<CollectorStreamProducer> => {
  const topic = `${TENANT_ID}.collector.${schema_id}`
  // TODO: Do we need to create the topic?
  if (process.env.KAFKA_HOST !== undefined) {
    const producer = stream.KafkaStreamProducer(topic)
    await producer.initialize()
    return producer
  }
  return null
}

const getStreamProducer = async (schema_id: string): Promise<CollectorStreamProducer> => {
  const producer = StreamProducers.get(schema_id) ?? (await createStreamProducer(schema_id))
  if (!StreamProducers.has(schema_id)) {
    StreamProducers.set(schema_id, producer)
  }
  return producer
}

export const CollectorServiceProvider: ServiceProvider<CollectorService, CollectorServiceRequestContext> &
  ProcessController = {
  start: CollectorRepository.initialize,

  stop: CollectorRepository.shutdown,

  registerMessageSchema: async (context, schema_id, schema) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validator = SchemaValidator(schema as any)
      await CollectorRepository.insertCollectorSchema({ schema_id, schema })
      SchemaValidators.set(schema_id, validator)
      return ServiceResult(true)
    } catch (error) {
      const exception = ServiceException(`Error Registering Schema ${schema_id}`, error)
      CollectorServiceLogger.error('registerMessageSchema exception', { exception, error })
      return exception
    }
  },

  getMessageSchema: async (context, schema_id) => {
    try {
      const { $schema } = await getSchemaValidator(schema_id)
      return ServiceResult($schema)
    } catch (error) {
      const exception = ServiceException(`Error Reading Schema ${schema_id}`, error)
      CollectorServiceLogger.error('getMessageSchema exception', { exception, error })
      return exception
    }
  },

  writeSchemaMessages: async (context, schema_id, provider_id, messages) => {
    if (!isUUID(provider_id)) {
      return ServiceError({
        type: 'ValidationError',
        message: `Invalid provider_id for schema ${schema_id}; must be a UUID`,
        details: { provider_id }
      })
    }

    if (messages.length === 0) {
      return ServiceResult([])
    }
    try {
      const [validator, producer] = await Promise.all([getSchemaValidator(schema_id), getStreamProducer(schema_id)])

      const invalid = messages.reduce<{ position: number; errors: unknown[] }[]>((failures, message, position) => {
        try {
          validator.validate(message)
          return failures
        } catch (errors) {
          if (Array.isArray(errors)) {
            return failures.concat({ position, errors })
          }

          return failures.concat({ position, errors: [errors] })
        }
      }, [])

      if (invalid.length > 0) {
        return ServiceError({
          type: 'ValidationError',
          message: `Invalid ${pluralize(invalid.length, 'message', 'messages')} for schema ${schema_id}`,
          details: { invalid }
        })
      }

      // Write to Postgres
      const result = await CollectorRepository.insertCollectorMessages(
        messages.map(message => ({ schema_id, provider_id, message })),
        producer
          ? {
              // Write to Kafka prior to committing transaction
              beforeCommit: async () => {
                try {
                  await producer.write(messages)
                } catch (error) {
                  throw new ServerError('Error writing to Kafka stream', error)
                }
              }
            }
          : {}
      )

      return ServiceResult(result)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Writing Messages for Schema ${schema_id}`, error)
      CollectorServiceLogger.error('writeSchemaMessages exception', { exception, error })
      return exception
    }
  }
}
