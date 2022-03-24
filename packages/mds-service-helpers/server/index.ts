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

import type { Nullable } from '@mds-core/mds-types'
import {
  AlreadyPublishedError,
  AuthorizationError,
  BadParamsError,
  ConflictError,
  DependencyMissingError,
  hours,
  InsufficientPermissionsError,
  minutes,
  NotFoundError,
  seconds,
  UnsupportedTypeError,
  ValidationError
} from '@mds-core/mds-utils'
import type { Options as RetryOptions } from 'async-retry'
import retry from 'async-retry'
import type { ProcessController, ServiceErrorDescriptor, ServiceErrorType, ServiceResultType } from '../@types'
import { ServiceHelpersLogger } from '../logger'

type ProcessMonitorOptions = Partial<
  Omit<RetryOptions, 'onRetry'> & {
    interval: number
    signals: NodeJS.Signals[]
  }
>

const ProcessMonitor = async (
  controller: ProcessController,
  options: ProcessMonitorOptions = {}
): Promise<ProcessController> => {
  const {
    interval = hours(1),
    signals = ['SIGINT', 'SIGTERM'],
    retries = 15,
    minTimeout = seconds(2),
    maxTimeout = minutes(2),
    ...retryOptions
  } = options

  const {
    env: { npm_package_name, npm_package_version, npm_package_git_commit }
  } = process

  const version = `${npm_package_name} v${npm_package_version} (${npm_package_git_commit ?? 'local'})`

  /**
   * Maintains state for if this process was stopped or not.
   * This is useful if there's a long running async call as part of the `start` that hasn't completed.
   * If a SIGINT is received, this is used to abort from the startup retry loop once the promise times out.
   */
  let stopped = false

  // Keep NodeJS process alive
  ServiceHelpersLogger.info(`Monitoring process ${version} for ${signals.join(', ')}`)
  const timeout = setInterval(() => undefined, interval)

  const terminate = async (signal: NodeJS.Signals) => {
    clearInterval(timeout)
    ServiceHelpersLogger.info(`Terminating process ${version} on ${signal}`)
    stopped = true
    await controller.stop()
  }

  // Monitor process for signals
  signals.forEach(signal =>
    process.on(signal, async () => {
      await terminate(signal)
    })
  )

  // Initialize the service
  try {
    await retry(
      async () => {
        if (stopped) {
          ServiceHelpersLogger.error(`Process ${version} has been stopped during initialization, Exiting...`)
          await controller.stop()
          process.exit(1)
        }

        ServiceHelpersLogger.info(`Initializing process ${version}`)
        await controller.start()
      },
      {
        retries,
        minTimeout,
        maxTimeout,
        ...retryOptions,
        onRetry: (error, attempt) => {
          /* istanbul ignore next */
          ServiceHelpersLogger.error(
            `Initializing process ${version} failed: ${error.message}, Retrying ${attempt} of ${retries}....`
          )
        }
      }
    )
  } catch (error) /* istanbul ignore next */ {
    ServiceHelpersLogger.error(`Initializing process ${version} failed, Exiting...`, { error })
    await controller.stop()
    process.exit(1)
  }

  return {
    start: async () => undefined,
    stop: async () => terminate('SIGUSR1')
  }
}

export const ProcessManager = (controller: ProcessController, options: ProcessMonitorOptions = {}) => ({
  monitor: () => {
    // eslint-reason disable in this one location until top-level await
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ProcessMonitor(controller, options)
  },
  controller: (): ProcessController => {
    let monitor: Nullable<ProcessController> = null
    return {
      start: async () => {
        if (!monitor) {
          monitor = await ProcessMonitor(controller, options)
        }
      },
      stop: async () => {
        if (monitor) {
          await monitor.stop()
          monitor = null
        }
      }
    }
  }
})

export type ProcessManager = ReturnType<typeof ProcessManager>

export const ServiceResult = <R>(result: R): ServiceResultType<R> => ({ error: null, result })

export const ServiceError = <E extends string>(
  error: Omit<ServiceErrorDescriptor<E>, 'isServiceError'>
): ServiceErrorType<E> => ({
  error: { isServiceError: true, ...error }
})

export const ServiceException = (message: string, error?: unknown) => {
  const details = (error instanceof Error && error.message) || undefined

  /* istanbul ignore if */
  if (error instanceof NotFoundError) {
    return ServiceError({ type: 'NotFoundError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof AlreadyPublishedError) {
    return ServiceError({ type: 'AlreadyPublishedError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof ValidationError) {
    return ServiceError({ type: 'ValidationError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof ConflictError) {
    return ServiceError({ type: 'ConflictError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof UnsupportedTypeError) {
    return ServiceError({ type: 'UnsupportedTypeError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof DependencyMissingError) {
    return ServiceError({ type: 'DependencyMissingError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof BadParamsError) {
    return ServiceError({ type: 'BadParamsError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof InsufficientPermissionsError) {
    return ServiceError({ type: 'InsufficientPermissionsError', message, details })
  }

  /* istanbul ignore if */
  if (error instanceof AuthorizationError) {
    return ServiceError({ type: 'AuthorizationError', message, details })
  }

  return ServiceError({ type: 'ServiceException', message, details })
}
