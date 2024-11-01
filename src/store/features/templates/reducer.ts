import {createReducer} from "@reduxjs/toolkit";
import {TemplatesState} from "./types";
import {editTemplate, getTemplates} from "./thunks";

const initialState: TemplatesState = [];

export const templatesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getTemplates.fulfilled, (_state, action) => action.payload)
    .addCase(editTemplate.fulfilled, (state, action) =>
      state.map(
        (t) => (t.id === action.payload.id ? {...action.payload} : t) // only change edited templates, other stay the same
      )
    );
});
