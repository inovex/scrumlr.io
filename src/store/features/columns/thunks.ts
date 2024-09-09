import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";
import {ColumnWithoutId} from "./types";

export const editColumn = createAsyncThunk<void, {id: string; column: ColumnWithoutId}, {state: ApplicationState}>("columns/editColumn", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.editColumn(boardId, payload.id, payload.column);
});

export const createColumn = createAsyncThunk<void, ColumnWithoutId, {state: ApplicationState}>("columns/createColumn", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.createColumn(boardId, payload);
});

export const deleteColumn = createAsyncThunk<void, string, {state: ApplicationState}>("columns/deleteColumn", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.deleteColumn(boardId, payload);
});
