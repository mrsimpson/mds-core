import { ComplianceRepository } from './service/repositories/compliance/entities'

module.exports = ComplianceRepository.cli({ migrationsDir: 'service/repository/migrations' })
