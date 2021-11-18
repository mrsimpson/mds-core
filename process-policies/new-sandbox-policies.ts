export const policies = [
  {
    policy_id: 'dbd724c6-6035-4216-ab83-f2b9f6164669',
    provider_ids: [],
    name: 'Micromobility Provider dropoff rules for downtown',
    description: 'Providers can drop a maximum of 30 vehicles in the 5 new dropoff zones',
    start_date: 1637143385103,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '78082b97-7367-4073-8bde-4165a60edbce',
        name: 'Maximum 35 vehicles deployed to downtown parking zones in the morning',
        rule_type: 'count',
        geographies: ['285a69fc-237d-4820-9c89-d9fdcd14d44f'],
        vehicle_types: ['scooter', 'bicycle'],
        maximum: 35,
        start_time: '05:00:00',
        end_time: '11:00:00',
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      },
      {
        rule_id: '5ae1ca28-de7e-4bf6-889b-25316d69a74b',
        name: 'No Provider dropoffs allowed here in the morning',
        rule_type: 'count',
        geographies: ['74b95e5a-e089-4246-a4e7-67c16026927c'],
        vehicle_types: ['scooter', 'bicycle'],
        maximum: 0,
        start_time: '05:00:00',
        end_time: '10:00:00',
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '266f6de5-fc27-434f-8474-348e8099d2b6',
    provider_ids: [],
    name: 'Car share Provider dropoff rules for downtown',
    description:
      'When deploying shared vehicles, providers may not deploy more than 20 vehicles in the downtown area due to limited parking',
    start_date: 1637143385103,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '77642aa1-c1ce-4326-9fbd-aa821624482c',
        name: 'No more than 20 cars may be deployed by providers downtown at any time',
        rule_type: 'count',
        geographies: ['74b95e5a-e089-4246-a4e7-67c16026927c'],
        vehicle_types: [],
        minimum: 0,
        maximum: 20,
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '772e3209-ba42-46d0-97d8-d879f678702e',
    provider_ids: [],
    name: 'Slow Zone for Downtown Walk Streets',
    description: 'Throttle down to 5 mph in designated downtown walk streets',
    start_date: 1637143385104,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'fc6b84ac-df4f-4d96-ab87-07f0c3aaa380',
        name: '5 MPH speed limit ',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['7d6d2c28-1292-41ab-ac00-60eabcd7392d'],
        vehicle_types: ['scooter', 'bicycle'],
        maximum: 5,
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '6de7cf2a-72ba-4910-a0de-0c13d5871211',
    provider_ids: [],
    name: 'Flat micromobility trip fees for Belltown',
    description: '$0.25 per micromobility ride started or ended in Belltown',
    start_date: 1637143385104,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'bc871c44-d38e-4781-a9d4-b9a8f8c9db2f',
        name: '$0.25 per trip started or ended in Belltown',
        rule_type: 'count',
        geographies: ['c6b05565-d4a3-4952-be0b-5f7ffad36c3a'],
        vehicle_types: [],
        maximum: 0,
        states: {
          available: ['trip_end', 'trip_start'],
          elsewhere: ['trip_end', 'trip_start'],
          non_operational: ['trip_end', 'trip_start'],
          on_trip: ['trip_end', 'trip_start'],
          removed: ['trip_end', 'trip_start'],
          reserved: ['trip_end', 'trip_start'],
          unknown: ['trip_end', 'trip_start']
        },
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '2861382a-0995-4b2f-a0e0-6bf4840c2c38',
    provider_ids: ['e714f168-ce56-4b41-81b7-0b6a4bd26128'],
    name: 'Fleet Caps for Lyft',
    description: 'Lyft is limited to a maximum of 100 bicycles and 343 scooters in all of Seattle',
    start_date: 1637143385104,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '68df4d67-a9d3-42a7-af6d-f0b0788f590f',
        name: '100 Bicycles allowed',
        rule_type: 'count',
        geographies: ['996c4f62-758a-401a-99bb-731c06e211d1'],
        vehicle_types: ['bicycle'],
        minimum: 0,
        maximum: 100,
        states: {},
        modality: 'micromobility'
      },
      {
        rule_id: 'ea113041-0954-4bfe-ba03-fe54d3fb6595',
        name: '343 Scooters allowed ',
        rule_type: 'count',
        geographies: ['996c4f62-758a-401a-99bb-731c06e211d1'],
        vehicle_types: ['scooter'],
        minimum: 0,
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '1f724366-14ab-4df8-ad5c-cdbd7c65fb2a',
    provider_ids: [],
    name: '5 MPH speed limit around the Space Needle',
    description: 'Limit speed to 5mph around the Space Needle',
    start_date: 1637143385104,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '9c1aa1d7-0e77-4ec0-b467-cd35db9d592d',
        name: '5MPH limit around the Space Needle',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['b5ea8bcf-f458-46f7-bb0c-8e4acdd88954'],
        vehicle_types: [],
        maximum: 5,
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '0c5f2c9f-e62c-4301-9dfc-14d5e01f5cbc',
    provider_ids: [],
    name: 'Equity Zone Minimum scooter deployment',
    description: 'Minimum 115 scooters for every provider operating in Seattle from 9am - 7pm',
    start_date: 1637143385104,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '32778b25-76c5-4fdf-9af0-5637bdbb96a9',
        name: 'Minimum 115 scooters or bikes in Equity Zones during the day',
        rule_type: 'count',
        geographies: ['51987827-ed21-48bc-850f-2405897401b5'],
        vehicle_types: ['scooter', 'bicycle'],
        minimum: 310,
        start_time: '09:00:00',
        end_time: '19:00:00',
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '43b221a2-ac46-4032-8d10-a3cae8e7f6bf',
    provider_ids: [],
    name: "Farmers' market Saturday & Sunday",
    description: "No scooters allowed in the farmers' market",
    start_date: 1637143385105,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'f92d689f-d41f-4fd9-b4b0-cd242c60eeec',
        name: 'No vehicles allowed',
        rule_type: 'count',
        geographies: ['c3dbb50c-bf02-469d-8ed0-536d9dcc9808'],
        vehicle_types: [],
        maximum: 0,
        days: ['sun', 'sat'],
        start_time: '09:30:00',
        end_time: '02:00:00',
        states: {},
        modality: 'micromobility'
      }
    ]
  }
]
