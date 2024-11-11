import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {TemplateColumn} from "./types";

export const getTemplateColumns = createAsyncThunk<TemplateColumn[], string, {state: ApplicationState}>("templateColumns/getColumns", async (payload) => {
  const columns = await API.getTemplateColumns(payload);
  return columns;
});

export const createTemplateColumn = createAsyncThunk<TemplateColumn, {templateId: string; templateColumn: TemplateColumn}, {state: ApplicationState}>(
  "templateColumns/createColumn",
  async (payload) => {
    const column = await API.createTemplateColumn(payload.templateId, payload.templateColumn);
    return column;
  }
);

export const editTemplateColumn = createAsyncThunk<TemplateColumn, {templateId: string; columnId: string; overwrite: Partial<TemplateColumn>}, {state: ApplicationState}>(
  "templateColumns/editColumn",
  async (payload) => {
    const column = await API.editTemplateColumn(payload.templateId, payload.columnId, payload.overwrite);
    return column;
  }
);
