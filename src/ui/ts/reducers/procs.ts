import { Process } from "../../../shared/types";

const SET_PROCS = "SET_PROCS";
const SELECT_PROC = "SELECT_PROC";
const DESELECT_PROC = "DESELECT_PROC";

interface SetProcsAction {
  type: typeof SET_PROCS;
  procs: Process[];
}

interface SelectProcAction {
  type: typeof SELECT_PROC;
  id: number;
}

interface DeselectProcAction {
  type: typeof DESELECT_PROC;
  id: number;
}

type ProcActionTypes = SelectProcAction | SetProcsAction | DeselectProcAction;

export const setProcs = (procs: Process[]): ProcActionTypes => {
  return { type: SET_PROCS, procs };
};
export const selectProc = (id: number): ProcActionTypes => {
  return { type: SELECT_PROC, id };
};
export const deselectProc = (id: number): ProcActionTypes => {
  return { type: DESELECT_PROC, id };
};

export interface ProcsState {
  procs: Process[];
  selectedProcIDs: number[];
}
const localStorageKey = "procs";
const getStoredState = (defaultState: ProcsState): ProcsState => {
  const stateString = localStorage.getItem(localStorageKey);
  if (!stateString) {
    return defaultState;
  }
  const state: ProcsState = JSON.parse(stateString);
  if (!state) {
    return defaultState;
  }
  return state;
};
const defaultState = getStoredState({
  procs: [],
  selectedProcIDs: []
});

export const procs = (
  state: ProcsState = defaultState,
  action: ProcActionTypes
): ProcsState => {
  let change;
  switch (action.type) {
    case SELECT_PROC:
      change = { selectedProcIDs: [...state.selectedProcIDs, action.id] };
      break;
    case DESELECT_PROC:
      change = {
        selectedProcIDs: state.selectedProcIDs.filter(id => id !== action.id)
      };
      break;
    case SET_PROCS:
      change = { procs: action.procs };
      break;
    default:
      change = {};
  }
  const newState: ProcsState = Object.assign({}, state, change);
  localStorage.setItem(localStorageKey, JSON.stringify(newState));
  return newState;
};
