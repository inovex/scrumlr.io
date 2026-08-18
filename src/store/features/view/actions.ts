import {createAction} from "@reduxjs/toolkit";

export const setRoute = createAction<string>("view/setRoute");
export const setModerating = createAction<boolean>("view/setModerating");
export const setHotkeyState = createAction<boolean>("view/setHotkeyState");
