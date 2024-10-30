import {createAsyncThunk, unwrapResult} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Template, TemplateWithColumns} from "./types";

export const getTemplates = createAsyncThunk<TemplateWithColumns[], void, {state: ApplicationState}>("templates/getTemplates", async () => {
  const templates = await API.getTemplates();
  return templates;
});

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
