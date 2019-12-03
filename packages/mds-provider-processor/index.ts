import log from '@mds-core/mds-logger'
import { providerHandler } from './src/proc-provider'

async function processData() {
  log.info('INIT')
  await providerHandler()
}

export const main = () => {
  /* eslint-reason FIXME need to refactor */
  /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
  processData()
}
