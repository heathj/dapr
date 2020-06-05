import { getStoredState } from "./state-storage";
import { Syscall, SyscallType } from "../../../shared/types";
const TOGGLE_INTERCEPTOR = "TOGGLE_INTERCEPTOR";
const SET_NEXT_SYSCALL = "SET_NEXT_SYSCALL";
const ALTER_CURRENT_SYSCALL = "ALTER_CURRENT_SYSCALL";
interface ToggleInterceptorAction {
  type: typeof TOGGLE_INTERCEPTOR;
}

interface SetNextSyscallAction {
  type: typeof SET_NEXT_SYSCALL;
  nextSyscall: Syscall;
}

interface AlterCurrentSyscall {
  type: typeof ALTER_CURRENT_SYSCALL;
  data: number[];
}

type InterceptorActionTypes =
  | ToggleInterceptorAction
  | SetNextSyscallAction
  | AlterCurrentSyscall;
export const toggleInterceptor = (): InterceptorActionTypes => {
  return { type: TOGGLE_INTERCEPTOR };
};
export const setNextSyscall = (
  nextSyscall: Syscall
): InterceptorActionTypes => {
  return { type: SET_NEXT_SYSCALL, nextSyscall };
};

export const alterCurrentSyscall = (data: number[]): InterceptorActionTypes => {
  return { type: ALTER_CURRENT_SYSCALL, data };
};

export interface InterceptorState {
  enabled: boolean;
  syscall: Syscall;
}
const localStorageKey = "interceptor";
export const defaultSyscall = {
  type: "DEFAULT",
  syscall: SyscallType.IOCTL,
  fd: -1,
  request: -1,
  data: []
};
const defaultState = getStoredState<InterceptorState>(
  {
    enabled: false,
    syscall: defaultSyscall
  },
  localStorageKey
);
export const interceptor = (
  state: InterceptorState = defaultState,
  action: InterceptorActionTypes
): InterceptorState => {
  let change;
  switch (action.type) {
    case TOGGLE_INTERCEPTOR:
      change = { enabled: !state.enabled };
      break;
    case SET_NEXT_SYSCALL:
      change = { syscall: action.nextSyscall };
      break;
    case ALTER_CURRENT_SYSCALL:
      change = {
        syscall: Object.assign({}, state.syscall, { data: action.data })
      };
      break;
    default:
      change = {};
  }

  const newState: InterceptorState = Object.assign({}, state, change);

  localStorage.setItem(localStorageKey, JSON.stringify(newState));
  return newState;
};
