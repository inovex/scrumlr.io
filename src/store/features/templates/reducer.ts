import recommendedTemplatesJson from "constants/recommendedTemplates.json";
import {createReducer, createAction} from "@reduxjs/toolkit";
import {DEFAULT_TEMPLATE} from "constants/templates";
import {ImportReducedTemplateWithColumns, TemplatesState, Template} from "./types";
import {createTemplateWithColumns, deleteTemplate, editTemplate, getTemplates} from "./thunks";

// both this and templateColumns reducer don't have an empty state.
// the reason for this is the fact the template/templateColumn logic for reordering is handled partly by the reducer.
// therefore, they need to be in the state at all times so they can be accessed

const RECOMMENDED_FAVOURITES_KEY = "recommendedTemplateFavourites";

function getRecommendedFavouritesFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECOMMENDED_FAVOURITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function setRecommendedFavouritesToLocalStorage(ids: string[]) {
  localStorage.setItem(RECOMMENDED_FAVOURITES_KEY, JSON.stringify(ids));
}

// Helper to generate recommended templates with ids, type, etc.
const generateRecommendedTemplates = (): Template[] => {
  const favIds = getRecommendedFavouritesFromStorage();
  return (recommendedTemplatesJson as ImportReducedTemplateWithColumns[]).map((tpl, idx): Template => {
    const id = `recommended-${idx}`;
    return {
      id,
      creator: "scrumlr",
      name: tpl.name,
      description: tpl.description,
      favourite: favIds.includes(id),
      type: "RECOMMENDED",
    };
  });
};

const initialState: TemplatesState = [DEFAULT_TEMPLATE.template, ...generateRecommendedTemplates()];

export const toggleRecommendedFavourite = createAction<string>("templates/toggleRecommendedFavourite");

export const templatesReducer = createReducer(initialState, (builder) => {
  builder
    // don't forget to re-add default template even after as it's still needed to create new templates
    .addCase(getTemplates.fulfilled, (_state, action) =>
      // action.payload: TemplateWithColumns[]
      // Only store Template objects in state, set type to CUSTOM
      [DEFAULT_TEMPLATE.template, ...generateRecommendedTemplates(), ...action.payload.map((twc) => ({...twc.template, type: "CUSTOM"}) as Template)]
    )
    .addCase(editTemplate.fulfilled, (state, action) =>
      state.map(
        (t) => (t.id === action.payload.id ? {...action.payload, type: t.type} : t) // preserve type
      )
    )
    .addCase(createTemplateWithColumns.fulfilled, (state, action) => [...state, {...action.payload, type: "CUSTOM"}])
    .addCase(deleteTemplate.fulfilled, (state, action) => state.filter((template) => template.id !== action.payload))
    .addCase(toggleRecommendedFavourite, (state, action) => {
      const newState = state.map((t) => (t.id === action.payload ? {...t, favourite: !t.favourite} : t));
      const favIds = newState.filter((t) => t.type === "RECOMMENDED" && t.favourite).map((t) => t.id);
      setRecommendedFavouritesToLocalStorage(favIds);
      return newState;
    });
});
