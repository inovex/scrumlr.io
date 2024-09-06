import configureStore, {MockStoreEnhanced} from "redux-mock-store";
import {ApplicationState} from "store";
import getTestApplicationState from "./getTestApplicationState";

export default (overwrite?: Partial<ApplicationState>): MockStoreEnhanced<ApplicationState> => {
  const mockStore = configureStore<ApplicationState>();
  const initialState = getTestApplicationState(overwrite);
  return mockStore(initialState);
};
