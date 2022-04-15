import {Color} from "constants/colors";

export interface Column {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
}

export type EditColumnRequest = Omit<Column, "id">;

export type ColumnsState = Column[];
