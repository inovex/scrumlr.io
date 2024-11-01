import {createReducer} from "@reduxjs/toolkit";
import {TemplatesState} from "./types";
import {editTemplate, getTemplates} from "./thunks";
import {addTemplateOptimistically} from "./actions";

const initialState: TemplatesState = [];

export const templatesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getTemplates.fulfilled, (_state, action) => action.payload)
    .addCase(editTemplate.fulfilled, (state, action) =>
      state.map(
        (t) => (t.id === action.payload.id ? {...action.payload} : t) // only change edited templates, other stay the same
      )
    )
    .addCase(addTemplateOptimistically, (state, action) => [...state, action.payload]);
});
