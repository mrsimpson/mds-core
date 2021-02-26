import assert from 'assert'
/* eslint-reason extends object.prototype */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import should from 'should'
import { MDSPolicy, VEHICLE_STATE, VEHICLE_EVENT, RULE_TYPE, MDSBaseRule, BaseRule } from '@mds-core/mds-types'
import {
  POLICY_JSON,
  POLICY2_JSON,
  POLICY3_JSON,
  START_ONE_MONTH_AGO,
  POLICY_WITH_DUPE_RULE,
  PUBLISHED_POLICY,
  PUBLISH_DATE_VALIDATION_JSON,
  START_ONE_MONTH_FROM_NOW,
  DELETEABLE_POLICY
} from '@mds-core/mds-test-data'
import { now, clone, NotFoundError, ConflictError, yesterday } from '@mds-core/mds-utils'
import { setFreshDB, LAGeography } from './helpers'
import MDSDBPostgres from '../index'

const ACTIVE_POLICY_JSON = { ...POLICY_JSON, publish_date: yesterday(), start_date: yesterday() }

/* You'll need postgres running and the env variable PG_NAME
 * to be set to run these tests.
 */
/* istanbul ignore next */

describe('unit test policy functions', () => {
  before(async () => {
    await setFreshDB()
  })

  after(async () => {
    await MDSDBPostgres.shutdown()
  })

  it('can delete an unpublished Policy', async () => {
    const { policy_id } = DELETEABLE_POLICY
    await MDSDBPostgres.writePolicy(DELETEABLE_POLICY)
    assert(!(await MDSDBPostgres.isPolicyPublished(policy_id)))
    await MDSDBPostgres.deletePolicy(policy_id)
    const policy_result = await MDSDBPostgres.readPolicies<
      VEHICLE_STATE,
      VEHICLE_EVENT,
      RULE_TYPE,
      MDSBaseRule<RULE_TYPE>,
      MDSPolicy
    >({
      policy_id,
      get_published: null,
      get_unpublished: null
    })
    assert.deepEqual(policy_result, [])
  })

  it('can write, read, and publish a Policy', async () => {
    await MDSDBPostgres.writeGeography(LAGeography)
    await MDSDBPostgres.publishGeography({ geography_id: LAGeography.geography_id })
    // This one already has a publish_date. Not quite kosher, but publishing it the normal way through using
    // .publishPolicy would require setting a future start_date, which means it wouldn't qualify as an active
    // policy during future tests.
    await MDSDBPostgres.writePolicy(ACTIVE_POLICY_JSON)
    await MDSDBPostgres.writePolicy(POLICY2_JSON)
    await MDSDBPostgres.writePolicy(POLICY3_JSON)

    // Read all policies, no matter whether published or not.
    const policies = await MDSDBPostgres.readPolicies<
      VEHICLE_STATE,
      VEHICLE_EVENT,
      RULE_TYPE,
      BaseRule<VEHICLE_STATE, VEHICLE_EVENT>,
      MDSPolicy
    >()
    assert.deepStrictEqual(policies.length, 3)
    const unpublishedPolicies = await MDSDBPostgres.readPolicies<
      VEHICLE_STATE,
      VEHICLE_EVENT,
      RULE_TYPE,
      BaseRule<VEHICLE_STATE, VEHICLE_EVENT>,
      MDSPolicy
    >({ get_unpublished: true, get_published: null })
    assert.deepStrictEqual(unpublishedPolicies.length, 2)
    const publishedPolicies = await MDSDBPostgres.readPolicies<
      VEHICLE_STATE,
      VEHICLE_EVENT,
      RULE_TYPE,
      BaseRule<VEHICLE_STATE, VEHICLE_EVENT>,
      MDSPolicy
    >({ get_published: true, get_unpublished: null })
    assert.deepStrictEqual(publishedPolicies.length, 1)
  })

  it('throws a ConflictError when writing a policy that already exists', async () => {
    await MDSDBPostgres.writePolicy(ACTIVE_POLICY_JSON).should.be.rejectedWith(ConflictError)
  })

  it('can retrieve Policies that were active at a particular date', async () => {
    await MDSDBPostgres.writePolicy(PUBLISHED_POLICY)
    const monthAgoPolicies = await MDSDBPostgres.readActivePolicies(START_ONE_MONTH_AGO)
    assert.deepEqual(monthAgoPolicies.length, 1)

    const currentlyActivePolicies = await MDSDBPostgres.readActivePolicies()
    assert.deepEqual(currentlyActivePolicies.length, 2)
  })

  it('can read a single Policy', async () => {
    const policy = await MDSDBPostgres.readPolicy(ACTIVE_POLICY_JSON.policy_id)
    assert.deepEqual(policy.policy_id, ACTIVE_POLICY_JSON.policy_id)
    assert.deepEqual(policy.name, ACTIVE_POLICY_JSON.name)
  })

  it('can find Policies by rule id', async () => {
    const rule_id = '7ea0d16e-ad15-4337-9722-9924e3af9146'
    const policies = await MDSDBPostgres.readPolicies({ rule_id })
    assert(policies[0].rules.map(rule => rule.rule_id).includes(rule_id))
  })

  it('ensures rules are unique when writing new policy', async () => {
    await MDSDBPostgres.writePolicy(POLICY_WITH_DUPE_RULE).should.be.rejectedWith(ConflictError)
  })

  it('cannot find a nonexistent Policy', async () => {
    await MDSDBPostgres.readPolicy('incrediblefailure').should.be.rejected()
  })

  it('can tell a Policy is published', async () => {
    const publishedResult = await MDSDBPostgres.isPolicyPublished(ACTIVE_POLICY_JSON.policy_id)
    assert.deepEqual(publishedResult, true)
    const unpublishedResult = await MDSDBPostgres.isPolicyPublished(POLICY3_JSON.policy_id)
    assert.deepEqual(unpublishedResult, false)
  })

  it('can edit a Policy', async () => {
    const policy = clone(POLICY3_JSON)
    policy.name = 'a shiny new name'
    await MDSDBPostgres.editPolicy(policy)
    const result = await MDSDBPostgres.readPolicies({
      policy_id: POLICY3_JSON.policy_id,
      get_unpublished: true,
      get_published: null
    })
    assert.deepEqual(result[0].name, 'a shiny new name')
  })

  it('cannot add a rule that already exists in some other policy', async () => {
    const policy = clone(POLICY3_JSON)
    policy.rules[0].rule_id = ACTIVE_POLICY_JSON.rules[0].rule_id
    await MDSDBPostgres.editPolicy(policy).should.be.rejectedWith(ConflictError)
  })

  it('ensures the publish_date >= start_date', async () => {
    await MDSDBPostgres.writePolicy(PUBLISH_DATE_VALIDATION_JSON)
    await MDSDBPostgres.publishPolicy(PUBLISH_DATE_VALIDATION_JSON.policy_id).should.be.rejectedWith(ConflictError)
    const validPolicy = clone(PUBLISH_DATE_VALIDATION_JSON)
    validPolicy.start_date = START_ONE_MONTH_FROM_NOW
    await MDSDBPostgres.editPolicy(validPolicy)
    await MDSDBPostgres.publishPolicy(validPolicy.policy_id).should.not.rejected()
  })

  it('will not edit or delete a published Policy', async () => {
    const publishedPolicy = clone(ACTIVE_POLICY_JSON)
    publishedPolicy.name = 'a shiny new name'
    await MDSDBPostgres.editPolicy(publishedPolicy).should.be.rejected()
    await MDSDBPostgres.deletePolicy(publishedPolicy.policy_id).should.be.rejected()
  })

  it('will throw an error if attempting to edit a nonexistent Policy', async () => {
    const policy = clone(POLICY2_JSON)
    policy.policy_id = '28218022-d333-41be-bda5-1dc4288516d2'
    await MDSDBPostgres.editPolicy(policy).should.be.rejectedWith(NotFoundError)
  })
})

describe('unit test PolicyMetadata functions', () => {
  before(async () => {
    await setFreshDB()
  })

  after(async () => {
    await MDSDBPostgres.shutdown()
  })

  it('.readBulkPolicyMetadata', async () => {
    await MDSDBPostgres.writePolicy(ACTIVE_POLICY_JSON)
    await MDSDBPostgres.writePolicy(POLICY2_JSON)
    await MDSDBPostgres.writePolicy(POLICY3_JSON)

    await MDSDBPostgres.writePolicyMetadata({
      policy_id: ACTIVE_POLICY_JSON.policy_id,
      policy_metadata: { name: 'policy_json' }
    })
    await MDSDBPostgres.writePolicyMetadata({
      policy_id: POLICY2_JSON.policy_id,
      policy_metadata: { name: 'policy2_json' }
    })
    await MDSDBPostgres.writePolicyMetadata({
      policy_id: POLICY3_JSON.policy_id,
      policy_metadata: { name: 'policy3_json' }
    })

    const noParamsResult = await MDSDBPostgres.readBulkPolicyMetadata()
    assert.deepEqual(noParamsResult.length, 3)
    const withStartDateResult = await MDSDBPostgres.readBulkPolicyMetadata({
      start_date: now(),
      get_published: null,
      get_unpublished: null
    })
    assert.deepEqual(withStartDateResult.length, 1)
    assert.deepEqual(withStartDateResult[0].policy_metadata.name, 'policy3_json')
  })
})
