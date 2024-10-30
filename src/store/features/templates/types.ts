import {Color} from "constants/colors";
import {AccessPolicy} from "../board";

// getTemplates returns all templates with columns, but is the only endpoint to do so.
// All other template / column endpoints are handled separately, i.e. getting/updating a template
// does not return the associated columns.
// Thus, it's important to be aware of this to avoid inconsistencies in the store.

export type TemplateColumn = {
  id: string; // UUID
  template: string; // UUID
  name: string;
  description: string;
  color: Color;
  visible: boolean;
  index: number;
};

export type Template = {
  id: string; // UUID
  creator: string; // UUID
  name: string;
  description: string;
  accessPolicy: keyof typeof AccessPolicy;
  favourite: boolean;
};

export type TemplateWithColumns = Template & {columns: TemplateColumn[]};

// used in store
export type TemplatesState = Template[];
