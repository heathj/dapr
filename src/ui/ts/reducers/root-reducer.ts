import { combineReducers } from "redux";
import { procs } from "../reducers/procs";

export const rootReducer = combineReducers({ procs });
export type RootState = ReturnType<typeof rootReducer>;
