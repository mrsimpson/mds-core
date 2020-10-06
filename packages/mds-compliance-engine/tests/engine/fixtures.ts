import { Polygon } from 'geojson'
import { veniceSpecOps, LA_CITY_BOUNDARY, restrictedAreas } from '@mds-core/mds-test-data'

import { Geography, Policy, RULE_TYPES, VEHICLE_TYPES } from '@mds-core/mds-types'

export const GEOGRAPHY_UUID = '8917cf2d-a963-4ea2-a98b-7725050b3ec5'
export const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'
export const LA_GEOGRAPHY = { name: 'la', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
export const LA_BEACH = 'ff822e26-a70c-4721-ac32-2f6734beff9b'
export const LA_BEACH_GEOGRAPHY = { name: 'la beach', geography_id: LA_BEACH, geography_json: restrictedAreas }
export const RESTRICTED_GEOGRAPHY = {
  name: 'la',
  geography_id: 'c0591267-bb6a-4f28-a612-ff7f4a8f8b2a',
  geography_json: restrictedAreas
}

export const COUNT_POLICY_UUID = '72971a3d-876c-41ea-8e48-c9bb965bbbcc'
export const COUNT_POLICY_UUID_2 = '37637f96-2580-475a-89e7-cfc5d2e70f84'
export const COUNT_POLICY_UUID_3 = 'e8f9a720-6c12-41c8-a31c-715e76d65ea1'
export const COUNT_POLICY_JSON: Policy = {
  name: 'LADOT Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID,
  start_date: 1558389669540,
  publish_date: 1558389669540,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      rule_type: RULE_TYPES.count,
      geographies: [GEOGRAPHY_UUID],
      states: { available: [], non_operational: [], reserved: [], on_trip: [] },
      vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
      maximum: 10,
      minimum: 5
    }
  ]
}

export const COUNT_POLICY_JSON_2: Policy = {
  name: 'Something Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID_2,
  start_date: 1558389669540,
  end_date: null,
  publish_date: 1558389669540,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'No vehicles permitted on Venice Beach on weekends',
      rule_id: '405b959e-4377-4a31-8b34-a9a4771125fc',
      rule_type: RULE_TYPES.count,
      geographies: ['ff822e26-a70c-4721-ac32-2f6734beff9b'],
      states: { available: [], non_operational: [], reserved: [], on_trip: [] },
      days: ['sat', 'sun'],
      maximum: 0,
      minimum: 0
    }
  ]
}

export const COUNT_POLICY_JSON_3: Policy = {
  name: 'LADOT Mobility Caps',
  description: 'Mobility caps as described in the One-Year Permit',
  policy_id: COUNT_POLICY_UUID_3,
  start_date: 1558389669540,
  publish_date: 1558389669540,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '04dc545b-41d8-401d-89bd-bfac9247b555',
      rule_type: RULE_TYPES.count,
      geographies: [GEOGRAPHY_UUID],
      states: { available: ['on_hours'], non_operational: [], reserved: [] },
      vehicle_types: [VEHICLE_TYPES.bicycle, VEHICLE_TYPES.scooter],
      maximum: 10
    }
  ]
}

export const COUNT_POLICY_JSON_5: Policy = {
  name: 'Prohibited Dockless Zones',
  rules: [
    {
      name: 'Prohibited Dockless Zones',
      maximum: 0,
      rule_id: '8ad39dc3-005b-4348-9d61-c830c54c161b',
      states: {
        on_trip: [],
        reserved: [],
        available: []
      },
      rule_type: 'count',
      geographies: ['c0591267-bb6a-4f28-a612-ff7f4a8f8b2a'],
      vehicle_types: ['bicycle', 'scooter']
    }
  ],
  end_date: null,
  policy_id: '25851571-b53f-4426-a033-f375be0e7957',
  start_date: Date.now(),
  publish_date: Date.now() - 10,
  description:
    'Prohibited areas for dockless vehicles within the City of Los Angeles for the LADOT Dockless On-Demand Personal Mobility Program',
  prev_policies: null
}

export const VENICE_POLICY_UUID = 'dd9ace3e-14c8-461b-b5e7-1326505ff176'

export const INNER_GEO: Geography = {
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
}

export const OUTER_GEO: Geography = {
  geography_id: 'e0e4a085-7a50-43e0-afa4-6792ca897c5a',
  name: 'outer venice geo',
  geography_json: {
    type: 'FeatureCollection',
    features: [{ properties: {}, type: 'Feature', geometry: veniceSpecOps.features[0].geometry }]
  }
}
export const OUTER_POLYGON: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-118.47261428833006, 33.98888290068113],
      [-118.4684944152832, 33.98888290068113],
      [-118.4684944152832, 33.99044854215088],
      [-118.47261428833006, 33.99044854215088],
      [-118.47261428833006, 33.98888290068113]
    ]
  ]
}

export const INNER_POLYGON: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-118.46853733062744, 33.98187274314647],
      [-118.46694946289064, 33.98187274314647],
      [-118.46694946289064, 33.982797974722246],
      [-118.46853733062744, 33.982797974722246],
      [-118.46853733062744, 33.98187274314647]
    ]
  ]
}
