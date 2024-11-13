import {Color} from "constants/colors";

export type TemplateColumn = {
  id: string; // UUID
  template: string; // UUID
  name: string;
  description: string;
  color: Color;
  visible: boolean;
  index: number;
  createFlag?: boolean; // indicates whether this column is persisted yet, or temporary in editor
  deleteFlag?: boolean; // column is to be deleted
};

export type TemplateColumnsState = TemplateColumn[];
