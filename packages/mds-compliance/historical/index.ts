import { ProcessManager } from '@mds-core/mds-service-helpers'
import { computeHistoricalCompliance } from './compute-historical-compliance'

ProcessManager({
  start: async () => {
    await computeHistoricalCompliance()
    process.exit(0)
  },
  stop: async () => process.exit(0)
}).monitor()
