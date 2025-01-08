import {createReducer} from "@reduxjs/toolkit";
import {DEFAULT_TEMPLATE} from "constants/templates";
import {TemplateColumnsState} from "./types";
import {getTemplates} from "../templates";
// import {addTemplateColumnOptimistically, deleteTemplateColumnOptimistically, editTemplateColumnOptimistically, moveTemplateColumnOptimistically} from "./actions";
import {createTemplateColumn, deleteTemplateColumn, editTemplateColumn, getTemplateColumns} from "./thunks";

const initialState: TemplateColumnsState = [...DEFAULT_TEMPLATE.columns];

export const templateColumnsReducer = createReducer(initialState, (builder) => {
  builder
    // each full template has a column prop which is an array, so we need to map out the columns prop and also flatten the array
    .addCase(getTemplates.fulfilled, (_state, action) => [...DEFAULT_TEMPLATE.columns, ...action.payload.flatMap((c) => c.columns)])
    // when retrieving template columns, update those which already exist and add the ones which don't
    // and return a new state in redux fashion
    .addCase(
      getTemplateColumns.fulfilled,
      (state, action) =>
        action.payload.reduce(
          (acc, tmplCol) => {
            const existingColumnIndex = acc.findIndex((a) => a.id === tmplCol.id);
            if (existingColumnIndex !== -1) {
              // exists, so overwrite the existing column
              acc[existingColumnIndex] = {...acc[existingColumnIndex], ...tmplCol};
            } else {
              // doesn't exist, so add the new column
              acc.push(tmplCol);
            }
            return acc;
          },
          [...state]
        ) // start with a copy of the existing state
    )
    .addCase(createTemplateColumn.fulfilled, (state, action) =>
      state.map(
        // reset temporary (flag and id), as this is now officially from the backend
        (t) => (t.id === action.payload.temporaryColumnId ? {...action.payload.column, temporary: false} : t)
      )
    )
    // in theory, this should actually change nothing as all changes have been made optimistically, but for the sake of completeness we'll do it anyway
    .addCase(editTemplateColumn.fulfilled, (state, action) => state.map((t) => (t.id === action.payload.id ? {...action.payload} : t)))
    .addCase(deleteTemplateColumn.fulfilled, (state, action) => state.filter((c) => c.id !== action.payload));
});
