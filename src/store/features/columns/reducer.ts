import {TEMPORARY_COLUMN_ID} from "constants/misc";
import {createReducer} from "@reduxjs/toolkit";
import {ColumnsState} from "./types";
import {createColumnOptimistically, deleteColumnOptimistically, deletedColumn, editColumnOptimistically, updatedColumns} from "./actions";
import {initializeBoard} from "../board";

const initialState: ColumnsState = [];

export const columnsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.columns)
    .addCase(updatedColumns, (_state, action) => action.payload)
    // .toSpliced instead .splice because of Immer
    .addCase(createColumnOptimistically, (state, action) => state.toSpliced(action.payload.index, 0, action.payload))
    .addCase(deleteColumnOptimistically, (state) => state.filter((c) => c.id !== TEMPORARY_COLUMN_ID))
    .addCase(editColumnOptimistically, (state, action) => {
      const col = state.find((c) => c.id === TEMPORARY_COLUMN_ID);
      if (col) col.name = action.payload.column.name;
    })
    .addCase(deletedColumn, (state, action) => state.filter((c) => c.id !== action.payload))
);
