import { ComplianceResponseRepository } from './service/repositories/compliance-response'

module.exports = ComplianceResponseRepository.cli({ migrationsDir: 'service/repository/migrations' })
