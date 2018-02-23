import { Action } from 'redux';

import { USER_REGISTERED, SETUP_COMPLETED, SETUP_FAILED } from '../actions';

export interface AppState {
  registered: boolean;
  setupCompleted: boolean;
}

const initialState: AppState = {
  registered: false,
  setupCompleted: false
};

export function app(state: AppState = initialState, action: Action): AppState {
  switch (action.type) {
    case USER_REGISTERED:
      return { ...state, registered: true };
    case SETUP_COMPLETED:
      return { ...state, setupCompleted: true };
    case SETUP_FAILED:
      return { ...state, setupCompleted: false };
    default:
      return state;
  }
}
