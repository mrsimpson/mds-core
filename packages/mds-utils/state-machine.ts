import { VEHICLE_STATUSES, VEHICLE_STATUS, VEHICLE_EVENT } from '@mds-core/mds-types'

/* FIXME: Update to support Taxi */
const stateTransitionDict: {
  [S in VEHICLE_STATUS]: Partial<
    {
      [E in VEHICLE_EVENT]: VEHICLE_STATUS
    }
  >
} = {
  available: {
    deregister: 'inactive',
    agency_pick_up: 'removed',
    service_end: 'unavailable',
    trip_start: 'trip'
  },
  elsewhere: {
    trip_enter: 'trip',
    provider_pick_up: 'removed',
    deregister: 'inactive',
    provider_drop_off: 'available'
  },
  inactive: {
    register: 'removed'
  },
  removed: {
    trip_enter: 'trip',
    provider_drop_off: 'available',
    deregister: 'inactive'
  },
  reserved: {
    trip_start: 'trip',
    cancel_reservation: 'available'
  },
  trip: {
    trip_leave: 'elsewhere',
    trip_end: 'available'
  },
  unavailable: {
    service_start: 'available',
    deregister: 'inactive',
    agency_pick_up: 'removed',
    provider_pick_up: 'removed'
  }
}

const getNextState = (currStatus: VEHICLE_STATUS, nextEvent: VEHICLE_EVENT): VEHICLE_STATUS | undefined => {
  return stateTransitionDict[currStatus]?.[nextEvent]
}

const generateTransitionLabel = (
  status: VEHICLE_STATUS,
  nextStatus: VEHICLE_STATUS,
  transitionEvent: VEHICLE_EVENT
) => {
  return `${status} -> ${nextStatus} [ label = ${transitionEvent} ]`
}

// Punch this output into http://www.webgraphviz.com/
const generateGraph = () => {
  const graphEntries = []
  const statuses: VEHICLE_STATUS[] = Object.values(VEHICLE_STATUSES)
  for (const status of statuses) {
    const eventTransitions: VEHICLE_EVENT[] = Object.keys(stateTransitionDict[status]) as VEHICLE_EVENT[]
    for (const event of eventTransitions) {
      if (event) {
        const nextStatus: VEHICLE_STATUS | undefined = stateTransitionDict[status][event]
        if (nextStatus) {
          graphEntries.push(`\t${generateTransitionLabel(status, nextStatus, event)}`)
        }
      }
    }
  }
  return `digraph G {\n${graphEntries.join('\n')}\n}`
}

export { stateTransitionDict, getNextState, generateGraph }
