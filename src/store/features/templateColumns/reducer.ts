import {createReducer} from "@reduxjs/toolkit";
import {arrayMove} from "@dnd-kit/sortable";
import {DEFAULT_TEMPLATE} from "constants/templates";
import {TemplateColumnsState} from "./types";
import {getTemplates} from "../templates";
import {addTemplateOptimistically} from "../templates/actions";
import {addTemplateColumnOptimistically, deleteTemplateColumnOptimistically, editTemplateColumnOptimistically, moveTemplateColumnOptimistically} from "./actions";
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
    .addCase(addTemplateOptimistically, (state, action) => [...state, ...action.payload.columns])
    .addCase(addTemplateColumnOptimistically, (state, action) => {
      action.payload.templateColumn.temporaryFlag = true; // tag as temporary, so it can be properly persisted later
      // since we potentially have template columns by many different templates here, we need to differentiate them.
      // after adding/moving, it is asserted that the indices are correct afterward.
      const relatedColumns = state.filter((column) => column.template === action.payload.templateColumn.template);
      const unrelatedColumns = state.filter((column) => column.template !== action.payload.templateColumn.template);

      // insert the new column at the specified index in the related columns
      const updatedRelatedColumns = relatedColumns.toSpliced(action.payload.index, 0, action.payload.templateColumn);

      // update the index for each column in the related group
      const updatedColumnsWithIndices = updatedRelatedColumns.map((column, i) => ({
        ...column,
        index: i,
      }));

      // combine unrelated columns with updated related columns
      return [...unrelatedColumns, ...updatedColumnsWithIndices];
    })
    .addCase(moveTemplateColumnOptimistically, (state, action) => {
      const relatedColumns = state.filter((column) => column.template === action.payload.templateId);
      const unrelatedColumns = state.filter((column) => column.template !== action.payload.templateId);

      const updatedRelatedColumns = arrayMove(relatedColumns, action.payload.fromIndex, action.payload.toIndex);

      const updatedColumnsWithIndices = updatedRelatedColumns.map((column, index) => ({
        ...column,
        index,
      }));
      return [...unrelatedColumns, ...updatedColumnsWithIndices];
    })
    .addCase(editTemplateColumnOptimistically, (state, action) => state.map((t) => (t.id === action.payload.columnId ? {...t, ...action.payload.overwrite} : t)))
    // deleting: if column is local, actually delete, otherwise just flag it as to be deleted
    .addCase(
      deleteTemplateColumnOptimistically,
      (state, action) =>
        state
          .map((t) => {
            if (t.id === action.payload.columnId) {
              return t.temporaryFlag ? null : {...t, toBeDeletedFlag: true}; // mark for removal or update with flag
            }
            return t;
          })
          .filter((t) => t !== null) // remove items marked as such
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
