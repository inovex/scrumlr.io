import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Template, TemplateDto} from "./types";

const transformTemplate = (templateDtos: TemplateDto[]) =>
  templateDtos.map(
    (dto) =>
      ({
        ...dto,
        createdAt: dto.created_at,
        accessPolicy: dto.access_policy,
        columns: dto.ColumnTemplates.map((ctdto) => ({
          ...ctdto,
          template: ctdto.board_template,
        })),
      }) as Template
  );

export const getTemplates = createAsyncThunk<Template[], void, {state: ApplicationState}>("reactions/addReaction", async () => {
  const templates = await API.getTemplates();
  return transformTemplate(templates);
});
