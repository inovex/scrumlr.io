import {getFromStorage} from "utils/storage";
import {BOARD_REACTIONS_ENABLE_STORAGE_KEY, HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY, THEME_STORAGE_KEY} from "constants/storage";
import {createReducer} from "@reduxjs/toolkit";
import {Theme, ViewState} from "./types";
import {leaveBoard} from "../board";
import {setHotkeyState, setLanguage, setModerating, setRoute} from "./actions";
import {updatedParticipant} from "../participants";
import {onNoteBlur, onNoteFocus} from "../notes";
import {
  disableHotkeyNotifications,
  disableSnowfall,
  enableHotkeyNotifications,
  enableSnowfall,
  setServerInfo,
  setShowBoardReactions,
  setSnowfallNotification,
  setTheme,
} from "./thunks";

const initialState: ViewState = {
  moderating: false,
  serverTimeOffset: 0,
  anonymousLoginDisabled: false,
  enabledAuthProvider: [],
  feedbackEnabled: false,
  hotkeysAreActive: true,
  noteFocused: false,
  hotkeyNotificationsEnabled: getFromStorage(HOTKEY_NOTIFICATIONS_ENABLE_STORAGE_KEY) !== "false",
  showBoardReactions: getFromStorage(BOARD_REACTIONS_ENABLE_STORAGE_KEY) !== "false",
  theme: (getFromStorage(THEME_STORAGE_KEY) as Theme) ?? "auto",
  snowfallEnabled: getFromStorage("snowfall") !== "false",
  snowfallNotificationEnabled: getFromStorage("snowfall_notification") !== "false",
};

export const viewReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(leaveBoard.fulfilled, (state) => {
      state.moderating = false;
    })
    .addCase(setModerating, (state, action) => {
      state.moderating = action.payload;
    })
    .addCase(setLanguage, (state, action) => {
      state.language = action.payload;
    })
    .addCase(setTheme.fulfilled, (state, action) => {
      state.theme = action.payload;
    })
    .addCase(setServerInfo.fulfilled, (state, action) => {
      state.anonymousLoginDisabled = action.payload.anonymousLoginDisabled;
      state.enabledAuthProvider = action.payload.enabledAuthProvider;
      state.serverTimeOffset = new Date().getTime() - action.payload.serverTime;
      state.feedbackEnabled = action.payload.feedbackEnabled;
    })
    .addCase(setRoute, (state, action) => {
      state.route = action.payload;
    })
    .addCase(updatedParticipant, (state, action) => {
      if (action.payload.participant.user.id === action.payload.self.id && action.payload.participant.role === "PARTICIPANT" && state.moderating) {
        state.moderating = false;
      }
    })
    .addCase(setHotkeyState, (state, action) => {
      state.hotkeysAreActive = action.payload;
    })
    .addCase(onNoteFocus, (state) => {
      state.noteFocused = true;
    })
    .addCase(onNoteBlur, (state) => {
      state.noteFocused = false;
    })
    .addCase(enableHotkeyNotifications.fulfilled, (state) => {
      state.hotkeyNotificationsEnabled = true;
    })
    .addCase(disableHotkeyNotifications.fulfilled, (state) => {
      state.hotkeyNotificationsEnabled = false;
    })
    .addCase(setShowBoardReactions.fulfilled, (state, action) => {
      state.showBoardReactions = action.payload;
    })
    .addCase(enableSnowfall.fulfilled, (state) => {
      state.snowfallEnabled = true;
    })
    .addCase(disableSnowfall.fulfilled, (state) => {
      state.snowfallEnabled = false;
    })
    .addCase(setSnowfallNotification.fulfilled, (state, action) => {
      state.snowfallNotificationEnabled = action.payload;
    })
);
