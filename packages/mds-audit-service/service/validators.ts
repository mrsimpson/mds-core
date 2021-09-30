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

import { SchemaValidator } from '@mds-core/mds-schema-validators'
import { AUDIT_EVENT_TYPES, VEHICLE_EVENTS } from '@mds-core/mds-types'
import { AuditAttachmentDomainModel, AuditDomainModel, AuditEventDomainModel } from '../@types'

const uuidSchema = { type: 'string', format: 'uuid' }
const enumSchema = <T>(enumType: T[]) => ({ type: 'string', enum: enumType })

export const { validate: validateAuditDomainModel, isValid: isValidAuditDomainModel } =
  SchemaValidator<AuditDomainModel>({
    $id: 'Audit',
    type: 'object',
    properties: {
      audit_trip_id: uuidSchema,
      audit_device_id: uuidSchema,
      audit_subject_id: { type: 'string' },
      provider_id: uuidSchema,
      provider_name: { type: 'string' },
      provider_vehicle_id: { type: 'string' },
      provider_device_id: { ...uuidSchema, nullable: true, default: null }
    },
    required: [
      'audit_trip_id',
      'audit_device_id',
      'audit_subject_id',
      'provider_id',
      'provider_name',
      'provider_vehicle_id',
      'audit_device_id'
    ]
  })

export const { validate: validateAuditEventDomainModel, isValid: isValidAuditEventDomainModel } =
  SchemaValidator<AuditEventDomainModel>({
    $id: 'AuditEvent',
    type: 'object',
    properties: {
      audit_trip_id: uuidSchema,
      timestamp: { type: 'integer' },
      audit_event_id: uuidSchema,
      audit_event_type: enumSchema(Object.keys(AUDIT_EVENT_TYPES).concat(Object.keys(VEHICLE_EVENTS))),
      audit_issue_code: { type: 'string', nullable: true, default: null },
      audit_subject_id: { type: 'string' },
      note: { type: 'string', nullable: true, default: null },
      telemetry: {
        $id: 'Telemetry',
        type: 'object',
        nullable: true,
        default: null,
        properties: {
          charge: { type: 'number', nullable: true, default: null },
          gps: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
              speed: { type: 'number', nullable: true, default: null },
              heading: { type: 'number', nullable: true, default: null },
              accuracy: { type: 'number', nullable: true, default: null },
              altitude: { type: 'number', nullable: true, default: null }
            },
            required: ['lat', 'lng']
          }
        },
        required: ['gps']
      }
    },
    required: ['audit_trip_id', 'timestamp', 'audit_event_id', 'audit_event_type', 'audit_subject_id']
  })

export const { validate: validateAuditAttachmentDomainModel, isValid: isValidAuditAttachmentDomainModel } =
  SchemaValidator<AuditAttachmentDomainModel>({
    $id: 'AuditAttachment',
    type: 'object',
    properties: {
      audit_trip_id: uuidSchema,
      attachment_id: uuidSchema
    },
    required: ['audit_trip_id', 'attachment_id']
  })
