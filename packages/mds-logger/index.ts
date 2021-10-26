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

import { inspect } from 'util'
import { LogLevel } from './@types'
import { debugLog, logger } from './loggers'
import { redact } from './redaction'
// Verify that defaultOptions is available (not available on non-nodejs platforms)
if (inspect?.defaultOptions) {
  // Set the inspector depth to infinity. To the moooooooon 🚀 🌕
  inspect.defaultOptions.depth = null
}

const log =
  (level: LogLevel) =>
  (message: string, data?: Record<string, unknown> | Error): void => {
    if (process.env.QUIET !== 'true') {
      return data ? logger[level](redact(data), message) : logger[level](message)
    }
  }

export default {
  log: (level: LogLevel, ...args: Parameters<ReturnType<typeof log>>) => log(level)(...args),
  /** @deprecated
   * Create a namespaced logger with createLogger instead.
   */
  debug: debugLog,
  /** @deprecated
   * Create a namespaced logger with createLogger instead.
   */
  info: log('info'),
  /** @deprecated
   * Create a namespaced logger with createLogger instead.
   */
  warn: log('warn'),
  /** @deprecated
   * Create a namespaced logger with createLogger instead.
   */
  error: log('error'),
  createLogger: (name: string) => ({
    debug: debugLog(name),
    info: log('info'),
    warn: log('warn'),
    error: log('error')
  })
}
