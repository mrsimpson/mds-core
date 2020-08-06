import Joi, { ValidationError } from '@hapi/joi'
import { TripMetadata } from '@mds-core/mds-types'
import { RuntimeError } from '@mds-core/mds-utils'
import { uuidSchema, ValidateSchema } from './validators'

export const tripMetadataSchema = Joi.object().keys({
  provider_id: uuidSchema.required(),
  trip_id: uuidSchema.required()
})

export const validateTripMetadata = (metadata: unknown) => {
  if (ValidateSchema<TripMetadata>(metadata, tripMetadataSchema, { assert: true, allowUnknown: true })) return metadata
  throw new RuntimeError('This should never happen')
}
