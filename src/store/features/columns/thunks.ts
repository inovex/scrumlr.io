import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";
import {ColumnWithoutId} from "./types";

export const editColumn = createAsyncThunk<void, {id: string; column: ColumnWithoutId}, {state: ApplicationState}>("scrumlr.io/editColumn", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.editColumn(boardId, payload.id, payload.column);
});

export const createColumn = createAsyncThunk<void, ColumnWithoutId, {state: ApplicationState}>("scrumlr.io/createColumn", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.createColumn(boardId, payload);
});

export const deleteColumn = createAsyncThunk<void, string, {state: ApplicationState}>("scrumlr.io/deleteColumn", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.deleteColumn(boardId, payload);
});
