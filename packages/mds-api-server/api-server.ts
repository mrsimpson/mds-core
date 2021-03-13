import express from 'express'
import * as Joi from 'joi'
import logger from '@mds-core/mds-logger'
import { ProviderIdClaim, UserEmailClaim, JurisdictionsClaim } from '@mds-core/mds-api-authorizer'
import { pathPrefix } from '@mds-core/mds-utils'
import { AuthorizationMiddlewareOptions, AuthorizationMiddleware } from './middleware/authorization'
import { CompressionMiddlewareOptions, CompressionMiddleware } from './middleware/compression'
import { CorsMiddlewareOptions, CorsMiddleware } from './middleware/cors'
import { JsonBodyParserMiddlewareOptions, JsonBodyParserMiddleware } from './middleware/json-body-parser'
import { MaintenanceModeMiddlewareOptions, MaintenanceModeMiddleware } from './middleware/maintenance-mode'
import { RequestLoggingMiddlewareOptions, RequestLoggingMiddleware } from './middleware/request-logging'
import { PrometheusMiddlewareOptions, PrometheusMiddleware } from './middleware/prometheus'
import { serverVersion } from './utils'
import { HealthRequestHandler } from './handlers/health'
import { HttpContextMiddleware } from './middleware/http-context'

export interface ApiServerMiddlewareOptions {
  authorization: AuthorizationMiddlewareOptions
  compression: CompressionMiddlewareOptions
  cors: CorsMiddlewareOptions
  jsonBodyParser: JsonBodyParserMiddlewareOptions
  maintenanceMode: MaintenanceModeMiddlewareOptions
  requestLogging: RequestLoggingMiddlewareOptions
  prometheus: PrometheusMiddlewareOptions
}

export const ApiServer = <T extends {} = {}>(
  // The linter does not realize that the type variable is used.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  api: <G = T>(server: express.Express) => express.Express,
  options: Partial<ApiServerMiddlewareOptions> = {},
  app: express.Express = express()
): express.Express => {
  logger.info(`${serverVersion()} starting`)

  // Log the custom authorization namespace/claims
  const claims = [ProviderIdClaim, UserEmailClaim, JurisdictionsClaim]
  claims.forEach(claim => {
    logger.info(`${serverVersion()} using authorization claim ${claim()}`)
  })

  // Disable x-powered-by header
  app.disable('x-powered-by')

  // Middleware
  app.use(
    CompressionMiddleware(options.compression),
    CorsMiddleware(options.cors),
    JsonBodyParserMiddleware(options.jsonBodyParser),
    AuthorizationMiddleware(options.authorization),
    /** Prometheus Middleware
     * Placed after the other middleware so it can label metrics with additional
     * properties added by the other middleware.
     */
    PrometheusMiddleware(options.prometheus),
    /** Request Logging Middleware
     * Placed after Prometheus middleware to avoid excessive logging
     */
    RequestLoggingMiddleware(options.requestLogging),
    MaintenanceModeMiddleware(options.maintenanceMode),
    /** HTTP Context Middleware
     * Placed after the other middleware to avoid causing collisions
     * see express-http-context's README for more information
     */
    ...HttpContextMiddleware()
  )

  // Health Route
  app.get(pathPrefix('/health'), HealthRequestHandler)

  return api<T>(app)
}
