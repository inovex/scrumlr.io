import {createAction} from "@reduxjs/toolkit";
import {Column, ColumnWithoutId} from "./types";

// actions with 'optimistically' suffix only edit locally and do not persist in the backend

// export const createColumn = createAction<ColumnWithoutId>("scrumlr.io/createColumn");
export const createColumnOptimistically = createAction<Column>("scrumlr.io/createColumnOptimistically");

// export const editColumn = createAction<{id: string; column: ColumnWithoutId}>("scrumlr.io/editColumn");
export const editColumnOptimistically = createAction<{id: string; column: ColumnWithoutId}>("scrumlr.io/editColumnOptimistically");

export const updateColumns = createAction<Column[]>("scrumlr.io/updateColumns");
export const updatedColumns = createAction<Column[]>("scrumlr.io/updatedColumns");

// export const deleteColumn = createAction<string>("scrumlr.io/deleteColumn");
export const deletedColumn = createAction<string>("scrumlr.io/deletedColumn");
export const deleteColumnOptimistically = createAction<string>("scrumlr.io/deleteColumnOptimistically");
