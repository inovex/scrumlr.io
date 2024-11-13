import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {TemplateColumn} from "./types";

export const getTemplateColumns = createAsyncThunk<TemplateColumn[], string, {state: ApplicationState}>("templateColumns/getColumns", async (payload) => {
  const columns = await API.getTemplateColumns(payload);
  return columns;
});

export const createTemplateColumn = createAsyncThunk<
  {temporaryColumnId: string; column: TemplateColumn},
  {templateId: string; templateColumn: TemplateColumn},
  {state: ApplicationState}
>("templateColumns/createColumn", async (payload) => {
  const column = await API.createTemplateColumn(payload.templateId, payload.templateColumn);
  return {column, temporaryColumnId: payload.templateColumn.id};
});

export const editTemplateColumn = createAsyncThunk<TemplateColumn, {templateId: string; columnId: string; overwrite: Partial<TemplateColumn>}, {state: ApplicationState}>(
  "templateColumns/editColumn",
  async (payload) => {
    const column = await API.editTemplateColumn(payload.templateId, payload.columnId, payload.overwrite);
    return column;
  }
);

export const deleteTemplateColumn = createAsyncThunk<void, {templateId: string; columnId: string}, {state: ApplicationState}>("templateColumns/deleteColumn", async (payload) => {
  await API.deleteTemplateColumn(payload.templateId, payload.columnId);
});
