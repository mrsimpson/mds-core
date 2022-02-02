import { ApiServer, HttpServer } from '@mds-core/mds-api-server'
import { ProcessManager } from '@mds-core/mds-service-helpers'
import { minutes, now } from '@mds-core/mds-utils'
import type express from 'express'
import { computeSnapshot } from './batch_process'
import { ComplianceBatchProcessorLogger } from './logger'

ProcessManager(
  {
    start: async () => {
      HttpServer(
        ApiServer((app: express.Express): express.Express => app),
        { port: process.env.MDS_COMPLIANCE_BATCH_PROCESSOR_HTTP_PORT }
      )
      try {
        const start = now()
        await computeSnapshot()
        const end = now()
        ComplianceBatchProcessorLogger.debug(`mds-compliance-engine time metrics`, {
          start,
          end,
          durationMs: end - start
        })

        process.exit(0)
      } catch (error) {
        ComplianceBatchProcessorLogger.error('mds-compliance-engine ran into an error, retrying', { error })
        throw error
      }
    },
    /**
     * Usually this is called to stop the process, but the snapshot computation stops itself,
     * so we leave this empty.
     */
   stop: async () => { } // eslint-disable-line
  },
  { retries: 3, maxTimeout: minutes(15) }
).monitor()
