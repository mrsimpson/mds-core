import debug from 'debug'
import httpContext from 'express-http-context'
import pino, { Logger } from 'pino'
import { LogLevel } from './@types'
import { redact } from './redaction'

const deriveRequestId = () => {
  const requestId = httpContext.get('x-request-id')
  return requestId ? { requestId: () => requestId } : {}
}

export const logger: Pick<Logger, LogLevel> = (() =>
  pino(
    {
      base: {
        ...deriveRequestId(),
        ISOTimestamp: () => new Date().toISOString()
      },
      timestamp: () => `,"timestamp":"${Date.now()}"`, // This is a gross looking way to rename the default pino timestamp key 'time' to 'timestamp'
      formatters: {
        level: label => {
          return { level: label }
        }
      },
      nestedKey: 'data',
      messageKey: 'message',
      level: process.env.DEBUG ? 'debug' : false || 'info'
    },
    pino.destination({ sync: false })
  ))()

/**
 * Follows the standard pattern of the [debug](https://www.npmjs.com/package/debug) module,
 * with the caveat that logging function supports the mds-logger format you know and love.
 * Default namespace is mds, but if you provide a namespace arg it will appear as 'mds:${namespace}'.
 */
export const debugLog = (namespace?: string) => {
  const debugLogger = debug(namespace ? `mds:${namespace}` : 'mds')
  return (message: string, data?: Record<string, unknown> | Error) => {
    const formattedLogMessage = { log_message: message, log_data: redact(data), ...deriveRequestId() }

    // Invoke the debug module with custom namespace & formatted message
    debugLogger(formattedLogMessage)
  }
}
