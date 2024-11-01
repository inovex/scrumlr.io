import {createReducer} from "@reduxjs/toolkit";
import {TemplateColumnsState} from "./types";
import {getTemplates} from "../templates";
import {addTemplateOptimistically} from "../templates/actions";

const initialState: TemplateColumnsState = [];

export const templateColumnsReducer = createReducer(initialState, (builder) => {
  builder
    // each full template has a column prop which is an array, so we need to map out the columns prop and also flatten the array
    .addCase(getTemplates.fulfilled, (_state, action) => action.payload.flatMap((c) => c.columns))
    .addCase(addTemplateOptimistically, (state, action) => [...state, ...action.payload.columns]);
});
