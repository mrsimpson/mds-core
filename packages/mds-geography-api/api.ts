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

import type { AccessTokenScopeValidator, ApiRequest, ApiResponse } from '@mds-core/mds-api-server'
import { checkAccess } from '@mds-core/mds-api-server'
import { GeographyServiceClient } from '@mds-core/mds-geography-service'
import {
  BadParamsError,
  InsufficientPermissionsError,
  NotFoundError,
  pathPrefix,
  ServerError
} from '@mds-core/mds-utils'
import type express from 'express'
import type { NextFunction } from 'express'
import { GeographyLogger } from './logger'
import { GeographyApiVersionMiddleware } from './middleware'
import type {
  GeographyApiAccessTokenScopes,
  GeographyApiGetGeographiesRequest,
  GeographyApiGetGeographiesResponse,
  GeographyApiGetGeographyRequest
} from './types'

const checkGeographyApiAccess = (validator: AccessTokenScopeValidator<GeographyApiAccessTokenScopes>) =>
  checkAccess(validator)

function api(app: express.Express): express.Express {
  app.use(GeographyApiVersionMiddleware)

  app.get(
    pathPrefix('/geographies/:geography_id'),
    checkGeographyApiAccess(scopes => {
      return scopes.includes('geographies:read:published') || scopes.includes('geographies:read:unpublished')
    }),
    async (
      req: GeographyApiGetGeographyRequest,
      res: GeographyApiGetGeographiesResponse,
      next: express.NextFunction
    ) => {
      const { geography_id } = req.params
      try {
        const geography = await GeographyServiceClient.getGeography(geography_id)
        if (geography === undefined) {
          throw new NotFoundError()
        }
        if (!geography.publish_date && !res.locals.scopes.includes('geographies:read:unpublished')) {
          throw new InsufficientPermissionsError('permission to read unpublished geographies missing')
        }
        return res.status(200).send({ version: res.locals.version, data: { geographies: [geography] } })
      } catch (error) {
        GeographyLogger.error('failed to read geography', { error })
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }

        if (error instanceof InsufficientPermissionsError) {
          return res.status(403).send({ error })
        }

        return next(new ServerError(error))
      }
    }
  )

  app.get(
    pathPrefix('/geographies'),
    checkGeographyApiAccess(scopes => {
      return scopes.includes('geographies:read:published') || scopes.includes('geographies:read:unpublished')
    }),
    async (
      req: GeographyApiGetGeographiesRequest,
      res: GeographyApiGetGeographiesResponse,
      next: express.NextFunction
    ) => {
      const summary = req.query.summary === 'true'
      const { get_published, get_unpublished } = req.query
      const params = {
        get_published: get_published ? get_published === 'true' : null,
        get_unpublished: get_unpublished ? get_unpublished === 'true' : null
      }

      try {
        if (!res.locals.scopes.includes('geographies:read:unpublished') && params.get_unpublished) {
          throw new InsufficientPermissionsError(
            'Cannot require unpublished geos without geography:read:unpublished scope'
          )
        }

        const options = { includeGeographyJSON: !summary }
        const geographies = await (() => {
          if (params.get_unpublished) {
            if (params.get_published) {
              throw new BadParamsError('cannot have get_unpublished and get_published both be true')
            } else {
              return GeographyServiceClient.getUnpublishedGeographies(options)
            }
          } else {
            if (params.get_published) {
              return GeographyServiceClient.getPublishedGeographies(options)
            } else {
              return GeographyServiceClient.getGeographies(options)
            }
          }
        })()
        if (!res.locals.scopes.includes('geographies:read:unpublished')) {
          const filteredGeos = geographies.filter(geo => !!geo.publish_date)
          return res.status(200).send({ version: res.locals.version, data: { geographies: filteredGeos } })
        }
        return res.status(200).send({ version: res.locals.version, data: { geographies } })
      } catch (error) {
        /* We don't throw a NotFoundError if the number of results is zero, so the error handling
         * doesn't need to consider it here.
         */
        if (error instanceof InsufficientPermissionsError) {
          return res.status(403).send({ error })
        }
        GeographyLogger.error('failed to read geographies', { error })
        return next(new ServerError(error))
      }
    }
  )

  app.use(async (error: Error, req: ApiRequest, res: ApiResponse, next: NextFunction) => {
    const { method, originalUrl } = req
    GeographyLogger.error('Fatal MDS Geography Error (global error handling middleware)', {
      method,
      originalUrl,
      error
    })
    return res.status(500).send({ error })
  })

  return app
}

export { api }
