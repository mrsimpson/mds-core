import cache from '@mds-core/mds-agency-cache'
import assert from 'assert'
import Sinon from 'sinon'
import { getCacheInfo } from '../sandbox-admin-request-handlers'
import { AgencyApiRequest, AgencyApiResponse } from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Sandbox admin request handlers', () => {
  describe('Gets cache info', () => {
    it('Gets cache info', async () => {
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendHandler = Sinon.fake.returns('asdf')
      const statusHandler = Sinon.fake.returns({
        send: sendHandler
      } as any)
      res.status = statusHandler
      Sinon.replace(cache, 'info', Sinon.fake.resolves('it-worked'))
      await getCacheInfo({} as AgencyApiRequest, res)
      assert.equal(statusHandler.calledWith(200), true)
      Sinon.restore()
    })
    it('Fails to get cache info', async () => {
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendHandler = Sinon.fake.returns('asdf')
      const statusHandler = Sinon.fake.returns({
        send: sendHandler
      } as any)
      res.status = statusHandler
      Sinon.replace(cache, 'info', Sinon.fake.rejects('it-failed'))
      await getCacheInfo({} as AgencyApiRequest, res)
      assert.equal(statusHandler.calledWith(500), true)
      Sinon.restore()
    })
  })
})
