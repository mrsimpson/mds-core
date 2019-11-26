import { providerHandler } from './src/proc-provider'
import db from '@mds-core/mds-db'

async function processData() {
  // make sure the tables exist
  await db.initialize()
  console.log('INIT')
  await providerHandler()
}

export const main = () => {
  processData()
}
