import { combineReducers } from "redux";
import { procs } from "./procs";
import { events } from "./events";
import { interceptor } from "./interceptor";
export const rootReducer = combineReducers({ procs, events, interceptor });
export type RootState = ReturnType<typeof rootReducer>;
