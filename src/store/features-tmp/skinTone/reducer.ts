import {SKIN_TONE_STORAGE_KEY} from "constants/storage";
import {getFromStorage} from "utils/storage";
import {createReducer} from "@reduxjs/toolkit";
import {SkinToneName, skinTones, SkinToneState} from "./types";
import {setSkinTone} from "./actions";

// TODO maybe persist this in the backend in the future
const skinToneName: SkinToneName = (getFromStorage(SKIN_TONE_STORAGE_KEY) as SkinToneName) ?? "default";
const initialState: SkinToneState = {
  name: skinToneName,
  component: skinTones[skinToneName],
};

export const skinToneReducer = createReducer(initialState, (builder) =>
  builder.addCase(setSkinTone, (state, action) => {
    state.name = action.payload;
    state.component = skinTones[action.payload];
  })
);
