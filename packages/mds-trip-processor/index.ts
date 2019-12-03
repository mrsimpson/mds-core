import log from '@mds-core/mds-logger'
import { tripHandler } from './src/proc-trip'

async function processData() {
  log.info('INIT')
  await tripHandler()
}

export const main = () => {
  /* eslint-reason FIXME need to refactor */
  /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
  processData()
}
