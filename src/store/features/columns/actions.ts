import {createAction} from "@reduxjs/toolkit";
import {Column, ColumnWithoutId} from "./types";

// actions with 'optimistically' suffix only edit locally and do not persist in the backend

export const createColumnOptimistically = createAction<Column>("scrumlr.io/createColumnOptimistically");

export const editColumnOptimistically = createAction<{id: string; column: ColumnWithoutId}>("scrumlr.io/editColumnOptimistically");

export const updatedColumns = createAction<Column[]>("scrumlr.io/updatedColumns");

export const deletedColumn = createAction<string>("scrumlr.io/deletedColumn");
export const deleteColumnOptimistically = createAction<string>("scrumlr.io/deleteColumnOptimistically");
