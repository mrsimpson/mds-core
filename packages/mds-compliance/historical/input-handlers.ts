import { readFileSync, existsSync, writeFileSync } from 'fs'
import { DateTime, Duration } from 'luxon'
import hash from 'object-hash'
import { Timestamp } from '@mds-core/mds-types'

export const getRawInputs = () => {
  const { START_DATE: startDateUnparsed, END_DATE: endDateUnparsed, INTERVAL: intervalUnparsed } = process.env

  if (!startDateUnparsed || !endDateUnparsed || !intervalUnparsed) {
    throw new Error('Invalid start date and/or end date')
  }

  const writeCheckpoint = (currentDate: Timestamp) => {
    writeFileSync(
      `checkpoint-${inputsHashed}.json`,
      JSON.stringify({
        startDateUnparsed,
        endDateUnparsed,
        intervalUnparsed,
        checkpointUnparsed: DateTime.fromMillis(currentDate, { zone: 'America/Los_Angeles' }).toISO()
      })
    )
  }

  const startDate = DateTime.fromISO(startDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const endDate = DateTime.fromISO(endDateUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
  const interval = Duration.fromISO(intervalUnparsed).toMillis()

  const inputs = { startDateUnparsed, endDateUnparsed, intervalUnparsed }
  const inputsHashed = hash(inputs)

  if (existsSync(`checkpoint-${inputsHashed}.json`)) {
    const { checkpointUnparsed } = JSON.parse(readFileSync(`checkpoint-${inputsHashed}.json`).toString())

    console.log(`Found checkpoint for: ${JSON.stringify(inputs)}, setting startDate to ${checkpointUnparsed}`)

    const checkpoint = DateTime.fromISO(checkpointUnparsed, { zone: 'America/Los_Angeles' }).toMillis()
    return { startDate: checkpoint, endDate, interval, inputsHashed, writeCheckpoint }
  }

  return { startDate, endDate, interval, inputsHashed, writeCheckpoint }
}
