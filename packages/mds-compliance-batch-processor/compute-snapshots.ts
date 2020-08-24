import * as fs from 'fs'
import logger from '@mds-core/mds-logger'
import * as yargs from 'yargs'
import { Policy, Geography, VehicleEvent, Device } from '@mds-core/mds-types'
import { validateEvents, validateGeographies, validatePolicies } from '@mds-core/mds-schema-validators'
import db from '@mds-core/mds-db'
import * as compliance_engine from './engine/mds-compliance-engine'

import { ComplianceResponse } from './types'
import { getSupersedingPolicies, processPolicy, getRecentEvents } from './mds-compliance-engine'

// Get all currently active policies that have not been superseded
async function getPolicies() {
  const activePolicies = await db.readActivePolicies()
  compliance_engine.getSupersedingPolicies(activePolicies)
}
