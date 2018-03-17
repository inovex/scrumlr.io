import { Action } from 'redux';

import {
  USER_REGISTERED,
  SETUP_COMPLETED,
  SETUP_FAILED,
  EDIT_STATUS,
  MODAL_STATUS
} from '../actions';
import { ActiveStatusAction } from '../actions/ActiveStatusAction';

export interface AppState {
  registered: boolean;
  setupCompleted: boolean;
  keyboardNavigationEnabled: boolean;
}

const initialState: AppState = {
  registered: false,
  setupCompleted: false,
  keyboardNavigationEnabled: true
};

export function app(state: AppState = initialState, action: Action): AppState {
  switch (action.type) {
    case USER_REGISTERED:
      return { ...state, registered: true };
    case SETUP_COMPLETED:
      return { ...state, setupCompleted: true };
    case SETUP_FAILED:
      return { ...state, setupCompleted: false };
    case EDIT_STATUS:
    case MODAL_STATUS:
      return {
        ...state,
        keyboardNavigationEnabled: !(action as ActiveStatusAction).isActive
      };
    default:
      return state;
  }
}
