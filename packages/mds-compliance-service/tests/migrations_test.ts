import { createConnection, ConnectionOptions } from 'typeorm'
import ormconfig = require('../ormconfig')

describe('Test Migrations', () => {
  const options = ormconfig as ConnectionOptions
  it(`Run Migrations for compliance`, async () => {
    const connection = await createConnection(options)
    await connection.runMigrations()
    await connection.close()
  })

  it(`Revert Migrations ${options.name}`, async () => {
    const connection = await createConnection(options)
    await connection.migrations.reduce(p => p.then(() => connection.undoLastMigration()), Promise.resolve())
    await connection.close()
  })
})
