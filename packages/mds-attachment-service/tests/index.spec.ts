/**
 * Copyright 2020 City of Los Angeles
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

import { AttachmentServiceClient } from '../client'
import { AttachmentRepository } from '../repository'
import { AttachmentServiceManager } from '../service/manager'

describe('Attachment Repository Tests', () => {
  beforeAll(AttachmentRepository.initialize)
  it('Run Migrations', AttachmentRepository.runAllMigrations)
  it('Revert Migrations', AttachmentRepository.revertAllMigrations)
  afterAll(AttachmentRepository.shutdown)
})

const AttachmentServer = AttachmentServiceManager.controller()

describe('Attachment Service Tests', () => {
  beforeAll(async () => {
    await AttachmentServer.start()
  })

  it('Test Name Method', async () => {
    const attachments = await AttachmentServiceClient.readAttachments({ attachment_ids: [] })
    expect(attachments).toHaveLength(0)
  })

  afterAll(async () => {
    await AttachmentServer.stop()
  })
})
