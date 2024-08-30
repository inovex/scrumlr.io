import {createAction} from "@reduxjs/toolkit";
import {SkinToneName} from "./types";

export const setSkinTone = createAction<SkinToneName>("scrumlr.io/setSkinTone");
