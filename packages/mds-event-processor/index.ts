//TODO break out into util dir for use by all processors
import { event_handler } from './src/proc-event'
//import { trip_handler } from './src/proc-trip'
//import { provider_handler } from './src/proc-provider'
import db from '@mds-core/mds-db'
import * as yargs from 'yargs'

const args = yargs.options('type', {
  alias: 't',
  demand: true,
  description: 'Option flag for which processor to run',
  type: 'string'
}).argv

async function processData(type: string) {
  // just make sure the tables exist
  await db.initialize()
  console.log('INIT')
  switch (type) {
    case 'event':
      console.log('EVENT')
      await event_handler()
      break
    /*
    case 'trip':
      console.log('TRIP')
      await trip_handler()
      break
    case 'provider':
      console.log('PROVIDER')
      await provider_handler()
      break
    */
  }
}

export const main = () => {
  if (args.type) {
    processData(args.type)
  } else {
    console.error('no type specified!')
  }
}
