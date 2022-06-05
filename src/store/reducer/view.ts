import {ViewState} from "types/view";
import {Action, ReduxAction} from "store/action";

const INITIAL_VIEW_STATE: ViewState = {
  moderating: false,
  serverTimeOffset: 0,
  enabledAuthProvider: [],
};

// eslint-disable-next-line @typescript-eslint/default-param-last
export const viewReducer = (state: ViewState = INITIAL_VIEW_STATE, action: ReduxAction): ViewState => {
  switch (action.type) {
    case Action.LeaveBoard: {
      return {
        ...state,
        moderating: INITIAL_VIEW_STATE.moderating,
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

    case Action.SetServerInfo: {
      return {
        ...state,
        enabledAuthProvider: action.enabledAuthProvider,
        serverTimeOffset: new Date().getTime() - action.serverTime.getTime(),
      };
    }

    case Action.SetRoute: {
      return {
        ...state,
        route: action.route,
      };
    }

    case Action.UpdatedParticipant: {
      if (action.participant.user.id === action.context.user && action.participant.role === "PARTICIPANT" && state.moderating === true) {
        return {
          ...state,
          moderating: INITIAL_VIEW_STATE.moderating,
        };
      }
      return state;
    }

    default:
      return state;
  }
};
