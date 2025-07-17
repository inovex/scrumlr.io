import {createReducer, createAction} from "@reduxjs/toolkit";
import {DEFAULT_TEMPLATE} from "constants/templates";
import recommendedTemplatesJson from "constants/recommendedTemplates.json";
import {TemplatesState, Template} from "./types";
import {createTemplateWithColumns, deleteTemplate, editTemplate, getTemplates} from "./thunks";

// both this and templateColumns reducer don't have an empty state.
// the reason for this is the fact the template/templateColumn logic for reordering is handled partly by the reducer.
// therefore, they need to be in the state at all times so they can be accessed

// Helper to generate recommended templates with ids, type, etc.
const generateRecommendedTemplates = (): Template[] => (recommendedTemplatesJson as any[]).map((tpl, idx) => ({
    id: `recommended-${idx}`,
    creator: "scrumlr",
    name: tpl.name,
    description: tpl.description,
    favourite: tpl.favourite ?? false,
    type: "RECOMMENDED",
  })) as Template[];

const initialState: TemplatesState = [{...DEFAULT_TEMPLATE.template, type: "CUSTOM"}, ...generateRecommendedTemplates()];

export const toggleRecommendedFavourite = createAction<string>("templates/toggleRecommendedFavourite");

export const templatesReducer = createReducer(initialState, (builder) => {
  builder
    // don't forget to re-add default template even after as it's still needed to create new templates
    .addCase(getTemplates.fulfilled, (_state, action) => 
      // action.payload: TemplateWithColumns[]
      // Only store Template objects in state, set type to CUSTOM
       [
        {...DEFAULT_TEMPLATE.template, type: "CUSTOM"} as Template,
        ...generateRecommendedTemplates(),
        ...action.payload.map((twc) => ({...twc.template, type: "CUSTOM"}) as Template),
      ]
    )
    .addCase(editTemplate.fulfilled, (state, action) =>
      state.map(
        (t) => (t.id === action.payload.id ? {...action.payload, type: t.type} : t) // preserve type
      )
    )
    .addCase(createTemplateWithColumns.fulfilled, (state, action) => [...state, {...action.payload, type: "CUSTOM"}])
    .addCase(deleteTemplate.fulfilled, (state, action) => state.filter((template) => template.id !== action.payload))
    .addCase(toggleRecommendedFavourite, (state, action) => state.map((t) => (t.id === action.payload ? {...t, favourite: !t.favourite} : t)));
});
