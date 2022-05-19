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

import { days, now, uuid } from '@mds-core/mds-utils'
import { GeographyServiceClient } from '../client'
import { GeographyRepository } from '../repository'
import { GeographyServiceManager } from '../service/manager'

const geography_id = 'a32f7020-d149-4b6c-8e5f-4d057f4e8ef8'
const geography_id2 = '1d34d03a-33f7-4eed-a1a6-dcc0eb7a93aa'

describe('Geography Repository Tests', () => {
  beforeAll(GeographyRepository.initialize)
  it('Run Migrations', GeographyRepository.runAllMigrations)
  it('Revert Migrations', GeographyRepository.revertAllMigrations)
  afterAll(GeographyRepository.shutdown)
})

const GeographyServer = GeographyServiceManager.controller()

describe('Geography Service Tests', () => {
  beforeAll(async () => {
    await GeographyServer.start()
  })

  afterEach(async () => {
    await GeographyRepository.truncateAllTables()
  })

  // FIXME: These tests should clean up data after each test.
  describe('GeographyServiceClient Tests', () => {
    it('Write Geographies', async () => {
      const geographies = await GeographyServiceClient.writeGeographies([
        {
          geography_id,
          geography_json: { type: 'FeatureCollection', features: [] }
        },
        { geography_id: geography_id2, geography_json: { type: 'FeatureCollection', features: [] } }
      ])
      expect(geographies).toHaveLength(2)
    })

    it('Write and Publish Geographies in one transaction', async () => {
      const geographies = await GeographyServiceClient.writeGeographies(
        [
          {
            geography_id,
            geography_json: { type: 'FeatureCollection', features: [] }
          },
          { geography_id: geography_id2, geography_json: { type: 'FeatureCollection', features: [] } }
        ],
        { publishOnCreate: true }
      )
      expect(geographies).toHaveLength(2)
      geographies.forEach(g => {
        expect(g.publish_date).not.toBeNull()
      })
    })

    it('Write Invalid Geographies - throws errors', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const badGeoJSON: any = {
        geography_id,
        geography_json: { type: 'FeatureCollection', features: [{ funky: 'business' }] }
      }

      await expect(
        GeographyServiceClient.writeGeographies([
          badGeoJSON,
          { geography_id: geography_id2, geography_json: { type: 'FeatureCollection', features: [] } }
        ])
      ).rejects.toMatchObject({ type: 'ValidationError' })
    })

    describe('Tests that assume geographies are already in the DB', () => {
      beforeEach(async () => {
        await GeographyServiceClient.writeGeographies([
          {
            geography_id,
            geography_json: { type: 'FeatureCollection', features: [] }
          },
          { geography_id: geography_id2, geography_json: { type: 'FeatureCollection', features: [] } }
        ])
      })
      it('Publishes that geography', async () => {
        await GeographyServiceClient.publishGeography({ geography_id, publish_date: now() })
        const [geo] = await GeographyServiceClient.getGeographiesByIds([geography_id])
        expect(geo?.publish_date).toBeTruthy()
      })

      it('Write Geographies Metadata', async () => {
        const metadata = await GeographyServiceClient.writeGeographiesMetadata([
          {
            geography_id,
            geography_metadata: { status: 'original' }
          }
        ])

        expect(metadata).toMatchObject([{ geography_id, geography_metadata: { status: 'original' } }])
      })

      it('Modify Geographies Metadata', async () => {
        await GeographyServiceClient.writeGeographiesMetadata([
          {
            geography_id,
            geography_metadata: { status: 'original' }
          }
        ])

        const metadata = await GeographyServiceClient.writeGeographiesMetadata([
          {
            geography_id,
            geography_metadata: { status: 'modified' }
          }
        ])
        expect(metadata).toMatchObject([{ geography_id, geography_metadata: { status: 'modified' } }])
      })

      it('Creating metadata throws if geography does not exist', async () => {
        await expect(
          GeographyServiceClient.writeGeographiesMetadata([
            {
              geography_id: '43ab1bfc-2f98-4408-8668-580d501e77f5',
              geography_metadata: { status: 'modified' }
            }
          ])
        ).rejects.toMatchObject({
          details: 'Key (geography_id)=(43ab1bfc-2f98-4408-8668-580d501e77f5) is not present in table "geographies".',
          message: 'Error Writing Geographies Metadata'
        })
      })

      it('Editing metadata throws if geography does not exist', async () => {
        await expect(
          GeographyServiceClient.editGeographyMetadata({
            geography_id: uuid(),
            geography_metadata: { status: 'modified' }
          })
        ).rejects.toMatchObject({
          details: 'cannot find Geography Metadata',
          message: 'Error Editing Geography Metadata'
        })
      })

      it('Get All Geographies', async () => {
        const geographies = await GeographyServiceClient.getGeographies()
        expect(geographies).toHaveLength(2)
        geographies.forEach(geography => expect(geography.geography_metadata).toBeUndefined())
      })

      it('Get All Geographies With Metadata', async () => {
        const geographies = await GeographyServiceClient.getGeographies({ includeMetadata: true })
        expect(geographies).toHaveLength(2)
        geographies.forEach(geography => expect(geography.geography_metadata).not.toBeUndefined())
      })

      describe('Tests with bulk geography reads', () => {
        beforeEach(async () => {
          await GeographyServiceClient.writeGeographiesMetadata([
            {
              geography_id,
              geography_metadata: { status: 'modified' }
            }
          ])
          await GeographyServiceClient.publishGeography({ geography_id, publish_date: now() })
        })

        it('Get Geographies (some missing)', async () => {
          const ids = [geography_id, geography_id2, uuid()] // note: last entry is a random uuid, so expected to be missing
          const geographies = await GeographyServiceClient.getGeographiesByIds(ids)
          expect(geographies).toHaveLength(3)

          // all geographies except last
          const resultsExceptLast = geographies.slice(0, -1)
          // expect order is retained from the ids list
          resultsExceptLast.forEach((geography, i) => expect(geography?.geography_id).toEqual(ids[i]))

          // last entry should be null because it's not in the db
          const lastEntry = geographies[geographies.length - 1]
          expect(lastEntry).toStrictEqual(null)
        })

        it('Get Unpublished Geographies', async () => {
          const geographies = await GeographyServiceClient.getUnpublishedGeographies()
          expect(geographies).toHaveLength(1)
          geographies.forEach(geography => expect(geography.geography_metadata).toBeUndefined())
        })

        it('Get Unpublished Geographies With Metadata', async () => {
          const [geography, ...others] = await GeographyServiceClient.getUnpublishedGeographies({
            includeMetadata: true
          })
          expect(others).toHaveLength(0)
          expect(geography?.geography_metadata).toBeNull()
        })

        it('Get Published Geographies', async () => {
          const geographies = await GeographyServiceClient.getPublishedGeographies()
          expect(geographies).toHaveLength(1)
          geographies.forEach(geography => expect(geography.geography_metadata).toBeUndefined())
        })

        it('Get Published Geographies With Metadata', async () => {
          const [geography, ...others] = await GeographyServiceClient.getPublishedGeographies({ includeMetadata: true })
          expect(others).toHaveLength(0)
          expect(geography?.geography_metadata).toEqual({ status: 'modified' })
        })

        it('Get Geographies Published After Date', async () => {
          const geographies = await GeographyServiceClient.getPublishedGeographies({ publishedAfter: now() + days(1) })
          expect(geographies).toHaveLength(0)
        })
        it('Get only non hidden geographies', async () => {
          const geographies1 = await GeographyServiceClient.getGeographies()
          expect(geographies1.length).toEqual(2)
          await GeographyServiceClient.writeGeographiesMetadata([
            {
              geography_id,
              geography_metadata: { hidden: true }
            }
          ])
          const geographies2 = await GeographyServiceClient.getGeographies()
          expect(geographies2.length).toEqual(1)
          const geographies3 = await GeographyServiceClient.getGeographies({ includeHidden: true })
          expect(geographies3.length).toEqual(2)
        })
      })

      describe('Tests with reading a single geography', () => {
        beforeEach(async () => {
          await GeographyServiceClient.writeGeographiesMetadata([
            {
              geography_id,
              geography_metadata: { status: 'modified' }
            }
          ])
          await GeographyServiceClient.publishGeography({ geography_id, publish_date: now() })
        })

        it('Get Single Geography', async () => {
          const geography = await GeographyServiceClient.getGeography(geography_id)
          expect(geography).not.toBeUndefined()
          expect(geography?.geography_id).toEqual(geography_id)
          expect(geography?.geography_metadata).toBeUndefined()
        })

        it('Get Single Geography With Metadata', async () => {
          const geography = await GeographyServiceClient.getGeography(geography_id, { includeMetadata: true })
          expect(geography).not.toBeUndefined()
          expect(geography?.geography_id).toEqual(geography_id)
          expect(geography?.geography_metadata).toEqual({ status: 'modified' })
        })

        it('Get Single Geography (Not Found)', async () => {
          const geography = await GeographyServiceClient.getGeography(uuid())
          expect(geography).toBeUndefined()
        })

        it('Get Single Geography With Metadata (Not Found)', async () => {
          const geography = await GeographyServiceClient.getGeography(uuid(), { includeMetadata: true })
          expect(geography).toBeUndefined()
        })
      })
    })
  })

  describe('Geography Tests', () => {
    beforeAll(async () => {
      await GeographyRepository.initialize()
    })

    beforeEach(async () => {
      await GeographyRepository.truncateAllTables()
    })

    afterAll(async () => {
      await GeographyRepository.shutdown()
    })

    it('Edits Geography works if unpublished', async () => {
      const [geography] = await GeographyServiceClient.writeGeographies([
        { geography_id: uuid(), geography_json: { type: 'FeatureCollection', features: [] } }
      ])

      if (!geography) {
        throw new Error('Geography not created')
      }

      const updated = await GeographyServiceClient.editGeography({
        geography_json: geography.geography_json,
        geography_id: geography.geography_id,
        description: 'end of universe'
      })
      expect(updated.description).toStrictEqual('end of universe')
      await GeographyServiceClient.publishGeography({ geography_id: geography.geography_id })
      await expect(
        GeographyServiceClient.editGeography({
          geography_json: geography.geography_json,
          geography_id: geography.geography_id,
          description: 'end of universe'
        })
      ).rejects.toMatchObject({ details: 'Cannot edit published Geography', message: 'Error Editing Geographies' })
    })
  })

  afterAll(async () => {
    await GeographyServer.stop()
  })
})
