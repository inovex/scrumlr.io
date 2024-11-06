import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {TemplateColumn} from "./types";

export const getTemplateColumns = createAsyncThunk<TemplateColumn[], string, {state: ApplicationState}>("templateColumns/getColumns", async (payload) => {
  const columns = await API.getTemplateColumns(payload);
  return columns;
});
