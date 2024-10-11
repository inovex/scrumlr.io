import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState, retryable} from "store";
import {ColumnWithoutId} from "./types";

export const editColumn = createAsyncThunk<void, {id: string; column: ColumnWithoutId}, {state: ApplicationState}>("columns/editColumn", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  await retryable(
    () => API.editColumn(boardId, payload.id, payload.column),
    dispatch,
    () => editColumn({...payload}),
    "editColumn"
  );
});

export const createColumn = createAsyncThunk<void, ColumnWithoutId, {state: ApplicationState}>("columns/createColumn", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  await retryable(
    () => API.createColumn(boardId, payload),
    dispatch,
    () => createColumn({...payload}),
    "createColumn"
  );
});

export const deleteColumn = createAsyncThunk<void, string, {state: ApplicationState}>("columns/deleteColumn", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  await retryable(
    () => API.deleteColumn(boardId, payload),
    dispatch,
    () => deleteColumn(payload),
    "deleteColumn"
  );
});
