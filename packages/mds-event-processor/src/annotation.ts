import { AnnotationData, GpsData } from '@mds-core/mds-types'
import { findServiceAreas } from './geo/geo'

const version = 1.0
/* This function is called on each event processed. It calculates the annotation data and
 * returns it. To be used with mds geography related things.
 */
function getAnnotationData(gps: GpsData): AnnotationData {
  const areas = findServiceAreas(gps.lng, gps.lat)
  const in_bound = areas.length > 0
  const annotation: AnnotationData = { in_bound, areas }
  return annotation
}

/* This function keeps track of the version of annotation, in case it gets updated in the future, and we need to backprocess.
 *
 */
function getAnnotationVersion() {
  return version
}

export { getAnnotationData, getAnnotationVersion }
