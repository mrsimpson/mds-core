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
import type { KafkaStreamConsumerOptions, KafkaStreamProducerOptions } from '@mds-core/mds-stream'
import stream, { KafkaJSError } from '@mds-core/mds-stream'
import type { SingleOrArray } from '@mds-core/mds-types'
import { asChunks, ParseError } from '@mds-core/mds-utils'
import type { StreamSink, StreamSource } from '../@types'
import { StreamProcessorLogger } from '../logger'

/** Counts the number of messages consumed so far, logs & resets once it hits 100 */
class Counter {
  private count = 0

  public get() {
    return this.count
  }

  public increment() {
    if (this.count === 100) {
      StreamProcessorLogger.info(
        'Processed 100 messages, set the env var DEBUG=mds:mds-stream-processor to log eachMessage details.'
      )
      this.count = 0
    } else {
      this.count++
    }
  }
}

export const KafkaSource =
  <TMessage>(
    topics: SingleOrArray<string>,
    {
      messageLogger,
      healthStatus,
      ...options
    }: Partial<KafkaStreamConsumerOptions & { messageLogger: (message: TMessage) => string | undefined }> & {
      healthStatus: HealthStatus
    }
  ): StreamSource<TMessage> =>
  processor => {
    const messageCounter = new Counter()
    StreamProcessorLogger.info('Creating KafkaSource', { topics, options })
    return stream.KafkaStreamConsumer(
      topics,
      healthStatus,
      async payload => {
        const {
          topic,
          message: { offset, value }
        } = payload
        if (value) {
          const message: TMessage | ParseError = (() => {
            try {
              return JSON.parse(value.toString())
            } catch (err) {
              return new ParseError('JSON.parse() failure', value)
            }
          })()
          StreamProcessorLogger.debug(`Processing ${topic}/${offset}`, {
            message: message instanceof ParseError ? message : (messageLogger && messageLogger(message)) ?? message
          })

          await processor(message)

          return messageCounter.increment()
        }
      },
      undefined,
      options
    )
  }

/*
 * KafkaBatchSource is a KafkaSource that batches messages into chunks of size `batchSize`
 * and sends them to the processor.
 * It is useful for processing large amounts of data in batches,
 * but it is not recommended for processing small amounts of data.
 * It is also not recommended for processing data that is not in JSON format.
 *
 * @param topics - The topics to consume from
 * @param batchSize - The number of messages to batch together and send to the processor
 * @param options - Options for the KafkaStreamConsumer
 * @returns A StreamSource that batches messages into chunks of size `batchSize` and sends them to the processor
 */
export const KafkaBatchSource =
  <TMessage>(
    topics: SingleOrArray<string>,
    {
      messageLogger,
      healthStatus,
      ...options
    }: Partial<KafkaStreamConsumerOptions & { messageLogger: (messages: TMessage[]) => string | undefined }> & {
      healthStatus: HealthStatus
    },
    batchSize?: number
  ): StreamSource<TMessage[]> =>
  processor => {
    StreamProcessorLogger.info('Creating KafkaSource', { topics, options })
    return stream.KafkaStreamConsumer(
      topics,
      healthStatus,
      undefined,
      async batchPayload => {
        const {
          batch: { messages, topic, partition, lastOffset },
          resolveOffset,
          heartbeat,
          commitOffsetsIfNecessary,
          isRunning,
          isStale
        } = batchPayload

        /* 1. Chunk the messages into chunks of size `batchSize`` */
        /* 2. Check if the batch is not stale and if processor is still running */
        /* 3. Parse All Message values */
        /* 4. Process All Messages */
        /* 5. Resolve Offsets */
        /* 6. Commit Offsets */
        /* 7. Send Heartbeat */

        for (const messagesChunk of asChunks(messages, batchSize)) {
          if (!isStale() && isRunning()) {
            const { messages: parsedMessages, errors: parseErrors } = messagesChunk.reduce<{
              messages: TMessage[]
              errors: ParseError[]
            }>(
              (acc, { value }) => {
                try {
                  if (value) {
                    acc.messages.push(JSON.parse(value.toString()))
                  }
                } catch (err) {
                  acc.errors.push(new ParseError('JSON.parse() failure', value))
                }
                return acc
              },
              { messages: [], errors: [] }
            )

            StreamProcessorLogger.debug(`Processing ${topic}/${lastOffset}`, {
              messages:
                parseErrors.length > 0
                  ? parseErrors
                  : (messageLogger && messageLogger(parsedMessages)) ?? parsedMessages
            })

            try {
              await processor(parsedMessages)
            } catch (e) {
              if (!(e instanceof KafkaJSError) && e instanceof Error) {
                StreamProcessorLogger.error(`Error when calling KafkaBatchSource.eachBatch`, {
                  topic,
                  partition,
                  offset: lastOffset,
                  stack: e.stack,
                  error: e
                })
              }

              throw e
            } finally {
              /* resolve all messages of this chunk, then commit them */
              messagesChunk.forEach(({ offset }) => resolveOffset(offset))
              await commitOffsetsIfNecessary()

              /* let kafka know we're still humming along */
              await heartbeat()
            }
          }
        }
      },
      options
    )
  }

export const KafkaSink =
  <TMessage>(topic: string, options?: Partial<KafkaStreamProducerOptions<TMessage>>): StreamSink<TMessage> =>
  () => {
    StreamProcessorLogger.info('Creating KafkaSink', { topic, options })
    return stream.KafkaStreamProducer(topic, options)
  }
