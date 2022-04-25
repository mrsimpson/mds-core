import { now } from '@mds-core/mds-utils'
import type { Consumer } from 'kafkajs'
import { heartbeatCheck } from '../kafka/stream-consumer'

const DEFAULT_KAFKA_HEARTBEAT_TIMEOUT_MS = 60_000

describe('Tests health checking', () => {
  it('Verifies that healthStatus is updated to healthy when heartbeat is received in time', async () => {
    const last_updated = now() - (DEFAULT_KAFKA_HEARTBEAT_TIMEOUT_MS - 1000)

    const healthStatus = { components: {} }

    await heartbeatCheck(
      {
        describeGroup: async () => ({
          groupId: 'test'
        }),
        disconnect: async () => Promise.resolve()
      } as Consumer,
      healthStatus,
      last_updated
    )

    expect(healthStatus).toMatchObject({
      components: expect.objectContaining({
        'kafka-consumer-test': expect.objectContaining({
          last_updated: expect.any(Number),
          healthy: true
        })
      })
    })
  })

  it('Verifies that healthStatus is updated to unhealthy when heartbeat is missed', async () => {
    const last_updated = now() - (DEFAULT_KAFKA_HEARTBEAT_TIMEOUT_MS + 1000)

    const healthStatus = { components: {} }

    await heartbeatCheck(
      {
        describeGroup: async () => ({
          groupId: 'test'
        }),
        disconnect: async () => Promise.resolve()
      } as Consumer,
      healthStatus,
      last_updated
    )

    expect(healthStatus).toMatchObject({
      components: expect.objectContaining({
        'kafka-consumer-test': expect.objectContaining({
          last_updated: expect.any(Number),
          message: expect.stringContaining('The Kafka consumer has not sent a heartbeat to the coordinator in over'),
          healthy: false
        })
      })
    })
  })
})
