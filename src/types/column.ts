import {Color} from "constants/colors";

export interface Column {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
}

export interface EditColumnRequest extends Omit<Column, "id"> {
  index: number;
}

export type ColumnsState = Column[];
