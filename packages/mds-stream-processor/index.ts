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

import { asArray, ParseError } from '@mds-core/mds-utils'
import type { DeadLetterSink, StreamProcessorController, StreamSink, StreamSource, StreamTransform } from './@types'
import { StreamProcessorLogger } from './logger'

// StreamProcessor - Read from source, apply transform to each message, and write to sink
export const StreamProcessor = <TMessageIn, TMessageOut>(
  source: StreamSource<TMessageIn>,
  transform: StreamTransform<TMessageIn, TMessageOut>,
  sinks: Array<StreamSink<TMessageOut>>,
  deadLetterSinks: Array<DeadLetterSink<TMessageIn>>
): StreamProcessorController => {
  const sinkProducers = sinks.map(sink => sink())
  const deadLetterProducers = deadLetterSinks.map(sink => sink())

  const consumer = source(async message => {
    try {
      if (message instanceof ParseError) {
        throw message
      }
      const transformed = await transform(message)
      if (transformed) {
        if (asArray(transformed).length > 0) {
          try {
            await Promise.all(sinkProducers.map(producer => producer.write(transformed)))
          } catch (error) {
            StreamProcessorLogger.error(`Error when writing to producer`, { error })
            await Promise.all(sinkProducers.map(producer => producer.shutdown()))
            await Promise.all(sinkProducers.map(producer => producer.initialize()))
            throw error
          }
        }
      }
    } catch (error) {
      // Try to write to dead letter producers. If all fail, then Process.exit(1) is called. If only some fail, it's logged out and no errors are thrown.
      try {
        StreamProcessorLogger.error(`Writing to ${deadLetterProducers.length} dead letter producers`, {
          error,
          message
        })

        // Use Promise.allSettled to not throw errors and wait for all promises to complete.
        const results = await Promise.allSettled(
          deadLetterProducers.map(producer =>
            producer.write({ error, data: message instanceof ParseError ? JSON.stringify(message.info) : message })
          )
        )
        const failures = results.filter(result => result.status === 'rejected')
        const failureCount = failures.length
        const successes = results.filter(result => result.status === 'fulfilled')
        const successCount = successes.length

        StreamProcessorLogger.error(`Wrote to dead letter producers`, { failureCount, successCount, failures })

        // if there are any deadLetterSinks and none of the writes succeeded, throw because we did not retain the message in any dead letter sinks
        if (deadLetterProducers.length > 0 && successCount === 0) {
          throw new Error(`Failed to write to all dead letter sinks`)
        }
      } catch (deadLetterWriteError) {
        StreamProcessorLogger.error(
          `Fatal error when writing to dead letter producer. Restarting process before ACK to avoid data loss.`,
          { error: deadLetterWriteError, message }
        )
        process.exit(1)
      }
    }
  })

  return {
    start: async () => {
      await Promise.all([...sinkProducers, ...deadLetterProducers].map(producer => producer.initialize()))
      await consumer.initialize()
    },
    stop: async () => {
      await consumer.shutdown()
      await Promise.all([...sinkProducers, ...deadLetterProducers].map(producer => producer.shutdown()))
    }
  }
}

// StreamTap - Read from source and write to sink (no transform)
export const StreamForwarder = <TMessage>(
  source: StreamSource<TMessage>,
  sinks: Array<StreamSink<TMessage>>,
  deadLetterSinks: Array<DeadLetterSink<TMessage>>
) => StreamProcessor(source, message => Promise.resolve(message), sinks, deadLetterSinks)

const launch = async (processor: StreamProcessorController) => {
  const {
    env: { npm_package_name, npm_package_version, npm_package_git_commit, KAFKA_HOST }
  } = process

  try {
    await processor.start()
    StreamProcessorLogger.info(
      `Running ${npm_package_name} v${npm_package_version} (${
        npm_package_git_commit ?? 'local'
      }) connected to Kafka on ${KAFKA_HOST}`
    )
  } catch (error) {
    StreamProcessorLogger.error(
      `${npm_package_name} v${npm_package_version} (${
        npm_package_git_commit ?? 'local'
      }) connected to Kafka on ${KAFKA_HOST} failed to start`,
      { error }
    )
    return 1
  }
  return 0
}

export const ProcessorController = {
  start: (processor: StreamProcessorController) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    launch(processor)
  }
}

export * from './@types'
export * from './connectors'
