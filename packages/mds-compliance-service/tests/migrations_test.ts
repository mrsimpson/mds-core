import { createConnection, ConnectionOptions } from 'typeorm'
import { ComplianceResponseRepository } from '../repository'
import { COMPLIANCE_RESPONSE_1, COMPLIANCE_RESPONSE_ID } from './compliance_response_fixtures'

import ormconfig = require('../ormconfig')

describe('Test Migrations', () => {
  const options = ormconfig as ConnectionOptions
  it(`Run Migrations for compliance`, async () => {
    const connection = await createConnection(options)
    await connection.runMigrations()
    await connection.close()
  })

  it(`has the repository write a compliance response`, async () => {
    await ComplianceResponseRepository.writeComplianceResponse(COMPLIANCE_RESPONSE_1)
  })

  it(`has the repository read a compliance response`, async () => {
    const result = await ComplianceResponseRepository.getComplianceResponse({
      compliance_response_id: COMPLIANCE_RESPONSE_ID
    })
    console.log(result)
  })

  it(`Revert Migrations ${options.name}`, async () => {
    const connection = await createConnection(options)
    await connection.migrations.reduce(p => p.then(() => connection.undoLastMigration()), Promise.resolve())
    await connection.close()
  })
})
