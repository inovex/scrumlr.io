import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {saveToStorage} from "utils/storage";
import {BOARD_REACTIONS_ENABLE_STORAGE_KEY, HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, THEME_STORAGE_KEY} from "constants/storage";
import {ServerInfo, Theme} from "./types";

export const setServerInfo = createAsyncThunk<ServerInfo, void>("view/setServerInfo", async () => {
  const serverInfo = await API.getServerInfo();
  return serverInfo;
});

export const setTheme = createAsyncThunk<Theme, Theme>("view/setTheme", async (payload) => {
  saveToStorage(THEME_STORAGE_KEY, payload);
  return payload;
});

export const enableHotkeyNotifications = createAsyncThunk<boolean>("view/enableHotkeyNotifications", async () => {
  saveToStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, JSON.stringify(true));
  return true;
});

export const disableHotkeyNotifications = createAsyncThunk<boolean>("view/disableHotkeyNotifications", async () => {
  saveToStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, JSON.stringify(false));
  return false;
});

export const setShowBoardReactions = createAsyncThunk<boolean, boolean>("view/setShowBoardReactions", async (payload) => {
  saveToStorage(BOARD_REACTIONS_ENABLE_STORAGE_KEY, JSON.stringify(payload));
  return payload;
});
