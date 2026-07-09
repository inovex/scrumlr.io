import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {saveToStorage} from "utils/storage";
import {
  BOARD_REACTIONS_ENABLE_STORAGE_KEY,
  HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  SNOWFALL_STORAGE_KEY,
  SNOWFALL_NOTIFICATION_STORAGE_KEY,
} from "constants/storage";
import {retryable} from "store";
import i18n from "i18next";
import {ServerInfo, Theme} from "./types";

export const setServerInfo = createAsyncThunk<ServerInfo, void>("view/setServerInfo", async (_payload, {dispatch}) => {
  const serverInfo: ServerInfo = await retryable(API.getServerInfo, dispatch, setServerInfo, "initApplication");
  return serverInfo;
});

export const setLanguage = createAsyncThunk<string, string>("view/setLanguage", async (payload) => {
  await i18n.changeLanguage(payload);
  document.documentElement.lang = payload;
  return payload;
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

export const enableSnowfall = createAsyncThunk<boolean>("view/enableSnowfall", async () => {
  saveToStorage(SNOWFALL_STORAGE_KEY, JSON.stringify(true));
  return true;
});

export const disableSnowfall = createAsyncThunk<boolean>("view/disableSnowfall", async () => {
  saveToStorage(SNOWFALL_STORAGE_KEY, JSON.stringify(false));
  return false;
});

export const setSnowfallNotification = createAsyncThunk<boolean, boolean>("view/setSnowfallNotification", async (payload) => {
  saveToStorage(SNOWFALL_NOTIFICATION_STORAGE_KEY, JSON.stringify(payload));
  return payload;
});
