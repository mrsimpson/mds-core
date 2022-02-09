/**
 * Copyright 2022 City of Los Angeles
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

import type { ApiResponse } from '@mds-core/mds-api-server'
import { Nullable } from '@mds-core/mds-types'
import { Cursor } from 'typeorm-cursor-pagination'
import { csvStreamFromRepository } from '../csv-stream'

// TODO either convert this test file to mocha, convert the others to jest, or do something weird

describe('csvStreamFromRepository', () => {
  type Getter = (options: {
    after?: string
  }) => Promise<{ rows: [{ a: string; b: number; c: Nullable<string> }]; cursor: Cursor }>
  const mockResponse = () => {
    const res = {} as unknown as ApiResponse<string>
    res.status = jest.fn().mockReturnValue(res)
    res.contentType = jest.fn().mockReturnValue(res)
    res.header = jest.fn().mockReturnValue(res)
    res.write = jest.fn().mockReturnValue(true)
    res.end = jest.fn().mockReturnValue(res)
    return res
  }

  const fields = [
    { label: 'A', value: <const>'a' },
    { label: 'B', value: <const>'b' },
    { label: 'C', value: <const>'c' }
  ]

  it('Can produce CSV from one chunk', async () => {
    const getter: Getter = jest.fn().mockReturnValueOnce({
      rows: [{ a: 'A', b: 20, c: 'NOT NULL' }],
      cursor: { beforeCursor: null, afterCursor: null }
    })

    const res = mockResponse()
    await csvStreamFromRepository(getter, {}, 'rows', res, fields)

    expect(getter).toBeCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.contentType).toHaveBeenCalledWith('text/csv')
    expect(res.header).toHaveBeenNthCalledWith(
      2,
      'Content-Disposition',
      expect.stringMatching(/^attachment; filename="rows-.*.csv"$/)
    )
    expect(res.write).toHaveBeenNthCalledWith(1, '"A","B","C"\n"A",20,"NOT NULL"')
    expect(res.end).toBeCalledTimes(1)
  })

  it('Can produce CSV from two chunks', async () => {
    const getter: Getter = jest
      .fn()
      .mockReturnValueOnce({
        rows: [{ a: 'A', b: 20, c: 'NOT NULL' }],
        cursor: { beforeCursor: null, afterCursor: 'AFTER' }
      })
      .mockReturnValueOnce({
        rows: [{ a: 'AAA', b: 400, c: null }],
        cursor: { beforeCursor: null, afterCursor: null }
      })

    const res = mockResponse()
    await csvStreamFromRepository(getter, {}, 'rows', res, fields)

    expect(getter).toBeCalledTimes(2)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.contentType).toHaveBeenCalledWith('text/csv')
    expect(res.header).toHaveBeenNthCalledWith(
      2,
      'Content-Disposition',
      expect.stringMatching(/^attachment; filename="rows-.*.csv"$/)
    )
    expect(res.write).toHaveBeenNthCalledWith(1, '"A","B","C"\n"A",20,"NOT NULL"')
    expect(res.write).toHaveBeenNthCalledWith(2, '\n"AAA",400,')
    expect(res.end).toBeCalledTimes(1)
  })

  it('Can produce CSV with picked columns', async () => {
    const getter: Getter = jest.fn().mockReturnValueOnce({
      rows: [{ a: 'A', b: 20, c: 'NOT NULL' }],
      cursor: { beforeCursor: null, afterCursor: null }
    })

    const pick_columns = [<const>'c', <const>'a']

    const res = mockResponse()
    await csvStreamFromRepository(getter, {}, 'rows', res, fields, pick_columns)

    expect(getter).toBeCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.contentType).toHaveBeenCalledWith('text/csv')
    expect(res.header).toHaveBeenNthCalledWith(
      2,
      'Content-Disposition',
      expect.stringMatching(/^attachment; filename="rows-.*.csv"$/)
    )
    expect(res.write).toHaveBeenNthCalledWith(1, '"C","A"\n"NOT NULL","A"')
    expect(res.end).toBeCalledTimes(1)
  })
})
