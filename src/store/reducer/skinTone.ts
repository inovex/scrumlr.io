import {SKIN_TONE_STORAGE_KEY} from "constants/storage";
import {Action, ReduxAction} from "store/action";
import {SkinToneName, SkinToneState, skinTones} from "types/skinTone";
import {getFromStorage} from "utils/storage";

let skinToneName = typeof window !== "undefined" ? getFromStorage(SKIN_TONE_STORAGE_KEY) : "default";
if (!skinToneName || skinTones[skinToneName] === undefined) skinToneName = "default";

const INITIAL_SKIN_TONE_STATE: SkinToneState = {
  name: skinToneName as SkinToneName,
  component: skinTones[skinToneName],
};

// eslint-disable-next-line @typescript-eslint/default-param-last
export const skinToneReducer = (state: SkinToneState = INITIAL_SKIN_TONE_STATE, action: ReduxAction): SkinToneState => {
  switch (action.type) {
    case Action.SetSkinTone: {
      return {
        ...state,
        name: action.skinToneName,
        component: skinTones[action.skinToneName],
      };
    }

    default:
      return state;
  }
};
