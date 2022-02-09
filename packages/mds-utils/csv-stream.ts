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
import { StatusCodes } from 'http-status-codes'
import { Parser } from 'json2csv'
import { DateTime } from 'luxon'
import { DeepPickPath } from 'ts-deep-pick'
import { Cursor } from 'typeorm-cursor-pagination'
import { deepPickProperties } from './deep-pick-properties'

type RowsWithCursor<Row, RowsKey extends string> = {
  [key in RowsKey]: Row[]
} & { cursor: Cursor }

export const csvStreamFromRepository = async <
  Row,
  RowsKey extends string,
  Opts extends { after?: string },
  Col extends DeepPickPath<Row>,
  R extends ApiResponse<string>
>(
  getter: (options: Opts) => Promise<RowsWithCursor<Row, RowsKey>>,
  getterOptions: Opts,
  rowsKey: RowsKey,
  res: R,
  fields: Array<{ label: string; value: Col }>,
  pick_columns?: Array<Col>
) => {
  if (getterOptions.after !== undefined) {
    throw 'Must pass first options without cursor'
  }
  const conf = {
    fields: pick_columns
      ? fields
          .filter(({ value }) => pick_columns.includes(value))
          .sort((a, b) => pick_columns.indexOf(a.value) - pick_columns.indexOf(b.value))
      : fields
  }
  const parser = new Parser(conf)

  const { [rowsKey]: rows, cursor } = await getter(getterOptions)

  const chunk = pick_columns ? rows.map(row => deepPickProperties(row, pick_columns)) : rows

  res
    .status(StatusCodes.OK)
    .contentType('text/csv')
    .header('Access-Control-Expose-Headers', 'Content-Disposition')
    .header(
      'Content-Disposition',
      `attachment; filename="${rowsKey}-${DateTime.now().toFormat('yyyy-LL-dd hh.mm.ss a')}.csv"`
    )
    .write(parser.parse(chunk))

  let next = cursor.afterCursor
  const headlessParser = new Parser({
    header: false,
    ...conf
  })
  while (next !== null) {
    const { [rowsKey]: rows, cursor: current } = await getter({
      ...getterOptions,
      after: next
    })
    const chunk = pick_columns ? rows.map(row => deepPickProperties(row, pick_columns)) : rows
    res.write('\n' + headlessParser.parse(chunk))
    next = current.afterCursor
  }
  return res.end()
}
