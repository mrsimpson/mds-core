import { MDSPolicy } from '@mds-core/mds-types'
import fs from 'fs'

export async function readJson(path: string): Promise<MDSPolicy[]> {
  return Promise.resolve(JSON.parse(fs.readFileSync(path).toString()))
}
