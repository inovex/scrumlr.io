import {createAction} from "@reduxjs/toolkit";

export const setModerating = createAction<boolean>("scrumlr.io/setModerating");
export const setLanguage = createAction<string>("scrumlr.io/setLanguage");
export const setHotkeyState = createAction<boolean>("scrumlr.io/setHotkeyState");
