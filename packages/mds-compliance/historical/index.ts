import { ProcessManager } from '@mds-core/mds-service-helpers'
import { Worker } from 'worker_threads'
import { providers } from '@mds-core/mds-providers'

const spliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  const res = []
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize)
    res.push(chunk)
  }
  return res
}

ProcessManager({
  start: async () => {
    const {
      START_DATE: startDateUnparsed,
      END_DATE: endDateUnparsed,
      INTERVAL: intervalUnparsed,
      PROVIDER_IDS: providerIdsUnparsed,
      THREAD_COUNT
    } = process.env

    const threadCount = THREAD_COUNT ? parseInt(THREAD_COUNT) : 1

    if (!startDateUnparsed || !endDateUnparsed || !intervalUnparsed) {
      throw new Error('Invalid start date and/or end date')
    }

    const provider_ids_split = (() => {
      const ephemeralProviderIds = providerIdsUnparsed?.split(',') ?? Object.keys(providers)

      return spliceIntoChunks(ephemeralProviderIds, Math.ceil(ephemeralProviderIds.length / threadCount))
    })()

    let runningWorkers = threadCount

    /* const workers = */ provider_ids_split.map(provider_ids => {
      const worker = new Worker('./historical/worker.js', {
        workerData: { startDateUnparsed, endDateUnparsed, intervalUnparsed, provider_ids }
      })
      worker.on('exit', exitCode => {
        console.log(`Worker exited with code ${exitCode}`)
        runningWorkers--

        if (runningWorkers <= 0) process.exit(0)
      })
      return worker
    })
  },
  stop: async () => process.exit(0)
}).monitor()
