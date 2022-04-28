import { ValidationError } from '@mds-core/mds-utils'
import type { WithCursorOptions } from '../../@types'

export const base64encode = (data: string) => Buffer.from(data, 'utf-8').toString('base64')
export const base64decode = (data: string) => Buffer.from(data, 'base64').toString('utf-8')

export const buildCursor = <T extends {}>(options: WithCursorOptions<T>) => base64encode(JSON.stringify(options))

export const parseCursor = <T extends {}>(cursor: string): WithCursorOptions<T> => {
  try {
    return JSON.parse(base64decode(cursor))
  } catch (error) {
    throw new ValidationError('Invalid cursor', error)
  }
}
