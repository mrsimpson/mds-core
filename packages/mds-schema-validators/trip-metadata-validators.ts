import Joi from '@hapi/joi'
import { TripMetadata, RESERVATION_METHODS, RESERVATION_TYPES } from '@mds-core/mds-types'
import { RuntimeError } from '@mds-core/mds-utils'
import {
  uuidSchema,
  ValidateSchema,
  numberSchema,
  timestampSchema,
  accessibilityOptionsSchema,
  stringSchema
} from './validators'

export const tripMetadataSchema = Joi.object().keys({
  trip_id: uuidSchema.required(),
  provider_id: uuidSchema.required(),
  reserve_time: timestampSchema.required(),
  dispatch_time: timestampSchema.required(),
  trip_start_time: timestampSchema.required(),
  trip_end_time: timestampSchema.required(),
  distance: numberSchema.required(),
  accessibility_options_used: Joi.array().items(accessibilityOptionsSchema).required(),
  fare: Joi.object().keys({
    quoted_cost: numberSchema.required(),
    actual_cost: numberSchema.required(),
    components: Joi.object().required(),
    currency: stringSchema.required(),
    payment_methods: Joi.object().required() // loose validation for now
  }),
  reservation_method: stringSchema.valid(...RESERVATION_METHODS).required(),
  reservation_type: stringSchema.valid(...RESERVATION_TYPES).required()
})

export const validateTripMetadata = (metadata: unknown) => {
  if (ValidateSchema<TripMetadata>(metadata, tripMetadataSchema, { assert: true, allowUnknown: true })) return metadata
  throw new RuntimeError('This should never happen')
}
