import { VEHICLE_STATES, VEHICLE_EVENTS, VEHICLE_STATE, VEHICLE_EVENT } from '@mds-core/mds-types'

const stateTransitionDict: {
  [S in VEHICLE_STATE]: Partial<
    {
      [E in VEHICLE_EVENT]: VEHICLE_STATE
    }
  >
} = {
  [VEHICLE_STATES.available]: {
    [VEHICLE_EVENTS.deregister]: VEHICLE_STATES.inactive,
    [VEHICLE_EVENTS.agency_pick_up]: VEHICLE_STATES.removed,
    [VEHICLE_EVENTS.service_end]: VEHICLE_STATES.unavailable,
    [VEHICLE_EVENTS.trip_start]: VEHICLE_STATES.trip
  },
  [VEHICLE_STATES.elsewhere]: {
    [VEHICLE_EVENTS.trip_enter]: VEHICLE_STATES.trip,
    [VEHICLE_EVENTS.provider_pick_up]: VEHICLE_STATES.removed,
    [VEHICLE_EVENTS.deregister]: VEHICLE_STATES.inactive,
    [VEHICLE_EVENTS.provider_drop_off]: VEHICLE_STATES.available
  },
  [VEHICLE_STATES.inactive]: {
    [VEHICLE_EVENTS.register]: VEHICLE_STATES.removed
  },
  [VEHICLE_STATES.removed]: {
    [VEHICLE_EVENTS.trip_enter]: VEHICLE_STATES.trip,
    [VEHICLE_EVENTS.provider_drop_off]: VEHICLE_STATES.available,
    [VEHICLE_EVENTS.deregister]: VEHICLE_STATES.inactive
  },
  [VEHICLE_STATES.reserved]: {
    [VEHICLE_EVENTS.trip_start]: VEHICLE_STATES.trip,
    [VEHICLE_EVENTS.cancel_reservation]: VEHICLE_STATES.available
  },
  [VEHICLE_STATES.trip]: {
    [VEHICLE_EVENTS.trip_leave]: VEHICLE_STATES.elsewhere,
    [VEHICLE_EVENTS.trip_end]: VEHICLE_STATES.available
  },
  [VEHICLE_STATES.unavailable]: {
    [VEHICLE_EVENTS.service_start]: VEHICLE_STATES.available,
    [VEHICLE_EVENTS.deregister]: VEHICLE_STATES.inactive,
    [VEHICLE_EVENTS.agency_pick_up]: VEHICLE_STATES.removed,
    [VEHICLE_EVENTS.provider_pick_up]: VEHICLE_STATES.removed
  }
}

const getNextState = (currStatus: VEHICLE_STATE, nextEvent: VEHICLE_EVENT): VEHICLE_STATE | undefined => {
  return stateTransitionDict[currStatus]?.[nextEvent]
}

const generateTransitionLabel = (
  status: VEHICLE_STATE,
  nextStatus: VEHICLE_STATE,
  transitionEvent: VEHICLE_EVENT
) => {
  return `${status} -> ${nextStatus} [ label = ${transitionEvent} ]`
}

// Punch this output into http://www.webgraphviz.com/
const generateGraph = () => {
  const graphEntries = []
  const statuses: VEHICLE_STATE[] = Object.values(VEHICLE_STATES)
  for (const status of statuses) {
    const eventTransitions: VEHICLE_EVENT[] = Object.keys(stateTransitionDict[status]) as VEHICLE_EVENT[]
    for (const event of eventTransitions) {
      if (event) {
        const nextStatus: VEHICLE_STATE | undefined = stateTransitionDict[status][event]
        if (nextStatus) {
          graphEntries.push(`\t${generateTransitionLabel(status, nextStatus, event)}`)
        }
      }
    }
  }
  return `digraph G {\n${graphEntries.join('\n')}\n}`
}

export { stateTransitionDict, getNextState, generateGraph }
