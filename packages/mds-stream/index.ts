/**
 * Copyright 2019 City of Los Angeles
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

import { Device, Telemetry, TripMetadata, VehicleEvent } from '@mds-core/mds-types'
import { KafkaStreamConsumer, KafkaStreamProducer } from './kafka'
import { AgencyStreamKafka } from './kafka/agency-stream-kafka'
import { StreamLogger } from './logger'
import { AgencyStreamNats } from './nats/agency-stream-nats'
import { NatsStreamConsumer } from './nats/stream-consumer'
import { NatsStreamProducer } from './nats/stream-producer'
import { mockStream } from './test-utils'
import { BadDataError } from './types'

export { KafkaStreamConsumerOptions, KafkaStreamProducerOptions } from './kafka'
export { NatsProcessorFn } from './nats/codecs'
export { StreamConsumer, StreamProducer } from './stream-interface'

const { env } = process

const { now } = Date

async function initialize() {
  if (process.env.KAFKA_HOST) {
    await AgencyStreamKafka.initialize()
  }
  if (process.env.NATS) {
    await AgencyStreamNats.initialize()
  }
}
async function shutdown() {
  await AgencyStreamKafka.shutdown()
  await AgencyStreamNats.shutdown()
}

// put basics of vehicle in the cache
async function writeDevice(device: Device) {
  if (env.NATS) {
    try {
      await AgencyStreamNats.writeDevice(device)
    } catch (err) {
      StreamLogger.error('Failed to write device to NATS', { err })
      throw err
    }
  }
  if (env.KAFKA_HOST) {
    try {
      await AgencyStreamKafka.writeDevice(device)
    } catch (err) {
      StreamLogger.error('Failed to write device to Kafka', { err })
      throw err
    }
  }
  return
}

async function writeEvent(event: VehicleEvent) {
  if (env.NATS) {
    await AgencyStreamNats.writeEvent(event)
  }
  if (env.KAFKA_HOST) {
    await AgencyStreamKafka.writeEvent(event)
  }
  return
}

async function writeEventError(error: BadDataError) {
  if (env.NATS) {
    await AgencyStreamNats.writeEventError(error)
  }
  if (env.KAFKA_HOST) {
    await AgencyStreamKafka.writeEventError(error)
  }
  return
}

// put latest locations in the cache
async function writeTelemetry(telemetry: Telemetry[]) {
  if (env.NATS) {
    try {
      await AgencyStreamNats.writeTelemetry(telemetry)
    } catch (err) {
      StreamLogger.error('Failed to write telemetry to NATS', { err })
      throw err
    }
  }
  if (env.KAFKA_HOST) {
    try {
      await AgencyStreamKafka.writeTelemetry(telemetry)
    } catch (err) {
      StreamLogger.error('Failed to write telemetry to Kafka', { err })
      throw err
    }
  }
  const start = now()
  const delta = now() - start
  if (delta > 200) {
    StreamLogger.debug('writeTelemetry', { pointsInserted: telemetry.length, executionTime: delta })
  }
}

const writeTripMetadata = async (metadata: TripMetadata) => {
  return Promise.all([
    ...(env.NATS ? [AgencyStreamNats.writeTripMetadata(metadata)] : []),
    ...(env.KAFKA_HOST ? [AgencyStreamKafka.writeTripMetadata(metadata)] : [])
  ])
}

export default {
  initialize,
  shutdown,
  writeDevice,
  writeEvent,
  writeEventError,
  writeTelemetry,
  KafkaStreamConsumer,
  KafkaStreamProducer,
  NatsStreamConsumer,
  NatsStreamProducer,
  mockStream,
  writeTripMetadata
}
