import {Color} from "../../types/colors.ts"

export interface CreateColumnRequest {
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  description?: string;
}

export interface UpdateColumnRequest {
  name?: string;
  color?: Color;
  visible?: boolean;
  index?: number;
  description?: string;
}
