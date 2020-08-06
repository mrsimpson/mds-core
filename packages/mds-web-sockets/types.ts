export const ENTITY_TYPES = ['event', 'telemetry', 'trip_metadata'] as const
export type ENTITY_TYPE = typeof ENTITY_TYPES[number]
