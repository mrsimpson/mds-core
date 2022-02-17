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

import { NullablePropertyValue, OptionalPropertyValue, PropertyValue } from '../filters'

describe('Test Filters', () => {
  it('Test Scalar PropertyValue', async () => {
    const filter = PropertyValue('property', 'scalar')
    expect(filter).toHaveProperty('property')
    expect(filter.property).toHaveProperty('_type', 'equal')
    expect(filter.property).toHaveProperty('value', 'scalar')
  })

  it('Test Array PropertyValue', async () => {
    const filter = PropertyValue('property', ['array'])
    expect(filter).toHaveProperty('property')
    expect(filter.property).toHaveProperty('_type', 'in')
    expect(filter.property).toHaveProperty('value', ['array'])
  })

  it('Test NullablePropertyValue (null)', async () => {
    const filter = NullablePropertyValue('property', null)
    expect(filter).toHaveProperty('property')
    expect(filter.property).toHaveProperty('_type', 'isNull')
  })

  it('Test NullablePropertyValue (value)', async () => {
    const filter = NullablePropertyValue('property', 'scalar')
    expect(filter).toHaveProperty('property')
    expect(filter.property).toHaveProperty('_type', 'equal')
    expect(filter.property).toHaveProperty('value', 'scalar')
  })

  it('Test OptionalPropertyValue (undefined)', async () => {
    const filter = OptionalPropertyValue(NullablePropertyValue, 'property', undefined)
    expect(filter).toEqual({})
  })

  it('Test OptionalPropertyValue (null)', async () => {
    const filter = OptionalPropertyValue(NullablePropertyValue, 'property', null)
    expect(filter).toHaveProperty('property')
    expect(filter.property).toHaveProperty('_type', 'isNull')
  })
})
