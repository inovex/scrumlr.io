import {Action, ReduxAction} from "store/action";
import {ViewState} from "../../types/view";

const INITIAL_VIEW_STATE: ViewState = {
  moderating: false,
  serverTimeOffset: 0,
};

// eslint-disable-next-line default-param-last
export const viewReducer = (state: ViewState = INITIAL_VIEW_STATE, action: ReduxAction): ViewState => {
  switch (action.type) {
    case Action.LeaveBoard: {
      return INITIAL_VIEW_STATE;
    }

    case Action.SetModerating: {
      return {
        ...state,
        moderating: action.moderating,
      };
    }
  }
  return state;
};
