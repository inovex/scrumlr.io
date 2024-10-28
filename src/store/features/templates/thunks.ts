import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Template, TemplateDto} from "./types";

// transforms data object as sent from backend to usable Template object
const transformTemplate = (templateDto: TemplateDto) =>
  ({
    ...templateDto,
    createdAt: templateDto.created_at,
    accessPolicy: templateDto.access_policy,
    columns: templateDto.ColumnTemplates.map((ctdto) => ({
      ...ctdto,
      template: ctdto.board_template,
    })),
  }) as Template;

export const getTemplates = createAsyncThunk<Template[], void, {state: ApplicationState}>("templates/getTemplates", async () => {
  const templates = await API.getTemplates();
  return templates.map(transformTemplate);
});
