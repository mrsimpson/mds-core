import { tripHandler } from './src/proc-trip'
import db from '@mds-core/mds-db'

async function processData() {
  // make sure the tables exist
  await db.initialize()
  console.log('INIT')
  await tripHandler()
}

export const main = () => {
  processData()
}
