import {createReducer} from "@reduxjs/toolkit";
import {TemplatesState} from "./types";
import {getTemplates} from "./thunks";

const initialState: TemplatesState = [];

export const templatesReducer = createReducer(initialState, (builder) => {
  builder.addCase(getTemplates.fulfilled, (_state, action) => action.payload);
});
