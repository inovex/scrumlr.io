import {createReducer} from "@reduxjs/toolkit";
import {DEFAULT_TEMPLATE} from "constants/templates";
import {TemplateColumnsState} from "./types";
import {deleteTemplate, getTemplates} from "../templates";
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
    .addCase(createTemplateColumn.fulfilled, (state, action) => [...state, action.payload.column])
    .addCase(editTemplateColumn.fulfilled, (state, action) => state.map((t) => (t.id === action.payload.id ? {...action.payload} : t)))
    .addCase(deleteTemplateColumn.fulfilled, (state, action) => state.filter((c) => c.id !== action.payload))
    .addCase(deleteTemplate.fulfilled, (state, action) => state.filter((column) => column.template !== action.payload));
});
