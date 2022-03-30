import configureStore, {MockStoreEnhanced} from "redux-mock-store";
import getTestApplicationState from "./getTestApplicationState";
import {ApplicationState} from "../../types";

export default (overwrite?: Partial<ApplicationState>): MockStoreEnhanced<ApplicationState> => {
  const mockStore = configureStore<ApplicationState>();
  const initialState = getTestApplicationState(overwrite);
  return mockStore(initialState);
};
