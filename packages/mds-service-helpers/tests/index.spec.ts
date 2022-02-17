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

import { ValidationError } from '@mds-core/mds-utils'
import { isError, UnwrapServiceResult } from '../client'
import { isServiceError, ProcessManager, ServiceError, ServiceException, ServiceResult } from '../index'

describe('Tests Service Helpers', () => {
  it('ServiceResult', async () => {
    const { result } = ServiceResult('success')
    expect(result).toEqual('success')
  })

  it('ServiceError', async () => {
    const { error } = ServiceError({ type: 'ValidationError', message: 'Validation Error' })
    expect(error).toMatchObject({ type: 'ValidationError', message: 'Validation Error' })
  })

  it('ServiceException', async () => {
    const { error } = ServiceException('Validation Error')
    expect(error).toMatchObject({ type: 'ServiceException', message: 'Validation Error' })
  })

  it('ServiceException (with Error)', async () => {
    const { error } = ServiceException('Validation Error', Error('Error Message'))
    expect(error).toMatchObject({ type: 'ServiceException', message: 'Validation Error', details: 'Error Message' })
  })

  it('UnwrapServiceResult ServiceResult', async () => {
    const result = await UnwrapServiceResult(async () => ServiceResult('success'))()
    expect(result).toEqual('success')
  })

  it('Catch ServiceError', async () => {
    await expect(
      UnwrapServiceResult(async () => ServiceError({ type: 'ValidationError', message: 'Validation Error' }))
    ).rejects.toMatchObject({ type: 'ValidationError', message: 'Validation Error' })
  })

  it('Custom ServiceError type', async () => {
    const { error } = ServiceError({ type: 'CustomError', message: 'Custom Error Message' })
    expect(isServiceError(error, 'CustomError')).toEqual(true)
  })

  it('Tests isError', () => {
    const { error } = ServiceError({ type: 'ValidationError', message: 'Validation Error' })
    expect(isError(error, ValidationError)).toEqual(true)
    expect(isError(new ValidationError(), ValidationError)).toEqual(true)
  })

  it('ServiceError type guard', async () => {
    try {
      const error = Error('Error')
      expect(isServiceError(ServiceException('Error', error).error)).toEqual(true)
      throw error
    } catch (error) {
      expect(isServiceError(error)).toEqual(false)
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Test ServiceManager Controller', async () => {
    let started = false
    const controller = ProcessManager({
      start: async () => {
        started = true
      },
      stop: async () => {
        started = false
      }
    }).controller()
    await controller.start()
    expect(started).toEqual(true)
    await controller.stop()
    expect(started).toEqual(false)
  })
})
