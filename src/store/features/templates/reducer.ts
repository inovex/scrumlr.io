import {createReducer} from "@reduxjs/toolkit";
import {DEFAULT_TEMPLATE} from "constants/templates";
import {TemplatesState} from "./types";
import {editTemplate, getTemplates} from "./thunks";
import {addTemplateOptimistically} from "./actions";

// both this and templateColumns reducer don't have an empty state.
// the reason for this is the fact the template/templateColumn logic for reordering is handled partly by the reducer.
// therefore, they need to be in the state at all times so they can be accessed
const initialState: TemplatesState = [DEFAULT_TEMPLATE.template];

export const templatesReducer = createReducer(initialState, (builder) => {
  builder
    // don't forget to re-add default template even after as it's still needed to create new templates
    .addCase(getTemplates.fulfilled, (_state, action) => [DEFAULT_TEMPLATE.template, ...action.payload.map((twc) => twc.template)])
    .addCase(editTemplate.fulfilled, (state, action) =>
      state.map(
        (t) => (t.id === action.payload.id ? {...action.payload} : t) // only change edited templates, other stay the same
      )
    )
    .addCase(addTemplateOptimistically, (state, action) => [...state, action.payload.template]);
});
