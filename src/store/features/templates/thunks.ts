import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Template, TemplateDto} from "./types";

// transforms data object as sent from backend to usable Template object
const transformTemplate = (templateDto: TemplateDto): Template => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {created_at, access_policy, ColumnTemplates, ...rest} = templateDto;

  return {
    ...rest,
    createdAt: created_at,
    accessPolicy: access_policy,
    columns: ColumnTemplates.map(({board_template, ...columnRest}) => ({
      ...columnRest,
      template: board_template,
    })),
  };
};

export const getTemplates = createAsyncThunk<Template[], void, {state: ApplicationState}>("templates/getTemplates", async () => {
  const templates = await API.getTemplates();
  return templates.map(transformTemplate);
});
