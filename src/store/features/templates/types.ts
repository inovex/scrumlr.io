import {AccessPolicy} from "../board";
import {TemplateColumn} from "../templateColumns/types";

// getTemplates returns all templates with columns, but is the only endpoint to do so.
// All other template / column endpoints are handled separately, i.e. getting/updating a template
// does not return the associated columns.
// Thus, it's important to be aware of this to avoid inconsistencies in the store.

export type Template = {
  id: string; // UUID
  creator: string; // UUID
  name: string;
  description: string;
  accessPolicy: AccessPolicy;
  favourite: boolean;
};

export type TemplateWithColumns = Template & {columns: TemplateColumn[]};

// used in store
export type TemplatesState = Template[];

// used for importing, where information like ids will be set dynamically
export type ReducedTemplateWithColumns = Omit<TemplateWithColumns, "id" | "creator" | "favourite"> & {
  columns: Omit<TemplateColumn, "id" | "template" | "index">[];
};
