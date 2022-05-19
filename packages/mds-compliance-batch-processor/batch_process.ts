/**
 * Copyright 2021 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getProviderInputs, getSupersedingPolicies, processPolicy } from '@mds-core/mds-compliance-engine'
import type { ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import { ComplianceServiceClient } from '@mds-core/mds-compliance-service'
import type { GeographyDomainModel } from '@mds-core/mds-geography-service'
import { GeographyServiceClient } from '@mds-core/mds-geography-service'
import { PolicyServiceClient } from '@mds-core/mds-policy-service'
import { ProviderServiceClient } from '@mds-core/mds-provider-service'
import type { SerializedBuffers } from '@mds-core/mds-service-helpers'
import { now } from '@mds-core/mds-utils'
import { ComplianceBatchProcessorLogger } from './logger'

const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 5

async function batchComplianceSnapshots(snapshots: ComplianceSnapshotDomainModel[]) {
  let count = 0
  const computeSnapshotPromises: Promise<SerializedBuffers<ComplianceSnapshotDomainModel>[]>[] = []
  while (count < snapshots.length) {
    const batch = snapshots.slice(count, count + BATCH_SIZE)
    computeSnapshotPromises.push(ComplianceServiceClient.createComplianceSnapshots(batch))
    count += BATCH_SIZE
  }
  await Promise.all(computeSnapshotPromises)
}

export async function computeSnapshot() {
  const policies = getSupersedingPolicies(await PolicyServiceClient.readActivePolicies(now()))
  const geographies: GeographyDomainModel[] = await GeographyServiceClient.getPublishedGeographies({
    includeMetadata: false
  })
  const compliance_as_of = now() // The timestamp right after we fetch the inputs (latest state as of that time)

  const provider_ids = (await ProviderServiceClient.getProviders({})).map(p => p.provider_id)

  /**
   * This is intentionally an async (for) loop, as opposed to being concurrent (Promise.all()).
   * This is to avoid potential memory overflows if multiple providers' data is loaded into memory simultaneously.
   */
  for (const provider_id of provider_ids) {
    const providerInputs = {
      [provider_id]: await getProviderInputs(provider_id, compliance_as_of)
    }

    const snapshots = []
    for (const policy of policies) {
      /* If possible, force garbage collection between each policy.
       * In old releases, it was possible to run into situations where the GC was not invoked often enough, and the memory usage was too high.
       */
      if (global.gc) {
        const convertBytesToMB = (bytes: number) => Math.round(bytes / 1024 / 1024)
        const memoryUsagePreGc = Object.fromEntries(
          Object.entries(process.memoryUsage()).map(([key, value]) => [key, `${convertBytesToMB(value)} MB`])
        )
        ComplianceBatchProcessorLogger.debug(`Memory usage pre garbage collection: ${JSON.stringify(memoryUsagePreGc)}`)
        ComplianceBatchProcessorLogger.debug('Garbage collecting...')
        global.gc()
        const memoryUsagePostGc = Object.fromEntries(
          Object.entries(process.memoryUsage()).map(([key, value]) => [key, `${convertBytesToMB(value)} MB`])
        )
        ComplianceBatchProcessorLogger.debug(
          `Memory usage post garbage collection: ${JSON.stringify(memoryUsagePostGc)}`
        )
      }

      const policySnapshots = await processPolicy(policy, geographies, providerInputs, compliance_as_of)
      snapshots.push(...policySnapshots)
    }

    await batchComplianceSnapshots(snapshots)
  }

  ComplianceBatchProcessorLogger.info(
    'mds-compliance-engine successfully computed snapshots for the following policies: ',
    {
      policy_ids: policies.map(p => p.policy_id)
    }
  )
}
