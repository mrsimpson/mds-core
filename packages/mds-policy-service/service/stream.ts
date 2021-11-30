import stream, { StreamProducer } from '@mds-core/mds-stream'
import { getEnvVar } from '@mds-core/mds-utils'
import { PolicyDomainModel } from '../@types'

const { TENANT_ID } = getEnvVar({
  TENANT_ID: 'mds'
})

const policyTopic = [TENANT_ID, 'policy'].join('.')

export const PolicyStreamKafka: StreamProducer<PolicyDomainModel> =
  stream.KafkaStreamProducer<PolicyDomainModel>(policyTopic)
