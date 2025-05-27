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

export type TemplateColumnsState = TemplateColumn[];
