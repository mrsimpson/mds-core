/**
 * Copyright 2019 City of Los Angeles
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

import { ConnectionManager } from '../connection'

const TEST_REPOSITORY_NAME = 'test-repository'

const manager = new ConnectionManager(TEST_REPOSITORY_NAME)

describe('Test Connections', () => {
  it('Create R/W Connection', async () => {
    const rw = await manager.connect('rw')
    expect(rw.name).toEqual(`${TEST_REPOSITORY_NAME}-rw`)
    expect(rw.isInitialized).toEqual(true)
    await manager.disconnect('rw')
    expect(rw.isInitialized).toEqual(false)
  })

  it('Create R/O Connection', async () => {
    const ro = await manager.connect('ro')
    expect(ro.name).toEqual(`${TEST_REPOSITORY_NAME}-ro`)
    expect(ro.isInitialized).toEqual(true)
    await manager.disconnect('ro')
    expect(ro.isInitialized).toEqual(false)
  })
})
