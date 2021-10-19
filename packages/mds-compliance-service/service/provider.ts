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

import { providerName } from '@mds-core/mds-providers'
import { ProcessController, ServiceException, ServiceProvider, ServiceResult } from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { isDefined } from '@mds-core/mds-utils'
import {
  ComplianceAggregateDomainModel,
  ComplianceService,
  ComplianceViolationPeriodDomainModel,
  GetComplianceSnapshotsByTimeIntervalOptions,
  GetComplianceViolationOptions,
  GetComplianceViolationPeriodsOptions,
  GetComplianceViolationsByTimeIntervalOptions
} from '../@types'
import { ComplianceServiceLogger } from '../logger'
import { ComplianceRepository } from '../repository'
import { ComplianceViolationPeriodEntityToDomainCreate } from '../repository/mappers'
import { ComplianceSnapshotStreamKafka } from './stream'
import {
  validateComplianceSnapshotDomainModel,
  validateGetComplianceSnapshotsByTimeIntervalOptions
} from './validators'

const serviceErrorWrapper = async <T>(method: string, exec: () => Promise<T>) => {
  try {
    return ServiceResult(await exec())
  } catch (error) {
    const exception = ServiceException(`Error Compliance:${method}`, error)
    ComplianceServiceLogger.error(`${method} error`, { exception, error })
    return exception
  }
}

export const ComplianceServiceProvider: ServiceProvider<ComplianceService> & ProcessController = {
  start: async () => {
    await Promise.all([ComplianceRepository.initialize(), ComplianceSnapshotStreamKafka.initialize()])
  },
  stop: async () => {
    await Promise.all([ComplianceRepository.shutdown(), ComplianceSnapshotStreamKafka.shutdown()])
  },
  createComplianceSnapshot: async complianceSnapshot => {
    try {
      const snapshot = await ComplianceRepository.createComplianceSnapshot(
        validateComplianceSnapshotDomainModel(complianceSnapshot)
      )
      const { vehicles_found, ...kafkaSnapshot } = snapshot
      await ComplianceSnapshotStreamKafka.write(kafkaSnapshot)
      return ServiceResult(snapshot)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshot', error)
      ComplianceServiceLogger.error('createComplianceSnapshot error', { exception, error })
      return exception
    }
  },
  createComplianceSnapshots: async complianceSnapshots => {
    try {
      const snapshots = await ComplianceRepository.createComplianceSnapshots(
        complianceSnapshots.map(validateComplianceSnapshotDomainModel)
      )
      const kafkaSnapshots = snapshots.map(snapshot => {
        const { vehicles_found, ...kafkaSnapshot } = snapshot
        return kafkaSnapshot
      })
      await ComplianceSnapshotStreamKafka.write(kafkaSnapshots)
      return ServiceResult(snapshots)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshots', error)
      ComplianceServiceLogger.error('createComplianceSnapshots error', { exception, error })
      return exception
    }
  },
  createComplianceViolation: async complianceViolation =>
    serviceErrorWrapper('createComplianceViolation', () =>
      ComplianceRepository.createComplianceViolation(complianceViolation)
    ),
  createComplianceViolations: async complianceViolations =>
    serviceErrorWrapper('createComplianceViolations', () =>
      ComplianceRepository.createComplianceViolations(complianceViolations)
    ),
  getComplianceSnapshot: async options => {
    try {
      return ServiceResult(await ComplianceRepository.getComplianceSnapshot(options))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(
        `Error Getting ComplianceSnapshot with these options: ${JSON.stringify(options)}`,
        error
      )
      ComplianceServiceLogger.error('getComplianceSnapshot error', { exception, error })
      return exception
    }
  },
  getComplianceSnapshotsByTimeInterval: async (options: GetComplianceSnapshotsByTimeIntervalOptions) => {
    try {
      return ServiceResult(
        await ComplianceRepository.getComplianceSnapshotsByTimeInterval(
          validateGetComplianceSnapshotsByTimeIntervalOptions(options)
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      ComplianceServiceLogger.error('getComplianceSnapshotsByTimeInterval error', { exception, error })
      return exception
    }
  },
  getComplianceSnapshotsByIDs: async (ids: UUID[]) => {
    try {
      return ServiceResult(await ComplianceRepository.getComplianceSnapshotsByIDs(ids))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      ComplianceServiceLogger.error('getComplianceSnapshotsByIDs error', { exception, error })
      return exception
    }
  },

  getComplianceViolation: async (options: GetComplianceViolationOptions) =>
    serviceErrorWrapper('getComplianceViolation', () => ComplianceRepository.getComplianceViolation(options)),

  getComplianceViolationsByTimeInterval: (options: GetComplianceViolationsByTimeIntervalOptions) =>
    serviceErrorWrapper('getComplianceViolationsByTimeInterval', () =>
      ComplianceRepository.getComplianceViolationsByTimeInterval(options)
    ),

  getComplianceViolationPeriods: async (options: GetComplianceViolationPeriodsOptions) => {
    try {
      const violationPeriodEntities = await ComplianceRepository.getComplianceViolationPeriods(options)
      const complianceAggregateMap = violationPeriodEntities.reduce((acc, violationPeriodEntity) => {
        const { provider_id, policy_id } = violationPeriodEntity
        const key = `${provider_id}:${policy_id}`

        if (!isDefined(acc.get(key))) {
          // eslint-disable-next-line no-param-reassign
          acc.set(key, [])
        }
        if (violationPeriodEntity.sum_total_violations > 0) {
          const arr = acc.get(key) ?? []
          arr.push(ComplianceViolationPeriodEntityToDomainCreate.map(violationPeriodEntity))
          acc.set(key, arr)
        }
        return acc
      }, new Map<string, ComplianceViolationPeriodDomainModel[]>())

      const results: ComplianceAggregateDomainModel[] = []

      complianceAggregateMap.forEach((value, key) => {
        const [provider_id, policy_id] = key.split(':')

        results.push({
          provider_id,
          policy_id,
          provider_name: providerName(provider_id),
          violation_periods: value
        })
      })

      return ServiceResult(results)
    } catch (error) {
      const exception = ServiceException('Error Getting Compliance Violation Periods', error)
      ComplianceServiceLogger.error('getComplianceViolationPeriods error', { exception, error })
      return exception
    }
  }
}
