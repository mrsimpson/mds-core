import { readFileSync, existsSync, writeFileSync } from 'fs'
import { DateTime, Duration } from 'luxon'
import hash from 'object-hash'
import { Timestamp } from '@mds-core/mds-types'
import { workerData } from 'worker_threads'

export const dateAsMillis = (date: string) => DateTime.fromISO(date, { zone: 'America/Los_Angeles' }).toMillis()

export const getRawInputs = () => {
  const { startDate, endDate, intervalUnparsed, provider_ids } = workerData

  console.log('Inputs for thread:', workerData)

  if (!startDate || !endDate || !intervalUnparsed) {
    throw new Error('Invalid start date and/or end date')
  }

  const writeCheckpoint = (currentDate: Timestamp) => {
    writeFileSync(
      `checkpoint-${inputsHashed}.json`,
      JSON.stringify({
        startDate,
        endDate,
        intervalUnparsed,
        provider_ids,
        checkpointUnparsed: DateTime.fromMillis(currentDate, { zone: 'America/Los_Angeles' }).toISO()
      })
    )
  }

  const interval = Duration.fromISO(intervalUnparsed).toMillis()

  const inputs = { startDate, endDate, intervalUnparsed, provider_ids }
  const inputsHashed = hash(inputs)

  if (existsSync(`checkpoint-${inputsHashed}.json`)) {
    const { checkpointUnparsed } = JSON.parse(readFileSync(`checkpoint-${inputsHashed}.json`).toString())

    console.log(`Found checkpoint for: ${JSON.stringify(inputs)}, setting startDate to ${checkpointUnparsed}`)

    const checkpoint = DateTime.fromISO(checkpointUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
    return { startDate: checkpoint, endDate, interval, provider_ids, inputsHashed, writeCheckpoint }
  }

  return { startDate, endDate, interval, inputsHashed, provider_ids, writeCheckpoint }
}
