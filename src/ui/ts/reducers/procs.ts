import { Process } from "../../../shared/types/procs";

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
const defaultState = {
  procs: [],
  selectedProcIDs: [],
};

export const procs = (
  state: ProcsState = defaultState,
  action: ProcActionTypes
): ProcsState => {
  switch (action.type) {
    case SELECT_PROC:
      return Object.assign({}, state, {
        selectedProcIDs: [...state.selectedProcIDs, action.id],
      });
    case DESELECT_PROC:
      return Object.assign({}, state, {
        selectedProcIDs: state.selectedProcIDs.filter((id) => id !== action.id),
      });
    case SET_PROCS:
      return Object.assign({}, state, {
        procs: action.procs,
      });
    default:
      return state;
  }
};
