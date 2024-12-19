import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Session} from "./types";
// import {getTemplateColumns} from "../templateColumns/thunks";

export const getSessions = createAsyncThunk<Session[], void, {state: ApplicationState}>("sessions/getSessions", async () => {
  const templates = await API.getSessions();
  return templates;
});

// export const getTemplate = createAsyncThunk<Template, string, {state: ApplicationState}>("templates/getTemplate", async (payload, {dispatch}) => {
//   const template = await API.getTemplate(payload);
//   // dispatch(getTemplateColumns(payload)) // TODO dispatch automatically or manually?
//   return template;
// });
