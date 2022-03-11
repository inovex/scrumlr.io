import {Color} from "constants/colors";

export type EditableColumnAttributes = {
  name: string;
  color: Color;
  visible: boolean;
  index: number;
};

export type EditColumnRequest = EditableColumnAttributes;
export type AddColumnRequest = EditableColumnAttributes;

export interface Column {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
}

export type ColumnsState = Column[];
