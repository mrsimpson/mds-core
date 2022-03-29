import cache from '@mds-core/mds-agency-cache'
import db from '@mds-core/mds-db'
import { IngestServiceClient, IngestStream } from '@mds-core/mds-ingest-service'
import type { Device } from '@mds-core/mds-types'
import { uuid } from '@mds-core/mds-utils'
import {
  getVehicleById,
  getVehiclesByProvider,
  registerVehicle,
  updateVehicle,
  updateVehicleFail
} from '../request-handlers'
import type {
  AgencyApiGetVehicleByIdRequest,
  AgencyApiGetVehiclesByProviderRequest,
  AgencyApiGetVehiclesByProviderResponse,
  AgencyApiRegisterVehicleRequest,
  AgencyApiRequest,
  AgencyApiResponse,
  AgencyApiUpdateVehicleRequest
} from '../types'
import * as utils from '../utils'

/* eslint-disable @typescript-eslint/no-explicit-any */

function getLocals(provider_id: string) {
  return { provider_id, scopes: [] }
}

describe('Agency API request handlers', () => {
  describe('Register vehicle', () => {
    afterEach(jest.restoreAllMocks)

    const getFakeBody = () => {
      const device_id = uuid()
      const vehicle_id = uuid()
      const vehicle_type: Device['vehicle_type'] = 'car'
      const propulsion_types: Device['propulsion_types'] = ['combustion']
      const body = {
        device_id,
        vehicle_id,
        vehicle_type,
        propulsion_types,
        year: 1990,
        mfgr: 'foo inc',
        model: 'i date one'
      }
      return body
    }

    it('Fails for a bad device', async () => {
      const provider_id = uuid()
      const body = getFakeBody()
      body.device_id = '' // falsey empty string FTW
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      await registerVehicle({ body } as AgencyApiRegisterVehicleRequest, res)
      expect(res.status).toBeCalledWith(400)
      expect(sendMock).toHaveBeenCalled()
    })

    it('Handles db write failure gracefully', async () => {
      const provider_id = uuid()
      const body = getFakeBody()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(db, 'writeDevice').mockRejectedValue('fake-rejects-db')
      await registerVehicle({ body } as AgencyApiRegisterVehicleRequest, res)
      expect(res.status).toBeCalledWith(500)
    })

    it('Handles misc. write failure gracefully', async () => {
      const provider_id = uuid()
      const body = getFakeBody()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(db, 'writeDevice').mockRejectedValue('fake-rejects-other')
      await registerVehicle({ body } as AgencyApiRegisterVehicleRequest, res)
      expect(res.status).toBeCalledWith(500)
    })

    it('Handles duplicate gracefully', async () => {
      const provider_id = uuid()
      const body = getFakeBody()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(db, 'writeDevice').mockRejectedValue('fake-rejects-duplicate')
      await registerVehicle({ body } as AgencyApiRegisterVehicleRequest, res)
      expect(res.status).toBeCalledWith(409)
    })

    it('Inserts device successfully', async () => {
      const provider_id = uuid()
      const body = getFakeBody()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(db, 'writeDevice').mockResolvedValue('it-worked' as any)
      jest.spyOn(cache, 'writeDevices').mockResolvedValue('it-worked' as any)
      jest.spyOn(IngestStream, 'writeDevice').mockResolvedValue('it-worked' as any)
      await registerVehicle({ body } as AgencyApiRegisterVehicleRequest, res)
      expect(res.status).toBeCalledWith(201)
    })

    it('Handles cache/stream write errors as warnings', async () => {
      const provider_id = uuid()
      const body = getFakeBody()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(db, 'writeDevice').mockResolvedValue('it-worked' as any)
      jest.spyOn(cache, 'writeDevices').mockResolvedValue('it-worked' as any)
      jest.spyOn(IngestStream, 'writeDevice').mockResolvedValue('it-worked' as any)
      await registerVehicle({ body } as AgencyApiRegisterVehicleRequest, res)
      expect(res.status).toBeCalledWith(201)
    })
  })

  describe('Get vehicle by id', () => {
    it('Reads device data and returns composite', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(IngestServiceClient, 'getDevices').mockResolvedValue([{ provider_id } as any])
      jest.spyOn(db, 'readEvent').mockResolvedValue({} as any)
      jest.spyOn(db, 'readTelemetry').mockResolvedValue({} as any)
      jest.spyOn(utils, 'computeCompositeVehicleData').mockResolvedValue('it-worked' as never)
      await getVehicleById(
        {
          params: { device_id },
          query: { cached: false }
        } as unknown as AgencyApiGetVehicleByIdRequest,
        res
      )
      expect(res.status).toBeCalledWith(200)
    })
  })

  describe('Get vehicles by provider', () => {
    it('Handles failure to get vehicles by provider', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(utils, 'getVehicles').mockRejectedValue('it-broke' as any)
      await getVehiclesByProvider(
        {
          params: { device_id },
          query: { cached: false },
          get: jest.fn().mockImplementation(() => 'asdf')
        } as unknown as AgencyApiGetVehiclesByProviderRequest,
        res
      )
      expect(res.status).toBeCalledWith(500)
    })

    it('Gets vehicles by provider', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const res: AgencyApiGetVehiclesByProviderResponse = {} as AgencyApiGetVehiclesByProviderResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any

      const stubbedResponse = { total: 0, links: { first: '0', last: '0', prev: null, next: null }, vehicles: [] }
      jest.spyOn(utils, 'getVehicles').mockResolvedValue(stubbedResponse)
      await getVehiclesByProvider(
        {
          params: { device_id },
          query: { cached: false },
          get: jest.fn().mockImplementation(() => 'asdf')
        } as unknown as AgencyApiGetVehiclesByProviderRequest,
        res
      )
      expect(res.status).toBeCalledWith(200)
      expect(sendMock).toHaveBeenCalledWith({ ...stubbedResponse })
    })
  })

  describe('Update vehicle', () => {
    describe('Failure handler helper', () => {
      it('Fails to find data', async () => {
        const provider_id = uuid()
        const device_id = uuid()
        const res: AgencyApiResponse = {} as AgencyApiResponse
        const sendMock = jest.fn().mockImplementation(() => 'asdf')
        res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
        res.locals = getLocals(provider_id) as any
        jest.spyOn(utils, 'getVehicles').mockResolvedValue('it-broke' as any)
        jest.spyOn(utils, 'getVehicles').mockResolvedValue('it-broke' as any)
        await updateVehicleFail(
          {
            params: { device_id },
            query: { cached: false },
            get: jest.fn().mockImplementation(() => 'asdf')
          } as unknown as AgencyApiUpdateVehicleRequest,
          res,
          provider_id,
          device_id,
          'not found'
        )
        expect(res.status).toBeCalledWith(404)
      })

      it('Handles invalid data', async () => {
        const provider_id = uuid()
        const device_id = uuid()
        const res: AgencyApiResponse = {} as AgencyApiResponse
        const sendMock = jest.fn().mockImplementation(() => 'asdf')
        res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
        res.locals = getLocals(provider_id) as any
        jest.spyOn(utils, 'getVehicles').mockResolvedValue('it-broke' as any)
        await updateVehicleFail(
          {
            params: { device_id },
            query: { cached: false },
            get: jest.fn()
          } as unknown as AgencyApiUpdateVehicleRequest,
          res,
          provider_id,
          device_id,
          'invalid'
        )
        expect(res.status).toBeCalledWith(400)
        expect(sendMock).toHaveBeenCalledWith({
          error: 'bad_param',
          error_description: 'Invalid parameters for vehicle were sent'
        })
      })

      it('404s with no provider_id', async () => {
        const provider_id = ''
        const device_id = uuid()
        const res: AgencyApiResponse = {} as AgencyApiResponse
        const sendMock = jest.fn().mockImplementation(() => 'asdf')
        res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
        res.locals = getLocals(provider_id) as any
        jest.spyOn(utils, 'getVehicles').mockResolvedValue('it-broke' as any)
        await updateVehicleFail(
          {
            params: { device_id },
            query: { cached: false },
            get: jest.fn()
          } as unknown as AgencyApiUpdateVehicleRequest,
          res,
          provider_id,
          device_id,
          'not found'
        )

        expect(res.status).toBeCalledWith(404)
      })

      it('handles misc error', async () => {
        const provider_id = uuid()
        const device_id = uuid()
        const res: AgencyApiResponse = {} as AgencyApiResponse
        const sendMock = jest.fn().mockImplementation(() => 'asdf')
        res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
        res.locals = getLocals(provider_id) as any
        jest.spyOn(utils, 'getVehicles').mockResolvedValue('it-broke' as any)
        await updateVehicleFail(
          {
            params: { device_id },
            query: { cached: false },
            get: jest.fn()
          } as unknown as AgencyApiUpdateVehicleRequest,
          res,
          provider_id,
          device_id,
          'misc-error'
        )
        expect(res.status).toHaveBeenCalledWith(500)
      })
    })

    it('Handles failure to update vehicle', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(utils, 'getVehicles').mockRejectedValue('it-broke' as any)
      await getVehiclesByProvider(
        {
          params: { device_id },
          query: { cached: false },
          get: jest.fn()
        } as unknown as AgencyApiRequest,
        res
      )
      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('Fails to read vehicle', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const vehicle_id = uuid()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(utils, 'getVehicles').mockResolvedValue('it-broke' as any)
      await updateVehicle(
        {
          params: { device_id },
          query: { cached: false },
          get: jest.fn(),
          body: { vehicle_id }
        } as unknown as AgencyApiUpdateVehicleRequest,
        res
      )

      expect(res.status).toBeCalledWith(404)
    })

    it('Handles mismatched provider', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const vehicle_id = uuid()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(IngestServiceClient, 'getDevice').mockResolvedValue({ provider_id: 'not-your-provider' } as any)
      await updateVehicle(
        {
          params: { device_id },
          query: { cached: false },
          get: jest.fn(),
          body: { vehicle_id }
        } as unknown as AgencyApiUpdateVehicleRequest,
        res
      )

      expect(res.status).toBeCalledWith(404)
    })

    it('Updates vehicle successfully', async () => {
      const provider_id = uuid()
      const device_id = uuid()
      const vehicle_id = uuid()
      const res: AgencyApiResponse = {} as AgencyApiResponse
      const sendMock = jest.fn().mockImplementation(() => 'asdf')
      res.status = jest.fn().mockImplementation(() => ({ send: sendMock }))
      res.locals = getLocals(provider_id) as any
      jest.spyOn(IngestServiceClient, 'getDevice').mockResolvedValue({ provider_id } as any)
      jest.spyOn(db, 'updateDevice').mockResolvedValue({ provider_id } as any)
      jest.spyOn(cache, 'writeDevices').mockResolvedValue({ provider_id } as any)
      jest.spyOn(IngestStream, 'writeDevice').mockResolvedValue({ provider_id } as any)
      await updateVehicle(
        {
          params: { device_id },
          query: { cached: false },
          get: jest.fn(),
          body: { vehicle_id }
        } as unknown as AgencyApiUpdateVehicleRequest,
        res
      )
      expect(res.status).toBeCalledWith(201)
    })
  })
})
