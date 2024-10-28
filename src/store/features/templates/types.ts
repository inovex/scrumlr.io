import {Color} from "constants/colors";
import {AccessPolicy} from "../board";

/* unlike normal boards/columns, templates and their columns are combined into one feature */

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
  accessPolicy: AccessPolicy;
  favourite: boolean;
  columns: TemplateColumn[];
};

// used for data transformation from backend
export type TemplateDto = {
  id: string; // UUID
  creator: string; // UUID
  name: string;
  description: string;
  access_policy: AccessPolicy;
  favourite: boolean;
  ColumnTemplates: {
    // TODO change prop name also in backend
    id: string;
    board_template: string;
    name: string;
    description: string;
    color: Color;
    visible: boolean;
    index: number;
  }[];
};

// used in store
export type TemplatesState = Template[];
