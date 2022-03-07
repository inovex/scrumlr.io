import {Action, ReduxAction} from "store/action";
import {ViewState} from "../../types/view";

const INITIAL_VIEW_STATE: ViewState = {
  moderating: false,
  serverTimeOffset: 0,
  initializationSucceeded: null,
};

// eslint-disable-next-line default-param-last
export const viewReducer = (state: ViewState = INITIAL_VIEW_STATE, action: ReduxAction): ViewState => {
  switch (action.type) {
    case Action.LeaveBoard: {
      return {
        ...state,
        moderating: INITIAL_VIEW_STATE.moderating,
      };
    }

    case Action.UserCheckCompleted:
    case Action.SignIn: {
      return {
        ...state,
        initializationSucceeded: true,
      };
    }

    case Action.InitFailed: {
      return {
        ...state,
        initializationSucceeded: false,
      };
    }

    case Action.SetModerating: {
      return {
        ...state,
        moderating: action.moderating,
      };
    }

    case Action.SetLanguage: {
      return {
        ...state,
        language: action.language,
      };
    }
  }
  return state;
};
