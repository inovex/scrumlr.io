import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Template, TemplateDto} from "./types";
import {AccessPolicy} from "../board";

// transforms data object as sent from backend to usable Template object
const transformTemplate = (templateDto: TemplateDto): Template => {
  const {accessPolicy, ColumnTemplates, ...rest} = templateDto;

  return {
    ...rest,
    accessPolicy: AccessPolicy[accessPolicy as keyof typeof AccessPolicy], // convert to enum
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
