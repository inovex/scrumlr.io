import {Color} from "../../types/colors.ts"

export interface ColumnTemplateRequest {
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  description?: string;
}
