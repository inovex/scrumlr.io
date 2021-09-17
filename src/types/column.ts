import {Color} from "../constants/colors";

export type EditableColumnAttributes = {
  name: string;
  color: Color;
  hidden: boolean;
};

export type EditColumnRequest = {id: string} & Partial<EditableColumnAttributes>;
export type AddColumnRequest = EditableColumnAttributes;

export interface ColumnServerModel {
  [columnId: string]: {
    name: string;
    color: string;
    hidden: boolean;
  };
}

export interface ColumnClientModel {
  id?: string;
  name: string;
  color: Color;
  hidden: boolean;
}
