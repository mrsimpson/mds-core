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

import test from 'unit.js'
import { now, uuid } from '@mds-core/mds-utils'
import { AUDIT_EVENT_TYPES } from '@mds-core/mds-types'
import { providers } from '@mds-core/mds-providers' // map of uuids -> obj
import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import {
  isValidAuditTripId,
  isValidVehicleEventType,
  isValidTelemetry,
  isValidDeviceId,
  isValidAuditDeviceId,
  isValidAuditEventId,
  isValidProviderVehicleId,
  isValidProviderId,
  isValidTimestamp,
  isValidAuditEventType,
  isValidAuditIssueCode,
  isValidAuditNote,
  isValidNumber,
  ValidationError,
  validateEvents,
  validatePolicies,
  isValidEvent,
  validateGeographies
} from '../validators'

describe('Tests validators', () => {
  it('verified Number validator', done => {
    test.assert.throws(() => isValidNumber(undefined), ValidationError)
    test.assert.throws(() => isValidNumber(null), ValidationError)
    test.assert.throws(() => isValidNumber('invalid'), ValidationError)
    test.assert.throws(() => isValidNumber(0, { min: 1, max: 1 }), ValidationError)
    test.assert.throws(() => isValidNumber(2, { min: 1, max: 1 }), ValidationError)
    test.assert.throws(() => isValidNumber(-1, { min: 0, max: 1 }), ValidationError)
    test.assert.throws(() => isValidNumber(1, { min: -1, max: 0 }), ValidationError)
    test.value(isValidNumber(1, { min: 1, max: 1 })).is(true)
    test.value(isValidNumber(undefined, { assert: false })).is(false)
    test.value(isValidNumber(undefined, { assert: false, required: false })).is(true)
    done()
  })

  it('verifies Audit Trip ID validator', done => {
    test.assert.throws(() => isValidAuditTripId(undefined), ValidationError)
    test.assert.throws(() => isValidAuditTripId(null), ValidationError)
    test.value(isValidAuditTripId('invalid', { assert: false })).is(false)
    test.value(isValidAuditTripId(uuid())).is(true)
    done()
  })

  it('verifies Audit Event Type validator', done => {
    test.assert.throws(() => isValidAuditEventType(undefined), ValidationError)
    test.assert.throws(() => isValidAuditEventType(null), ValidationError)
    test.assert.throws(() => isValidAuditEventType('invalid'), ValidationError)
    test
      .value(isValidAuditEventType(AUDIT_EVENT_TYPES.start, { accept: [AUDIT_EVENT_TYPES.end], assert: false }))
      .is(false)
    test.value(isValidAuditEventType(AUDIT_EVENT_TYPES.start)).is(true)
    done()
  })

  it('verifies Timestamp validator', done => {
    test.assert.throws(() => isValidTimestamp(undefined), ValidationError)
    test.assert.throws(() => isValidTimestamp(null), ValidationError)
    test.assert.throws(() => isValidTimestamp(1), ValidationError)
    test.value(isValidTimestamp('123', { assert: false })).is(false)
    test.value(isValidTimestamp('1567695019935', { assert: false })).is(false)
    test.value(isValidTimestamp(Date.now())).is(true)
    done()
  })

  it('verifies Provider ID validator', done => {
    test.assert.throws(() => isValidProviderId(undefined), ValidationError)
    test.assert.throws(() => isValidProviderId(null), ValidationError)
    test.assert.throws(() => isValidProviderId(uuid()), ValidationError)
    test.value(isValidProviderId('invalid', { assert: false })).is(false)
    test.value(isValidProviderId(Object.keys(providers)[0])).is(true)

    done()
  })

  it('verifies Device ID validator', done => {
    test.assert.throws(() => isValidDeviceId(undefined), ValidationError)
    test.assert.throws(() => isValidDeviceId(null), ValidationError)
    test.value(isValidDeviceId('invalid', { assert: false })).is(false)
    test.value(isValidDeviceId(uuid())).is(true)
    done()
  })

  it('verifies Vehicle ID validator', done => {
    test.assert.throws(() => isValidProviderVehicleId(undefined), ValidationError)
    test.assert.throws(() => isValidProviderVehicleId(null), ValidationError)
    test.assert.throws(() => isValidProviderVehicleId(3), ValidationError)
    test.value(isValidProviderVehicleId('V'.repeat(256), { assert: false })).is(false)
    test.value(isValidProviderVehicleId('provider-vehicle-id')).is(true)
    done()
  })

  it('verifies Audit Event ID validator', done => {
    test.assert.throws(() => isValidAuditEventId(undefined), ValidationError)
    test.assert.throws(() => isValidAuditEventId(null), ValidationError)
    test.value(isValidAuditEventId('invalid', { assert: false })).is(false)
    test.value(isValidAuditEventId(uuid())).is(true)
    done()
  })

  it('verifies Audit Device ID validator', done => {
    test.assert.throws(() => isValidAuditDeviceId(undefined), ValidationError)
    test.assert.throws(() => isValidAuditDeviceId(null), ValidationError)
    test.value(isValidAuditDeviceId('invalid', { assert: false })).is(false)
    test.value(isValidAuditDeviceId(uuid())).is(true)
    done()
  })

  it('verifies Telemetry validator', done => {
    test.assert.throws(() => isValidTelemetry(undefined), ValidationError)
    test.assert.throws(() => isValidTelemetry(null), ValidationError)
    test.assert.throws(() => isValidTelemetry(''), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now() }), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: '' }), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: {} }), ValidationError)
    test.assert.throws(
      () => isValidTelemetry({ timestamp: Date.now(), gps: { lat: null, lng: null } }),
      ValidationError
    )
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: { lat: -200, lng: 0 } }), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 200, lng: 0 } }), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 200 } }), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: -200 } }), ValidationError)
    test.value(isValidTelemetry({ gps: { lat: 0, lng: 0 } }, { assert: false })).is(false)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: { lat: '0', lng: 0 } }), ValidationError)
    test.assert.throws(() => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: '0' } }), ValidationError)
    test.assert.throws(
      () => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 0, speed: '0' } }),
      ValidationError
    )
    test.assert.throws(
      () => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 0, heading: '0' } }),
      ValidationError
    )
    test.assert.throws(
      () => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 0, accuracy: '0' } }),
      ValidationError
    )
    test.assert.throws(
      () => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 0, altitude: '0' } }),
      ValidationError
    )
    test.assert.throws(
      () => isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 0 }, charge: '0' }),
      ValidationError
    )
    test.value(isValidTelemetry({ timestamp: Date.now(), gps: { lat: 0, lng: 0 } })).is(true)
    test.value(isValidTelemetry(undefined, { assert: false })).is(false)
    test.value(isValidTelemetry(undefined, { assert: false, required: false })).is(true)
    done()
  })

  it('verifies Vehicle Event Type validator', done => {
    test.assert.throws(() => isValidVehicleEventType(undefined), ValidationError)
    test.assert.throws(() => isValidVehicleEventType(null), ValidationError)
    test.assert.throws(() => isValidVehicleEventType('invalid'), ValidationError)
    test.value(isValidVehicleEventType(AUDIT_EVENT_TYPES.telemetry, { assert: false })).is(false)
    test.value(isValidVehicleEventType('trip_end')).is(true)
    done()
  })

  it('verifies Audit Issue Code validator', done => {
    test.assert.throws(() => isValidAuditIssueCode(undefined), ValidationError)
    test.assert.throws(() => isValidAuditIssueCode(''), ValidationError)
    test.assert.throws(() => isValidAuditIssueCode(null), ValidationError)
    test.assert.throws(() => isValidAuditIssueCode(3), ValidationError)
    test.value(isValidAuditIssueCode('V'.repeat(32), { assert: false })).is(false)
    test.value(isValidAuditIssueCode('provider-vehicle-id')).is(true)
    test.value(isValidAuditIssueCode(undefined, { assert: false, required: false })).is(true)
    done()
  })

  it('verifies Audit Note validator', done => {
    test.assert.throws(() => isValidAuditNote(undefined), ValidationError)
    test.assert.throws(() => isValidAuditNote(''), ValidationError)
    test.assert.throws(() => isValidAuditNote(null), ValidationError)
    test.assert.throws(() => isValidAuditNote(3), ValidationError)
    test.value(isValidAuditNote('V'.repeat(256), { assert: false })).is(false)
    test.value(isValidAuditNote('provider-vehicle-id')).is(true)
    test.value(isValidAuditNote(undefined, { assert: false, required: false })).is(true)
    done()
  })

  it('verifies policy validator', done => {
    test.assert.doesNotThrow(() =>
      validatePolicies([
        {
          name: 'LADOT Mobility Caps',
          description: 'Mobility caps as described in the One-Year Permit',
          policy_id: uuid(),
          start_date: 1558389669540,
          end_date: null,
          prev_policies: null,
          provider_ids: [],
          rules: [
            {
              name: 'Greater LA',
              rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
              rule_type: 'count',
              geographies: ['1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'],
              states: { available: [], non_operational: [], reserved: [], on_trip: [] },
              vehicle_types: ['scooter'],
              maximum: 10,
              minimum: 5
            }
          ]
        }
      ])
    )

    test.assert.throws(
      () =>
        validatePolicies([
          {
            name: 'LADOT Mobility Caps',
            description: 'Mobility caps as described in the One-Year Permit',
            policy_id: uuid(),
            start_date: 1558389669540,
            end_date: null,
            prev_policies: null,
            provider_ids: [],
            rules: [
              {
                name: 'Greater LA',
                rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
                rule_type: 'count',
                geographies: ['1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'],
                states: { available: [], non_operational: [], reserved: [], on_trip: [] },
                vehicle_types: ['trololol'],
                maximum: 10,
                minimum: 5
              }
            ]
          }
        ]),
      ValidationError
    )

    test.assert.throws(
      () =>
        validatePolicies([
          {
            name: 'LADOT Mobility Caps',
            description: 'Mobility caps as described in the One-Year Permit',
            policy_id: uuid(),
            start_date: 1558389669540,
            end_date: null,
            prev_policies: null,
            provider_ids: [],
            rules: [
              {
                name: 'Greater LA',
                rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
                rule_type: 'count',
                geographies: ['1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'],
                states: { not_a_state: [] },
                vehicle_types: ['scooter'],
                maximum: 10,
                minimum: 5
              }
            ]
          }
        ]),
      ValidationError
    )
    done()
  })

  it('verifies vehicle event validation (single)', done => {
    test.assert.doesNotThrow(() =>
      isValidEvent({
        device_id: 'bae569e2-c011-4732-9796-c14402c2758e',
        provider_id: '5f7114d1-4091-46ee-b492-e55875f7de00',
        event_types: ['trip_start', 'unspecified'],
        vehicle_state: 'unknown',
        telemetry: {
          device_id: 'bae569e2-c011-4732-9796-c14402c2758e',
          provider_id: '5f7114d1-4091-46ee-b492-e55875f7de00',
          gps: {
            lat: 33.91503182420198,
            lng: -118.28634258945067,
            speed: 6,
            hdop: 3,
            heading: 220
          },
          charge: 0.778778830284381,
          timestamp: 1601964963032,
          recorded: 1601964963032
        },
        timestamp: 1601964963032,
        recorded: 1601964963032
      })
    )
    test.assert.doesNotThrow(() =>
      isValidEvent({
        device_id: 'bae569e2-c011-4732-9796-c14402c2758e',
        provider_id: '5f7114d1-4091-46ee-b492-e55875f7de00',
        event_types: ['trip_start', 'unspecified'],
        vehicle_state: 'unknown',
        timestamp: 1601964963032
      })
    )
    test.assert.throws(
      () =>
        isValidEvent({
          device_id: 'bae569e2-c011-4732-9796-c14402c2758e',
          provider_id: '5f7114d1-4091-46ee-b492-e55875f7de00',
          event_types: ['notreal', 'unspecified'],
          vehicle_state: 'unknown',
          timestamp: 1601964963032
        }),
      ValidationError
    )
    test.assert.throws(
      () =>
        isValidEvent({
          device_id: 'bae569e2-c011-4732-9796-c14402c2758e',
          provider_id: '5f7114d1-4091-46ee-b492-e55875f7de00',
          event_types: ['on_trip', 'unspecified'],
          vehicle_state: 'fakestate',
          timestamp: 1601964963032
        }),
      ValidationError
    )
    done()
  })

  it('verifies vehicle events validator (array)', done => {
    const devices = makeDevices(3, now())
    const events = makeEventsWithTelemetry(devices, now(), '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49')
    test.assert.doesNotThrow(() => validateEvents(events))
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: make a bad event for the sake of exercising the validator
    events[0].event_types = ['notreal']
    test.assert.throws(() => validateEvents(events), ValidationError)
    done()
  })

  it('verifies geographies validatory (array)', done => {
    const geographies = [
      {
        name: 'inner venice geo',
        geography_id: 'b4c75556-3842-47a9-b8f6-d721b98c8ca5',
        geography_json: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-118.46941709518433, 33.9807517760146],
                    [-118.46564054489136, 33.9807517760146],
                    [-118.46564054489136, 33.98356306245639],
                    [-118.46941709518433, 33.98356306245639],
                    [-118.46941709518433, 33.9807517760146]
                  ]
                ]
              }
            }
          ]
        }
      },
      {
        name: 'a random utah geo',
        geography_id: 'a345a55d-6b31-4c18-b082-3a37bba49982',
        geography_json: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-112.587890625, 37.71859032558816],
                    [-109.3798828125, 37.71859032558816],
                    [-109.3798828125, 38.58252615935333],
                    [-112.587890625, 38.58252615935333],
                    [-112.587890625, 37.71859032558816]
                  ]
                ]
              }
            }
          ]
        }
      }
    ]

    test.assert.doesNotThrow(() => validateGeographies(geographies))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: make a bad event for the sake of exercising the validator
    geographies[0].geography_json = {}
    test.assert.throws(() => validateGeographies(geographies), ValidationError)
    done()
  })
})
