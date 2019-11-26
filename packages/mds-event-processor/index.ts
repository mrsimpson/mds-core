import { eventHandler } from './src/proc-event'
import db from '@mds-core/mds-db'

async function processData() {
  // make sure the tables exist
  await db.initialize()
  console.log('INIT')
  await eventHandler()
}

export const main = () => {
  processData()
}
