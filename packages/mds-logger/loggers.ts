import debug from 'debug'
import pino from 'pino'
import { redact } from './redaction'

export const logger = (() =>
  pino(
    {
      base: {}, // necessary to avoid hostname and other pino default prop injection
      timestamp: () => `,"timestamp":"${Date.now()}"`, // This is a gross looking way to rename the default pino timestamp key 'time' to 'timestamp'
      formatters: {
        level: label => {
          return { level: label }
        }
      },
      messageKey: 'message',
      level: process.env.DEBUG ? 'debug' : false || 'info'
    },
    pino.destination({ sync: process.env.NODE_ENV === 'test' })
  ))()

/**
 * Follows the standard pattern of the [debug](https://www.npmjs.com/package/debug) module,
 * with the caveat that logging function supports the mds-logger format you know and love.
 * Default namespace is mds, but if you provide a namespace arg it will appear as 'mds:${namespace}'.
 */
export const debugLog = (namespace: string, redactKeys: Set<string>) => {
  const debugLogger = debug(namespace)
  return (message: string, data?: Record<string, unknown> | Error) => {
    if (process.env.QUIET !== 'true') {
      const formattedLogMessage = { log_message: message, log_data: redact(data, redactKeys) }

      // Invoke the debug module with custom namespace & formatted message
      debugLogger(formattedLogMessage)
    }
  }
}
