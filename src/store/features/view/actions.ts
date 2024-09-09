import {createAction} from "@reduxjs/toolkit";

export const setModerating = createAction<boolean>("view/setModerating");
export const setLanguage = createAction<string>("view/setLanguage");
export const setHotkeyState = createAction<boolean>("view/setHotkeyState");
