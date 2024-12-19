import {createAsyncThunk, unwrapResult} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Template, TemplateWithColumns} from "./types";
import {getTemplateColumns} from "../templateColumns/thunks";

export const getTemplates = createAsyncThunk<TemplateWithColumns[], void, {state: ApplicationState}>("templates/getTemplates", async () => {
  const templates = await API.getTemplates();
  return templates;
});

export const getTemplate = createAsyncThunk<Template, string, {state: ApplicationState}>("templates/getTemplate", async (payload, {dispatch}) => {
  const template = await API.getTemplate(payload);
  // dispatch(getTemplateColumns(payload)) // TODO dispatch automatically or manually?
  return template;
});

export const createTemplateWithColumns = createAsyncThunk<Template, TemplateWithColumns, {state: ApplicationState}>(
  "templates/createTemplateWithColumns",
  async (payload, {dispatch}) => {
    const template = await API.createTemplate(payload);
    // after creating, we need to retrieve the columns from backend and add them to the state,
    // since the columns aren't returned by the createTemplate request.
    dispatch(getTemplateColumns(template.id));
    return template;
  }
);

export const editTemplate = createAsyncThunk<Template, {id: string; overwrite: Partial<Template>}, {state: ApplicationState}>("templates/editTemplate", async (payload) => {
  const template = await API.editTemplate(payload.id, payload.overwrite);
  return template;
});

// await can be removed if `result.unwrap()` is returned instead
export const setTemplateFavourite = createAsyncThunk<Template, {id: string; favourite: boolean}, {state: ApplicationState}>(
  "templates/setTemplateFavourite",
  async (payload, {dispatch}) => {
    const result = await dispatch(
      editTemplate({
        id: payload.id,
        overwrite: {
          favourite: payload.favourite,
        },
      })
    );
    return unwrapResult(result);
  }
);
