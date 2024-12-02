import {Color} from "constants/colors";

export type TemplateColumn = {
  id: string; // UUID
  template: string; // UUID
  name: string;
  description: string;
  color: Color;
  visible: boolean;
  index: number;
};

type ExistenceStatus = {
  persisted: boolean;
  mode?: "create" | "edit" | "delete";
};

export type EditableTemplateColumn = TemplateColumn & ExistenceStatus;

export type TemplateColumnsState = TemplateColumn[];
