const SET_EVENTS = "SET_EVENTS";
const SELECT_EVENT = "SELECT_EVENT";
import { Syscall } from "../../../shared/types";
import { getStoredState } from "./state-storage";

interface SetEventsAction {
  type: typeof SET_EVENTS;
  events: Syscall[];
}

interface SelectEventAction {
  type: typeof SELECT_EVENT;
  id: number;
}

type EventActionTypes = SelectEventAction | SetEventsAction;

export const setEvents = (events: Syscall[]): EventActionTypes => {
  return { type: SET_EVENTS, events };
};
export const selectEvent = (id: number): EventActionTypes => {
  return { type: SELECT_EVENT, id };
};

export interface EventsState {
  events: Syscall[];
  selectedEventID: number;
}
const localStorageKey = "events";
const defaultState = getStoredState(
  {
    events: [],
    selectedEventID: 0
  },
  localStorageKey
);

export const events = (
  state: EventsState = defaultState,
  action: EventActionTypes
): EventsState => {
  let change;
  switch (action.type) {
    case SELECT_EVENT:
      change = { selectedEventID: action.id };
      break;

    case SET_EVENTS:
      change = { events: action.events };
      break;
    default:
      change = {};
  }
  const newState: EventsState = Object.assign({}, state, change);
  // not sure about this yet
  //  localStorage.setItem(localStorageKey, JSON.stringify(newState));
  return newState;
};
