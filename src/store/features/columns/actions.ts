import {createAction} from "@reduxjs/toolkit";
import {Column, ColumnWithoutId} from "./types";

// actions with 'optimistically' suffix only edit locally and do not persist in the backend

export const createColumnOptimistically = createAction<Column>("columns/createColumnOptimistically");

export const editColumnOptimistically = createAction<{id: string; column: ColumnWithoutId}>("columns/editColumnOptimistically");

export const updatedColumns = createAction<Column[]>("columns/updatedColumns");

export const deletedColumn = createAction<string>("columns/deletedColumn");
export const deleteColumnOptimistically = createAction<string>("columns/deleteColumnOptimistically");
