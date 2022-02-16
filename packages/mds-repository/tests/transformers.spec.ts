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

import { BigintTransformer, UppercaseTransformer } from '../transformers'

describe('Test Transformers', () => {
  it('BigIntTransformer', async () => {
    expect(BigintTransformer.to(1)).toEqual(1)
    expect(BigintTransformer.to(null)).toEqual(null)
    expect(BigintTransformer.to([1, null])).toEqual([1, null])
    expect(BigintTransformer.from('1')).toEqual(1)
    expect(BigintTransformer.from(null)).toEqual(null)
    expect(BigintTransformer.from(['1', null])).toEqual([1, null])
  })

  it('UppercaseTransformer', async () => {
    expect(UppercaseTransformer.to('a')).toEqual('A')
    expect(UppercaseTransformer.to('A')).toEqual('A')
    expect(UppercaseTransformer.to(null)).toEqual(null)
    expect(UppercaseTransformer.to(['a', 'A', null])).toEqual(['A', 'A', null])
    expect(UppercaseTransformer.from('a')).toEqual('A')
    expect(UppercaseTransformer.from('A')).toEqual('A')
    expect(UppercaseTransformer.from(null)).toEqual(null)
    expect(UppercaseTransformer.from(['a', 'A', null])).toEqual(['A', 'A', null])
  })
})
