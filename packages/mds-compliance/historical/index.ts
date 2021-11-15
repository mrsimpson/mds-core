import { ProcessManager } from '@mds-core/mds-service-helpers'
import { Worker } from 'worker_threads'
import { providers } from '@mds-core/mds-providers'
import { dateAsMillis } from './input-handlers'

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
      THREAD_COUNT,
      THREAD_MODEL
    } = process.env

    const threadCount = THREAD_COUNT ? parseInt(THREAD_COUNT) : 1

    if (THREAD_MODEL && !['provider', 'datetime'].includes(THREAD_MODEL)) {
      throw new Error(`Invalid THREAD_MODEL: ${THREAD_MODEL}`)
    }

    if (!startDateUnparsed || !endDateUnparsed || !intervalUnparsed) {
      throw new Error('Invalid start date and/or end date')
    }

    let runningWorkers = threadCount

    if (THREAD_MODEL === 'provider') {
      const startDate = dateAsMillis(startDateUnparsed)
      const endDate = dateAsMillis(endDateUnparsed)

      const provider_ids_split = (() => {
        const ephemeralProviderIds = providerIdsUnparsed?.split(',') ?? Object.keys(providers)

        return spliceIntoChunks(ephemeralProviderIds, Math.ceil(ephemeralProviderIds.length / threadCount))
      })()

      console.log(
        `Detected provider threading strategy. Worker threads will be created with provider_id partitions: ${provider_ids_split}`
      )
      /* const workers = */ provider_ids_split.map(provider_ids => {
        const worker = new Worker('./historical/worker.js', {
          workerData: { startDate, endDate, intervalUnparsed, provider_ids }
        })
        worker.on('exit', exitCode => {
          console.log(`Worker exited with code ${exitCode}`)
          runningWorkers--

          if (runningWorkers <= 0) process.exit(0)
        })
        return worker
      })
    }

    if (THREAD_MODEL === 'datetime') {
      const provider_ids = providerIdsUnparsed?.split(',') ?? Object.keys(providers)
      const datePartitions = (() => {
        const startDate = dateAsMillis(startDateUnparsed)
        const endDate = dateAsMillis(endDateUnparsed)

        /** Range for each datetime partition */
        const range = (endDate - startDate) / threadCount

        const partitions: [start_date: number, end_date: number][] = Array.from({ length: threadCount }, (_, i) => {
          const baseStartDate = startDate + i * range
          const baseEndDate = startDate + (i + 1) * range

          // adjust start date and end date to closest 5 minute interval
          const adjustedStartDate = Math.floor(baseStartDate / 300000) * 300000
          const adjustedEndDate = Math.floor(baseEndDate / 300000) * 300000

          return [adjustedStartDate, adjustedEndDate]
        })

        return partitions
      })()

      console.log(
        `Detected datetime threading strategy. Worker threads will be created with partitions: ${datePartitions}`
      )

      /* const workers = */ datePartitions.map(([startDate, endDate]) => {
        const worker = new Worker('./historical/worker.js', {
          workerData: { startDate, endDate, intervalUnparsed, provider_ids }
        })
        worker.on('exit', exitCode => {
          console.log(`Worker exited with code ${exitCode}`)
          runningWorkers--

          if (runningWorkers <= 0) process.exit(0)
        })
        return worker
      })
    }
  },
  stop: async () => process.exit(0)
}).monitor()
