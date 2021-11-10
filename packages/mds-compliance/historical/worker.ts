import { parentPort } from 'worker_threads'
import { computeHistoricalCompliance } from './compute-historical-compliance'

computeHistoricalCompliance()
  .then(result => {
    parentPort?.postMessage(result)
    return result
  })
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  .catch(err => {
    parentPort?.postMessage(err)
  })
