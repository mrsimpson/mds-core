import type { ProviderDomainModel } from '../@types'

// Officially recognized providers, from:
// https://github.com/CityOfLosAngeles/mobility-data-specification/blob/dev/providers.csv
export const JUMP_PROVIDER_ID = 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0'
export const LIME_PROVIDER_ID = '63f13c48-34ff-49d2-aca7-cf6a5b6171c3'
export const BIRD_PROVIDER_ID = '2411d395-04f2-47c9-ab66-d09e9e3c3251'
export const RAZOR_PROVIDER_ID = '6ddcc0ad-1d66-4046-bba4-d1d96bb8ca4d'
export const LYFT_PROVIDER_ID = 'e714f168-ce56-4b41-81b7-0b6a4bd26128'
export const SKIP_PROVIDER_ID = 'd73fcf80-22b1-450f-b535-042b4e30aac7'
export const HOPR_PROVIDER_ID = '2e4cb206-b475-4a9d-80fb-0880c9a033e0'
export const WHEELS_PROVIDER_ID = 'b79f8687-526d-4ae6-80bf-89b4c44dc071'
export const SPIN_PROVIDER_ID = '70aa475d-1fcd-4504-b69c-2eeb2107f7be'
export const WIND_PROVIDER_ID = 'd56d2df6-fa92-43de-ab61-92c3a84acd7d'
export const TIER_PROVIDER_ID = '264aad41-b47c-415d-8585-0208d436516e'
export const CLOUD_PROVIDER_ID = 'bf95148b-d1d1-464e-a140-6d2563ac43d4'
export const BLUE_LA_PROVIDER_ID = 'f3c5a65d-fd85-463e-9564-fc95ea473f7d'
export const BOLT_PROVIDER_ID = '3291c288-c9c8-42f1-bc3e-8502b077cd7f'
export const CLEVR_PROVIDER_ID = 'daecbe87-a9f2-4a5a-b5df-8e3e14180513'
export const SHERPA_LA_PROVIDER_ID = '3c95765d-4da6-41c6-b61e-1954472ec6c9'
export const OJO_ELECTRIC_PROVIDER_ID = '8d293326-8464-4256-8312-617ebcd0efad'
export const CIRC_PROVIDER_ID = '03d5d605-e5c9-45a1-a1dd-144aa8649525'
export const SUPERPEDESTRIAN_PROVIDER_ID = '420e6e94-55a6-4946-b6b3-4398fe22e912'
export const BOAZ_BIKES_PROVIDER_ID = '7c96bc58-fb63-433a-b77f-84ccb1c9d737'
export const HELBIZ_PROVIDER_ID = '3aece8c6-416a-4d39-bcc4-d02524cb8004'
export const TUKTUK_PROVIDER_ID = '1a99bf67-14a0-48a1-98d1-77147a88c3d2'
export const VEO_RIDE_PROVIDER_ID = '6e39f9db-751b-5cea-ae7e-486f579a56bc'

// Additional provider IDs in use (should be registered)
export const LADOT_PROVIDER_ID = '33bbcec3-f91b-4461-bc41-61711afb9460'
export const BLUE_SYSTEMS_PROVIDER_ID = '5674ea42-a2ab-42e0-b9fd-cbade6cb2561'
export const TEST1_PROVIDER_ID = '5f7114d1-4091-46ee-b492-e55875f7de00'
export const TEST2_PROVIDER_ID = '45f37d69-73ca-4ca6-a461-e7283cffa01a'
export const LA_YELLOW_CAB_PROVIDER_ID = '286b317e-3c6c-498e-8920-94f7bd1bb3e7'
export const UNITED_CHECKER_CAB_PROVIDER_ID = 'dfd96a1e-b785-42f3-9f47-9dbfd83ce62e'
export const UNITED_INDEPENDENTS_TAXI_DRIVERS_PROVIDER_ID = '6402f0ec-f5dd-4617-9114-acccd36a1b91'
export const BEVERLY_HILLS_CAB_CO_PROVIDER_ID = '94e63f1b-22ee-41e2-871d-cca6f778c042'
export const INDEPENDENT_TAXI_OWNERS_PROVIDER_ID = 'cc753448-0479-4fac-9ca2-4ae3db19fb36'
export const DIVVY_PROVIDER_ID = '00ae867e-661f-4da0-9f79-e0f41930aea0'

// PROVIDER_ID value for Jest Testing
export const JEST_PROVIDER_ID = 'c8051767-4b14-4794-abc1-85aad48baff1'

// Support PROVIDER_ID values (Reserved for support use)
export const SUPPORT1_PROVIDER_ID = '09828cf3-9b85-449b-bc8f-d3aaef5c3448'
export const SUPPORT2_PROVIDER_ID = 'fa5f6ce0-c038-4027-9c2c-a693f1ed7533'
export const SUPPORT3_PROVIDER_ID = '9944b4cd-58a3-4969-a6d4-c131ff0b2111'

export const FALLBACK_PROVIDERS: ProviderDomainModel[] = [
  {
    provider_id: JUMP_PROVIDER_ID,
    provider_name: 'JUMP',
    color_code_hex: '#000',
    url: 'https://jump.com',
    gbfs_api_url: null,
    mds_api_url: 'https://api.uber.com/v0.2/emobility/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: LIME_PROVIDER_ID,
    provider_name: 'Lime',
    color_code_hex: '#000',
    url: 'https://li.me',
    gbfs_api_url: null,
    mds_api_url: 'https://data.lime.bike/api/partners/v1/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: BIRD_PROVIDER_ID,
    provider_name: 'Bird',
    color_code_hex: '#000',
    url: 'https://www.bird.co',
    mds_api_url: 'https://mds.bird.co',
    gbfs_api_url: 'https://mds.bird.co/gbfs',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: CIRC_PROVIDER_ID,
    provider_name: 'Circ',
    color_code_hex: '#000',
    url: 'https://www.circ.com',
    gbfs_api_url: null,
    mds_api_url: 'https://mds.bird.co',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: RAZOR_PROVIDER_ID,
    provider_name: 'Razor',
    color_code_hex: '#000',
    url: 'https: //www.razor.com/share',
    gbfs_api_url: null,
    mds_api_url: 'https: //razor-200806.appspot.com/api/v2/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: LYFT_PROVIDER_ID,
    provider_name: 'Lyft',
    color_code_hex: '#000',
    url: 'https://www.lyft.com',
    gbfs_api_url: null,
    mds_api_url: 'https: //api.lyft.com/v1/last-mile/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SKIP_PROVIDER_ID,
    provider_name: 'Skip',
    color_code_hex: '#000',
    url: 'https://www.skipscooters.com',
    gbfs_api_url: null,
    mds_api_url: 'https://api.skipscooters.com/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: HOPR_PROVIDER_ID,
    provider_name: 'HOPR',
    color_code_hex: '#000',
    url: 'https://gohopr.com',
    gbfs_api_url: null,
    mds_api_url: 'https://gbfs.hopr.city/api/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: WHEELS_PROVIDER_ID,
    provider_name: 'Wheels',
    color_code_hex: '#000',
    url: 'https://wheels.co',
    gbfs_api_url: null,
    mds_api_url: 'https://mds.getwheelsapp.com',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SPIN_PROVIDER_ID,
    provider_name: 'Spin',
    color_code_hex: '#000',
    url: 'https://www.spin.app',
    gbfs_api_url: null,
    mds_api_url: 'https://api.spin.pm/api/v1/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: WIND_PROVIDER_ID,
    provider_name: 'WIND',
    color_code_hex: '#000',
    url: 'https://www.wind.co',
    gbfs_api_url: null,
    mds_api_url: 'https://partners.wind.co/v1/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: TIER_PROVIDER_ID,
    provider_name: 'Tier',
    color_code_hex: '#000',
    url: 'https://www.tier.app',
    gbfs_api_url: null,
    mds_api_url: 'https://partner.tier-services.io/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: CLOUD_PROVIDER_ID,
    provider_name: 'Cloud',
    color_code_hex: '#000',
    url: 'https://www.cloud.tt',
    mds_api_url: 'https://mds.cloud.tt',
    gbfs_api_url: 'https://mds.cloud.tt/gbfs',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: BLUE_LA_PROVIDER_ID,
    provider_name: 'BlueLA',
    color_code_hex: '#000',
    url: 'https://www.bluela.com',
    mds_api_url: 'https://api.bluela.com/mds/v0',
    gbfs_api_url: 'https://api.bluela.com/gbfs/v1/meta',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: BOLT_PROVIDER_ID,
    provider_name: 'Bolt',
    color_code_hex: '#000',
    url: 'https://www.micromobility.com/',
    gbfs_api_url: null,
    mds_api_url: 'https://bolt.miami/bolt2/api/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: CLEVR_PROVIDER_ID,
    provider_name: 'CLEVR',
    color_code_hex: '#000',
    url: 'https://clevrmobility.com',
    mds_api_url: 'https://portal.clevrmobility.com/api/la/',
    gbfs_api_url: 'https://portal.clevrmobility.com/api/gbfs/en/discovery/',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SHERPA_LA_PROVIDER_ID,
    provider_name: 'SherpaLA',
    color_code_hex: '#000',
    url: null,
    mds_api_url: 'https://mds.bird.co',
    gbfs_api_url: 'https://mds.bird.co/gbfs/platform-partner/sherpa-la',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: OJO_ELECTRIC_PROVIDER_ID,
    provider_name: 'OjO Electric',
    color_code_hex: '#000',
    url: 'https://www.ojoelectric.com',
    mds_api_url: 'https://api.ojoelectric.com/api/mds',
    gbfs_api_url: 'https://api.ojoelectric.com/api/mds/gbfs.json',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SUPERPEDESTRIAN_PROVIDER_ID,
    provider_name: 'Superpedestrian',
    color_code_hex: '#000',
    url: 'https://www.superpedestrian.com',
    gbfs_api_url: null,
    mds_api_url: 'https://wrangler-mds-production.herokuapp.com/mds',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: BOAZ_BIKES_PROVIDER_ID,
    provider_name: 'Boaz Bikes',
    color_code_hex: '#000',
    url: 'https://www.boazbikes.com/',
    mds_api_url: 'https://mds.movatic.co/',
    gbfs_api_url: 'https://gbsf.movatic.co/en/1.1/576347857979998215',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: HELBIZ_PROVIDER_ID,
    provider_name: 'Helbiz',
    color_code_hex: '#000',
    url: 'https://helbiz.com/',
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: TUKTUK_PROVIDER_ID,
    provider_name: 'TukTuk',
    color_code_hex: '#000',
    url: 'https://tuktukscooters.com/',
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: VEO_RIDE_PROVIDER_ID,
    provider_name: 'VeoRide INC.',
    color_code_hex: '#000',
    url: 'https://www.veoride.com/',
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: LADOT_PROVIDER_ID,
    provider_name: 'LADOT',
    color_code_hex: '#000',
    url: 'https://ladot.io',
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: BLUE_SYSTEMS_PROVIDER_ID,
    provider_name: 'Blue Systems',
    color_code_hex: '#000',
    url: 'https://www.bluesystems.ai',
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: LA_YELLOW_CAB_PROVIDER_ID,
    provider_name: 'LA Yellow Cab',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: UNITED_CHECKER_CAB_PROVIDER_ID,
    provider_name: 'United Checker Cab',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: UNITED_INDEPENDENTS_TAXI_DRIVERS_PROVIDER_ID,
    provider_name: 'United Independents Taxi Drivers',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: BEVERLY_HILLS_CAB_CO_PROVIDER_ID,
    provider_name: 'Beverly Hills Cab Co.',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: INDEPENDENT_TAXI_OWNERS_PROVIDER_ID,
    provider_name: 'Independent Taxi Owners',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: DIVVY_PROVIDER_ID,
    provider_name: 'Divvy',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: 'https://gbfs.divvybikes.com',
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: TEST1_PROVIDER_ID,
    provider_name: 'Test 1',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: TEST2_PROVIDER_ID,
    provider_name: 'Test 2',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: JEST_PROVIDER_ID,
    provider_name: 'Jest Test Provider',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SUPPORT1_PROVIDER_ID,
    provider_name: 'Support 1',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SUPPORT2_PROVIDER_ID,
    provider_name: 'Support 2',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  },
  {
    provider_id: SUPPORT3_PROVIDER_ID,
    provider_name: 'Support 3',
    color_code_hex: '#000',
    url: null,
    mds_api_url: null,
    gbfs_api_url: null,
    provider_types: ['mds_micromobility']
  }
]
