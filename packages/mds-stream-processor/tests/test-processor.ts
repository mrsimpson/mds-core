import { ApiServer, HttpServer } from '@mds-core/mds-api-server'
import { ProcessManager } from '@mds-core/mds-service-helpers'
import { getEnvVar, isOneDimensionalArray } from '@mds-core/mds-utils'
import type { DeadLetterSink, StreamSink, StreamTransform } from '../@types'
import { KafkaBatchSource, KafkaSink } from '../connectors'
import { ProcessorController, StreamProcessor } from '../index'
import { StreamProcessorLogger } from '../logger'

const { TENANT_ID } = getEnvVar({
  TENANT_ID: 'mds'
})

const MetricsTopic = `${TENANT_ID}.metrics.stuff`

export type StreamModel = {
  name: string
  count: number
}

export const TestProcessor = () => {
  /**
   * MUTABLE health status
   */
  const healthStatus = { components: {} }

  const processMetrics: StreamTransform<StreamModel[], StreamModel[]> = async metrics => {
    try {
      return metrics
    } catch (error) {
      StreamProcessorLogger.error(`Error processing ${MetricsTopic} message`, { metrics, error })
      throw error
    }
  }

  const MetricsSink = (): StreamSink<StreamModel[]> => () => {
    return {
      initialize: async () => undefined,
      write: async metricsList => {
        try {
          if (isOneDimensionalArray(metricsList)) {
            StreamProcessorLogger.info(`Wrote ${metricsList.length} Metrics metrics to MetricsSink`, {
              first: metricsList[0]
            })
          } else {
            for (const metrics of metricsList) {
              StreamProcessorLogger.info(`Wrote ${metrics.length} Metrics metrics to MetricsSink`, {
                first: metrics[0]
              })
            }
          }
        } catch (error) {
          StreamProcessorLogger.error('MetricsSink Error', { metricsList, error })
          throw error
        }
      },
      shutdown: async () => undefined
    }
  }

  const MetricsDeadLetterSink: DeadLetterSink<StreamModel[]> = KafkaSink(`${MetricsTopic}.error`, {
    clientId: `${TENANT_ID}.mds.event-processor`
  })

  const TestProcessor = StreamProcessor(
    KafkaBatchSource<StreamModel>(MetricsTopic, {
      groupId: `${TENANT_ID}.mds.metrics-test-processor-processor1`,
      healthStatus,
      fromBeginning: true
    }),
    processMetrics,
    [MetricsSink()],
    [MetricsDeadLetterSink]
  )

  return ProcessManager({
    start: async () => {
      HttpServer(
        ApiServer(app => app, { healthStatus }),
        { port: process.env.TEST_PROCESSOR_HTTP_PORT }
      )
      await TestProcessor.start()
    },
    stop: async () => {
      await TestProcessor.stop()
    }
  }).controller()
}

ProcessorController.start(TestProcessor())
