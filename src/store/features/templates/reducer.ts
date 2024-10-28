import {createReducer} from "@reduxjs/toolkit";
import {TemplatesState} from "./types";
import {editTemplate, getTemplates} from "./thunks";

const initialState: TemplatesState = [];

export const templatesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getTemplates.fulfilled, (_state, action) => action.payload)
    // template edits do not return the current columns, so they are re-added to avoid losing them
    .addCase(editTemplate.fulfilled, (state, action) =>
      state.map(
        (t) =>
          t.id === action.payload.id
            ? {...action.payload, columns: t.columns} // keep columns, change the rest
            : t // only change edited templates, other stay the same
      )
    );
});
