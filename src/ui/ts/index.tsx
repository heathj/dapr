import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { App, HotApp } from "./elements/App";
import { rootReducer } from "./reducers/root-reducer";
declare var DEV: boolean;

export const store = createStore(rootReducer);
ReactDOM.render(
  <Provider store={store}>{DEV ? <HotApp /> : <App />}</Provider>,
  document.getElementById("root")
);
