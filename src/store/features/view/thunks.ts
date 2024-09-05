import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {saveToStorage} from "utils/storage";
import {BOARD_REACTIONS_ENABLE_STORAGE_KEY, HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, THEME_STORAGE_KEY} from "constants/storage";
import {setServerInfo} from "./actions";
import {Theme} from "./types";

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

export const setTheme = createAsyncThunk<Theme, Theme>("scrumlr.io/setTheme", async (payload) => {
  saveToStorage(THEME_STORAGE_KEY, payload);
  return payload;
});

export const enableHotkeyNotifications = createAsyncThunk<boolean>("scrumlr.io/enableHotkeyNotifications", async () => {
  saveToStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, JSON.stringify(true));
  return true;
});

export const disableHotkeyNotifications = createAsyncThunk<boolean>("scrumlr.io/disableHotkeyNotifications", async () => {
  saveToStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, JSON.stringify(false));
  return false;
});

export const setShowBoardReactions = createAsyncThunk<boolean, boolean>("scrumlr.io/setShowBoardReactions", async (payload) => {
  saveToStorage(BOARD_REACTIONS_ENABLE_STORAGE_KEY, JSON.stringify(payload));
  return payload;
});