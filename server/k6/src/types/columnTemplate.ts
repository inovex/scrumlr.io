import {Color} from "./colors.ts"

export interface ColumnTemplate {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  description?: string;
  template: string;
}
