import {configureStore} from "@reduxjs/toolkit";
import {ApplicationState, rootReducer} from "store";
import getTestApplicationState from "./getTestApplicationState";

export default function getTestStore(overwrite?: Partial<ApplicationState>) {
  const preloadedState = getTestApplicationState(overwrite);
  return configureStore<ApplicationState>({
    reducer: rootReducer,
    preloadedState,
  });
}
