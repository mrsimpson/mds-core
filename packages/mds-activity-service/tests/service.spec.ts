/**
 * Copyright 2022 City of Los Angeles
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

import { ActivityServiceClient } from '../client'
import { ActivityRepository } from '../repository'
import { ActivityServiceManager } from '../server/manager'

describe('Activity Repository Tests', () => {
  beforeAll(ActivityRepository.initialize)
  it('Run Migrations', ActivityRepository.runAllMigrations)
  it('Revert Migrations', ActivityRepository.revertAllMigrations)
  afterAll(ActivityRepository.shutdown)
})

const ActivityServer = ActivityServiceManager.controller()

describe('Activity Service Tests', () => {
  beforeAll(async () => {
    await ActivityServer.start()
  })

  it('Record Activity', async () => {
    await expect(ActivityServiceClient.recordActivity('Test', 'Activity1', 'TestActivity1')).resolves.not.toThrowError()
    await expect(
      ActivityServiceClient.recordActivity('Test', 'Activity2', 'TestActivity2', { one: 1 })
    ).resolves.not.toThrowError()
  })

  it('Get Activity', async () => {
    // Since recording activity is non-blocking (fire and forget), allow a few ms to resolve before querying
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(await ActivityServiceClient.getActivity({ limit: 1 })).toMatchObject({
      activity: [
        {
          category: 'Test',
          type: 'Activity2',
          description: 'TestActivity2',
          details: { one: 1 }
        }
      ],
      cursor: { prev: null, next: null }
    })
  })

  afterAll(async () => {
    await ActivityServer.stop()
  })
})
