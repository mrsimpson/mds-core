export const policies = [
  {
    policy_id: 'c9f55f2e-7fcf-4dd2-8eca-690a930c3c59',
    provider_ids: [],
    name: 'Micromobility Provider dropoff rules for downtown',
    description: 'Providers can drop a maximum of 30 vehicles in the 5 new dropoff zones',
    start_date: 1633244400000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '44158d43-3edb-421e-94a3-4768a64487d2',
        name: 'Maximum 35 vehicles deployed to downtown parking zones in the morning',
        rule_type: 'count',
        geographies: ['285a69fc-237d-4820-9c89-d9fdcd14d44f'],
        vehicle_types: ['scooter', 'bicycle'],
        statuses: { available: ['provider_drop_off'] },
        maximum: 35,
        start_time: '05:00:00',
        end_time: '11:00:00'
      },
      {
        rule_id: '4c36c728-f524-484f-9cd2-13d81b2af521',
        name: 'No Provider dropoffs allowed here in the morning',
        rule_type: 'count',
        geographies: ['74b95e5a-e089-4246-a4e7-67c16026927c'],
        vehicle_types: ['scooter', 'bicycle'],
        statuses: { available: ['provider_drop_off'] },
        maximum: 0,
        start_time: '05:00:00',
        end_time: '10:00:00'
      }
    ]
  },
  {
    policy_id: '86b05561-7b06-48dc-8481-7861d36d0137',
    provider_ids: [],
    name: 'Car share Provider dropoff rules for downtown',
    description:
      'When deploying shared vehicles, providers may not deploy more than 20 vehicles in the downtown area due to limited parking',
    start_date: 1636876800000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'c7915785-aeae-44bc-baa3-126490d3f27f',
        name: 'No more than 20 cars may be deployed by providers downtown at any time',
        rule_type: 'count',
        geographies: ['74b95e5a-e089-4246-a4e7-67c16026927c'],
        vehicle_types: [],
        statuses: { available: ['provider_drop_off'] },
        minimum: 0,
        maximum: 20
      }
    ]
  },
  {
    policy_id: '842b1a07-0a1a-4ea7-8264-05f01fde09a8',
    provider_ids: [],
    name: 'Slow Zone for Downtown Walk Streets',
    description: 'Throttle down to 5 mph in designated downtown walk streets',
    start_date: 1636876800000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '84fc9a2b-828e-44ef-82ed-a45c5a624d66',
        name: '5 MPH speed limit ',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['7d6d2c28-1292-41ab-ac00-60eabcd7392d'],
        vehicle_types: ['scooter', 'bicycle'],
        statuses: {},
        maximum: 5
      }
    ]
  },
  {
    policy_id: '5cb27d3c-d55f-4eca-8212-367507a3c63c',
    provider_ids: [],
    name: 'Flat micromobility trip fees for Belltown',
    description: '$0.25 per micromobility ride started or ended in Belltown',
    start_date: 1636268400000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'b09d0017-6a53-4a80-b19e-96f34fad0b6c',
        name: '$0.25 per trip started or ended in Belltown',
        rule_type: 'count',
        geographies: ['c6b05565-d4a3-4952-be0b-5f7ffad36c3a'],
        vehicle_types: [],
        statuses: { available: ['trip_end'], trip: ['trip_start'] },
        maximum: 0
      }
    ]
  },
  {
    policy_id: '5a4c1033-73f8-449c-9d91-741e3af81554',
    provider_ids: ['e714f168-ce56-4b41-81b7-0b6a4bd26128'],
    name: 'Fleet Caps for Lyft',
    description: 'Lyft is limited to a maximum of 100 bicycles and 343 scooters in all of Seattle',
    start_date: 1635750000000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'c1f80b89-d371-468c-9349-fad37d3eab8d',
        name: '100 Bicycles allowed',
        rule_type: 'count',
        geographies: ['996c4f62-758a-401a-99bb-731c06e211d1'],
        vehicle_types: ['bicycle'],
        statuses: {},
        minimum: 0,
        maximum: 100
      },
      {
        rule_id: '105fd889-0db6-49a4-bb90-abb87c2ab58e',
        name: '343 Scooters allowed ',
        rule_type: 'count',
        geographies: ['996c4f62-758a-401a-99bb-731c06e211d1'],
        vehicle_types: ['scooter'],
        statuses: {},
        minimum: 0
      }
    ]
  },
  {
    policy_id: '34e3980c-c84e-4b39-9e40-639892ff4d7b',
    provider_ids: [],
    name: '5 MPH speed limit around the Space Needle',
    description: 'Limit speed to 5mph around the Space Needle',
    start_date: 1633244400000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '26aad212-6862-4808-9bec-b386da7cdc84',
        name: '5MPH limit around the Space Needle',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['b5ea8bcf-f458-46f7-bb0c-8e4acdd88954'],
        vehicle_types: [],
        statuses: {},
        maximum: 5
      }
    ]
  },
  {
    policy_id: '5bcd3e11-c4f1-4d4a-a0dd-490ad4ae47ea',
    provider_ids: [],
    name: 'Equity Zone Minimum scooter deployment',
    description: 'Minimum 115 scooters for every provider operating in Seattle from 9am - 7pm',
    start_date: 1633935600000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '83b2d908-8834-494c-a194-4ece340b0956',
        name: 'Minimum 115 scooters or bikes in Equity Zones during the day',
        rule_type: 'count',
        geographies: ['51987827-ed21-48bc-850f-2405897401b5'],
        vehicle_types: ['scooter', 'bicycle'],
        statuses: {},
        minimum: 310,
        start_time: '09:00:00',
        end_time: '19:00:00'
      }
    ]
  },
  {
    policy_id: '8a7b9554-18e8-4955-8e29-d2ce121f245c',
    provider_ids: [],
    name: "Farmers' market Saturday & Sunday",
    description: "No scooters allowed in the farmers' market",
    start_date: 1633849200000,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'd1a05c2e-49dc-4918-9d21-18d72fd85983',
        name: 'No vehicles allowed',
        rule_type: 'count',
        geographies: ['c3dbb50c-bf02-469d-8ed0-536d9dcc9808'],
        vehicle_types: [],
        statuses: {},
        maximum: 0,
        days: ['sun', 'sat'],
        start_time: '09:30:00',
        end_time: '02:00:00'
      }
    ]
  }
]
