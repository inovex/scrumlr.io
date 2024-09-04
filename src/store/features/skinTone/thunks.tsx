import {createAsyncThunk} from "@reduxjs/toolkit";
import {SKIN_TONE_STORAGE_KEY} from "constants/storage";
import {saveToStorage} from "utils/storage";
import {SkinToneName} from "./types";

export const setSkinTone = createAsyncThunk<SkinToneName, SkinToneName>("scrumlr.io/setSkinTone", async (payload) => {
  saveToStorage(SKIN_TONE_STORAGE_KEY, payload);
  return payload;
});
