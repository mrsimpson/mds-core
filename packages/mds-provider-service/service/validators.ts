import { nullableString, SchemaValidator, uuidSchema } from '@mds-core/mds-schema-validators'
import type { ProviderDomainModel } from '../@types'
import { PROVIDER_TYPES } from '../@types'

export const { validate: validateProviderDomainModel, isValid: isValidProviderDomainModel } =
  SchemaValidator<ProviderDomainModel>({
    type: 'object',
    properties: {
      provider_id: uuidSchema,
      provider_name: { type: 'string' },
      url: nullableString,
      mds_api_url: nullableString,
      gbfs_api_url: nullableString,
      color_code_hex: { type: 'string' },
      provider_types: { type: 'array', items: { type: 'string', enum: PROVIDER_TYPES } }
    },
    required: ['provider_id', 'provider_name', 'color_code_hex']
  })
