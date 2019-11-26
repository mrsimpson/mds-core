import { providerHandler } from './src/proc-provider'
import db from '@mds-core/mds-db'
import log from '@mds-core/mds-logger'

async function processData() {
  // make sure the tables exist
  await db.initialize()
  log.info('INIT')
  await providerHandler()
}

export const main = () => {
  processData()
}
