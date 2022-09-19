import {Color} from "constants/colors";

export type Column = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
};

export type EditColumnRequest = Omit<Column, "id">;

export type ColumnsState = Column[];
