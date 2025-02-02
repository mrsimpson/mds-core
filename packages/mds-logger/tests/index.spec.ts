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

import { createLogger } from '../index'
import { logger as pinoLogger } from '../loggers'

const logger = createLogger('mds-logger')

const QUIET = process.env.QUIET

describe('MDS Logger', () => {
  beforeEach(() => {
    process.env.QUIET = 'false'
  })

  afterEach(() => {
    process.env.QUIET = QUIET
    jest.clearAllMocks()
  })

  describe('redaction', () => {
    const toCensor = {
      device_id: 'ec551174-f324-4251-bfed-28d9f3f473fc',
      gps: {
        lat: 1231.21,
        lng: 1231.21,
        lon: 42.36,
        longitude: 42.36,
        latitude: 1231.21,
        speed: 0,
        hdop: 1,
        heading: 180
      },
      charge: 0.5,
      timestamp: 1555384091559,
      recorded: 1555384091836
    }

    const expected = expect.objectContaining({
      namespace: 'mds-logger',
      data: expect.objectContaining({
        gps: expect.objectContaining({
          lat: '[REDACTED]',
          lng: '[REDACTED]',
          lon: '[REDACTED]',
          latitude: '[REDACTED]',
          longitude: '[REDACTED]'
        }),
        charge: 0.5
      }),
      message: 'some message'
    })

    it('censors logs of lat and lng info for mds-logger.info', () => {
      const info = jest.spyOn(pinoLogger, 'info').mockImplementation(() => {
        return
      })

      logger.info('some message', toCensor)
      expect(info).toHaveBeenCalledWith(expected)
    })

    it('censors logs of geoinfo for mds-logger.warn', () => {
      const warn = jest.spyOn(pinoLogger, 'warn').mockImplementation(() => {
        return
      })

      logger.warn('some message', toCensor)
      expect(warn).toHaveBeenCalledWith(expected)
    })

    it('censors logs of lat and lng info for mds-logger.error', () => {
      const error = jest.spyOn(pinoLogger, 'error').mockImplementation(() => {
        return
      })

      logger.error('some message', toCensor)
      expect(error).toHaveBeenCalledWith(expected)
    })

    it('applies fuzzy logic', () => {
      const error = jest.spyOn(pinoLogger, 'error').mockImplementation(() => {
        return
      })

      logger.error('some message', { LAT: 41.36, Longitude: -71.06 })
      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({ data: { LAT: '[REDACTED]', Longitude: '[REDACTED]' } })
      )
    })

    it('censors an arbitrary key', () => {
      const error = jest.spyOn(pinoLogger, 'error').mockImplementation(() => {
        return
      })

      createLogger('mds-logger', { redactKeys: ['device_id'] }).error('some message', toCensor)
      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            device_id: '[REDACTED]',
            gps: expect.objectContaining({ lat: '[REDACTED]' })
          })
        })
      )
    })

    it('censors an arbitrary capitalized key', () => {
      const error = jest.spyOn(pinoLogger, 'error').mockImplementation(() => {
        return
      })

      createLogger('mds-logger', { redactKeys: ['DeviceId'] }).error('some message', toCensor)
      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            device_id: '[REDACTED]',
            gps: expect.objectContaining({ lat: '[REDACTED]' })
          })
        })
      )
    })
  })

  it('verifies conversion of an error', () => {
    const err = new Error('puzzling evidence')
    logger.info('ohai2', err)

    const info = jest.spyOn(pinoLogger, 'info').mockImplementation(() => {
      return
    })

    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'mds-logger',
        data: { error: expect.stringContaining('evidence') },
        message: 'ohai2'
      })
    )
  })

  it('verifies QUIET mode', () => {
    const errorLoud = jest.spyOn(pinoLogger, 'error').mockImplementation(() => {
      return
    })
    logger.error('some message', { key1: 'key1', key2: 'key2' })
    expect(errorLoud).toHaveBeenCalled()

    process.env.QUIET = 'true'
    jest.clearAllMocks()
    const errorQuiet = jest.spyOn(pinoLogger, 'error').mockImplementation(() => {
      return
    })
    logger.error('some message', { key1: 'key1', key2: 'key2' })
    expect(errorQuiet).not.toHaveBeenCalled()
  })

  it('can write a log with only a message, and no data', () => {
    const info = jest.spyOn(pinoLogger, 'info').mockImplementation(() => {
      return
    })

    logger.info('some message')
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'mds-logger',
        message: 'some message'
      })
    )
  })
})
