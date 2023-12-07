import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "store/action";
import {SKIN_TONE_STORAGE_KEY} from "constants/storage";
import {saveToStorage} from "utils/storage";

export const passSkinToneMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.SetSkinTone) {
    if (typeof window !== undefined) {
      saveToStorage(SKIN_TONE_STORAGE_KEY, action.skinToneName);
    }
  }
};
