import {createAction} from "@reduxjs/toolkit";
import {ServerInfo, Theme} from "./types";

export const initApplication = createAction("scrumlr.io/initApplication");
export const setModerating = createAction<boolean>("scrumlr.io/setModerating");
export const setLanguage = createAction<string>("scrumlr.io/setLanguage");
export const setTheme = createAction<Theme>("scrumlr.io/setTheme");
export const setServerInfo = createAction<ServerInfo>("scrumlr.io/setServerInfo");
export const setRoute = createAction<string>("scrumlr.io/setRoute");
export const setHotkeyState = createAction<boolean>("scrumlr.io/setHotkeyState");
export const enableHotkeyNotifications = createAction("scrumlr.io/enableHotkeyNotifications");
export const disableHotkeyNotifications = createAction("scrumlr.io/disableHotkeyNotifications");
export const setShowBoardReactions = createAction<boolean>("scrumlr.io/setShowBoardReactions");
