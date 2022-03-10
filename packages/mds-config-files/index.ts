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

import { NotFoundError, UnsupportedTypeError } from '@mds-core/mds-utils'
import { cleanEnv, str } from 'envalid'
import fs from 'fs'
import JSON5 from 'json5'
import { homedir } from 'os'
import { format, normalize } from 'path'
import { promisify } from 'util'

const readFileAsync = promisify(fs.readFile)

const readFile = async (path: string): Promise<string> => {
  try {
    return await readFileAsync(path, { encoding: 'utf8' })
  } catch {
    throw new NotFoundError(`File Not Found: ${path}`, { path })
  }
}

const readJsonFile = <T>(path: string) => ({
  parsedUsing: async (parser: Pick<JSON, 'parse'>): Promise<T> => {
    const file = await readFile(path)
    try {
      return parser.parse(file) as T
    } catch {
      throw new UnsupportedTypeError(`Expected ${parser === JSON ? 'JSON' : 'JSON5'} File: ${path}`, { path })
    }
  }
})

const fileExists = (path: string) => fs.existsSync(path)

export const ConfigFileReader = {
  mount: (path?: string) => {
    const dir = (
      path ?? cleanEnv(process.env, { MDS_CONFIG_PATH: str({ default: '/mds-config' }) }).MDS_CONFIG_PATH
    ).replace('~', homedir())

    if (!fileExists(dir)) {
      throw new NotFoundError(`Mount Path Not Found: ${dir}`, { path: dir })
    }

    const getFilePath = (name: string, ext?: string): string => {
      const extension = ext && ext.startsWith('.') ? ext : `.${ext}`
      return normalize(format({ dir, name, ext: extension }))
    }

    return {
      path: dir,
      fileExists: (name: string, ext?: string) => fileExists(getFilePath(name, ext)),
      readFile: async (name: string, ext?: string) => readFile(getFilePath(name, ext)),
      jsonFileExists: (name: string) => fileExists(getFilePath(name, 'json')) || fileExists(getFilePath(name, 'json5')),
      readJsonFile: async <T>(name: string): Promise<T> => {
        try {
          return await readJsonFile<T>(getFilePath(name, 'json5')).parsedUsing(JSON5)
        } catch (error) {
          if (error instanceof NotFoundError) {
            return readJsonFile<T>(getFilePath(name, 'json')).parsedUsing(JSON)
          }
          throw error
        }
      }
    }
  }
}
