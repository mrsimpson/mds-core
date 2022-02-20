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

import { Enum, isEnum } from '../index'

const values = ['one', 'two', 'three']

const numbers = Enum(...values)

describe('Tests Enums', () => {
  it('Verifies valid enum values', async () => {
    expect(values.reduce((isValid, value) => isValid && isEnum(numbers, value), true)).toBe(true)
    expect(Object.keys(numbers).reduce((isValid, value) => isValid && isEnum(numbers, value), true)).toBe(true)
  })

  it('Verifies missing enum value', async () => {
    expect(isEnum(numbers, 'four')).toBe(false)
  })

  it('Verifies invalid numeric enum value', async () => {
    expect(isEnum(numbers, 4)).toBe(false)
  })

  it('Verifies invalid null enum value', async () => {
    expect(isEnum(numbers, null)).toBe(false)
  })

  it('Verifies invalid undefined enum value', async () => {
    expect(isEnum(numbers, undefined)).toBe(false)
  })

  it('Verifies invalid object enum value', async () => {
    expect(isEnum(numbers, { one: 'one' })).toBe(false)
  })
})
