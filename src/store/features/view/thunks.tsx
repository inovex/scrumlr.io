import {createAsyncThunk, Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18n";
import {Toast} from "utils/Toast";
import {saveToStorage} from "utils/storage";
import {BOARD_REACTIONS_ENABLE_STORAGE_KEY, HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, THEME_STORAGE_KEY} from "constants/storage";
import store from "../../index";
import {setServerInfo} from "./actions";

export const initApplication = createAsyncThunk("scrumlr.io/initApplication", async (_payload, {dispatch}) => {
  API.getServerInfo().then((r) => {
    dispatch(
      setServerInfo({
        anonymousLoginDisabled: r.anonymousLoginDisabled,
        enabledAuthProvider: r.authProvider || [],
        serverTime: new Date(r.serverTime).getTime(),
        feedbackEnabled: r.feedbackEnabled,
      })
    );
  });
});

export const passViewMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.InitApplication) {
    API.getServerInfo()
      .then((r) => {
        dispatch(Actions.setServerInfo(r.anonymousLoginDisabled, r.authProvider || [], new Date(r.serverTime).getTime(), r.feedbackEnabled));
      })
      .catch(() => {
        i18n.on("loaded", () => {
          Toast.error({
            title: i18n.t("Error.initApplication"),
            buttons: [i18n.t("Error.retry")],
            firstButtonOnClick: () => store.dispatch(Actions.initApplication()),
            autoClose: false,
          });
        });
      });
  }

  if (action.type === Action.SetTheme) {
    if (typeof window !== undefined) {
      saveToStorage(THEME_STORAGE_KEY, action.theme);
    }
  }

  if (action.type === Action.EnableHotkeyNotifications) {
    if (typeof window !== undefined) {
      saveToStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, JSON.stringify(true));
    }
  }

  if (action.type === Action.DisableHotkeyNotifications) {
    if (typeof window !== undefined) {
      saveToStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, JSON.stringify(false));
    }
  }

  if (action.type === Action.SetShowBoardReactions) {
    if (typeof window !== undefined) {
      saveToStorage(BOARD_REACTIONS_ENABLE_STORAGE_KEY, JSON.stringify(action.show));
    }
  }
};
