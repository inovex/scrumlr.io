import {ViewState} from "types/view";
import {Action, ReduxAction} from "store/action";
import {getFromStorage} from "utils/storage";
import {BOARD_REACTIONS_ENABLE_STORAGE_KEY, HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY} from "constants/storage";

const INITIAL_VIEW_STATE: ViewState = {
  moderating: false,
  serverTimeOffset: 0,
  enabledAuthProvider: [],
  feedbackEnabled: false,
  hotkeysAreActive: true,
  noteFocused: false,
  hotkeyNotificationsEnabled: typeof window !== "undefined" && getFromStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY) !== "false",
  showBoardReactions: typeof window !== "undefined" && getFromStorage(BOARD_REACTIONS_ENABLE_STORAGE_KEY) !== "false",
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
        serverTimeOffset: new Date().getTime() - action.serverTime,
        feedbackEnabled: action.feedbackEnabled,
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

    case Action.SetHotkeyState: {
      return {
        ...state,
        hotkeysAreActive: action.active,
      };
    }

    case Action.OnNoteFocus: {
      return {
        ...state,
        noteFocused: true,
      };
    }

    case Action.OnNoteBlur: {
      return {
        ...state,
        noteFocused: false,
      };
    }

    case Action.EnableHotkeyNotifications: {
      return {
        ...state,
        hotkeyNotificationsEnabled: true,
      };
    }

    case Action.DisableHotkeyNotifications: {
      return {
        ...state,
        hotkeyNotificationsEnabled: false,
      };
    }

    case Action.SetShowBoardReactions: {
      return {
        ...state,
        showBoardReactions: action.show,
      };
    }

    default:
      return state;
  }
};
