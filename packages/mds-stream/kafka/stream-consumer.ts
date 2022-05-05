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

import type { HealthStatus } from '@mds-core/mds-api-server'
import type { Nullable, SingleOrArray, Timestamp } from '@mds-core/mds-types'
import { asArray, isDefined, now, seconds } from '@mds-core/mds-utils'
import { cleanEnv, num } from 'envalid'
import type { Consumer, EachMessagePayload } from 'kafkajs'
import { Kafka } from 'kafkajs'
import { StreamLogger } from '../logger'
import type { StreamConsumer } from '../stream-interface'
import { getKafkaBrokers } from './helpers'

const { KAFKA_HEARTBEAT_TIMEOUT_MS } = cleanEnv(process.env, {
  KAFKA_HEARTBEAT_TIMEOUT_MS: num({
    default: seconds(60),
    desc: 'Kafka heartbeat timeout in milliseconds. If we go this duration without a successful heartbeat to the broker, the consumer will be marked as unhealthy.'
  })
})

export interface KafkaStreamConsumerOptions {
  clientId: string
  groupId: string
  fromBeginning: boolean
}

/**
 * If we haven't sent a heartbeat to the coordinator in over a minute, restart the consumer pod entirely
 */
export const heartbeatCheck = async (
  consumer: Consumer,
  healthStatus: HealthStatus,
  lastHeartbeat: Nullable<number>
) => {
  const { groupId } = await consumer.describeGroup()
  const componentName = `kafka-consumer-${groupId}`

  if (lastHeartbeat && now() - KAFKA_HEARTBEAT_TIMEOUT_MS > lastHeartbeat) {
    const errorMsg = `The Kafka consumer has not sent a heartbeat to the coordinator in over ${
      KAFKA_HEARTBEAT_TIMEOUT_MS / 1000
    } seconds`

    StreamLogger.error(errorMsg)

    await disconnectConsumer(consumer)

    healthStatus.components = {
      ...healthStatus.components,
      [componentName]: { last_updated: now(), healthy: false, message: errorMsg }
    }
  } else {
    StreamLogger.debug('Kafka consumer is healthy', { groupId })

    // The consumer is healthy, so register it as a component in the HealthStatus
    healthStatus.components = { ...healthStatus.components, [componentName]: { last_updated: now(), healthy: true } }
  }
}

const registerLivelinessHandling = (consumer: Consumer, healthStatus: HealthStatus) => {
  let lastHeartbeat: Nullable<Timestamp> = null

  const { CRASH, STOP, DISCONNECT, HEARTBEAT } = consumer.events

  consumer.on(CRASH, async ({ payload: { error, groupId, restart } }) => {
    StreamLogger.error('Kafka consumer crashed', { error, groupId, restart })
    await disconnectConsumer(consumer)
    healthStatus.components = {
      ...healthStatus.components,
      [groupId]: { last_updated: now(), healthy: false, message: `Kafka consumer crashed: ${JSON.stringify(error)}` }
    }
  })
  consumer.on(STOP, async () => {
    StreamLogger.error('The Kafka consumer has stopped')
  })
  consumer.on(DISCONNECT, async () => {
    StreamLogger.error('The Kafka consumer has disconnected')
  })
  consumer.on(HEARTBEAT, async () => {
    StreamLogger.debug('The Kafka consumer has sent a heartbeat to the coordinator')
    lastHeartbeat = now()
  })

  /**
   * Check the consumers heartbeat every KAFKA_HEARTBEAT_TIMEOUT_MS
   */
  setInterval(async () => {
    await heartbeatCheck(consumer, healthStatus, lastHeartbeat)
  }, KAFKA_HEARTBEAT_TIMEOUT_MS)
}

const createStreamConsumer = async (
  topics: SingleOrArray<string>,
  eachMessage: (payload: EachMessagePayload) => Promise<void>,
  healthStatus: HealthStatus,
  { clientId = 'client', groupId = 'group', fromBeginning = false }: Partial<KafkaStreamConsumerOptions> = {}
) => {
  try {
    const brokers = getKafkaBrokers()

    if (!brokers) {
      return null
    }

    const kafka = new Kafka({ clientId, brokers })
    const consumer = kafka.consumer({ groupId })

    await consumer.connect()
    await Promise.all(asArray(topics).map(topic => consumer.subscribe({ topic, fromBeginning })))

    registerLivelinessHandling(consumer, healthStatus)

    await consumer.run({ eachMessage })
    return consumer
  } catch (err) {
    StreamLogger.error('createStreamConsumer error', { err })
  }
  return null
}

const disconnectConsumer = async (consumer: Nullable<Consumer>) => {
  if (isDefined(consumer)) {
    await consumer.disconnect()
  }
}

export const KafkaStreamConsumer = (
  topics: SingleOrArray<string>,
  eachMessage: (payload: EachMessagePayload) => Promise<void>,
  healthStatus: HealthStatus,
  options?: Partial<KafkaStreamConsumerOptions>
): StreamConsumer => {
  let consumer: Nullable<Consumer> = null

  return {
    initialize: async () => {
      if (!consumer) {
        consumer = await createStreamConsumer(topics, eachMessage, healthStatus, options)
      }
    },
    shutdown: async () => {
      await disconnectConsumer(consumer)
      consumer = null
    }
  }
}
