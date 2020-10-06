import * as fs from 'fs'
import logger from '@mds-core/mds-logger'
import * as yargs from 'yargs'
import { Policy, Geography, VehicleEvent, Device, UUID, Timestamp } from '@mds-core/mds-types'
import { validateEvents, validateGeographies, validatePolicies } from '@mds-core/mds-schema-validators'
import db from '@mds-core/mds-db'
import { providers } from '@mds-core/mds-providers'
import { ComplianceResponse } from '@mds-core/mds-compliance-service'
import { now, UUID_REGEX } from '@mds-core/mds-utils'
import { time } from 'console'
import { processPolicy, getSupersedingPolicies, getRecentEvents } from './engine/mds-compliance-engine'

import { getComplianceInputs } from './engine/helpers'

// Get all currently active policies that have not been superseded
async function getPolicies() {
  const activePolicies = await db.readActivePolicies()
  return getSupersedingPolicies(activePolicies)
}

async function computeComplianceResponse(
  provider: UUID,
  policy: Policy,
  timestamp: Timestamp
): Promise<ComplianceResponse | undefined> {
  const { filteredEvents, geographies, deviceMap } = await getComplianceInputs(provider, timestamp)
  return processPolicy(policy, filteredEvents, geographies, deviceMap)
}

async function computeProviderSnapshot(
  provider: UUID,
  policies: Policy[],
  timestamp: Timestamp
): Promise<(ComplianceResponse | undefined)[]> {
  const result = await Promise.all(policies.map(policy => computeComplianceResponse(provider, policy, timestamp)))
  return result
}

async function main(): Promise<null> {
  const policies = await getPolicies()
  const timestamp = now()

  await Promise.all(
    Object.keys(providers).map(provider => {
      const result = computeProviderSnapshot(provider, policies, timestamp)
    })
  )
  return null
}

main()
  .then(result => logger.info('finito'))
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  .catch(err => logger.error(err))
