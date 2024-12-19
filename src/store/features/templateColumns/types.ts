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

export type TemplateColumnAction = "create" | "edit" | "delete";

type ExistenceStatus = {
  persisted: boolean;
  mode?: TemplateColumnAction;
};

export type EditableTemplateColumn = TemplateColumn & ExistenceStatus;

export type TemplateColumnsState = TemplateColumn[];
