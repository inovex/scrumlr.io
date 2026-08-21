import {ColumnTemplateRequest} from "../columnTemplate/requests.ts"

export interface CreateBoardTemplateRequest {
  name: string;
  description?: string;
  favourite?: boolean;
  creator?: string;
  columnTemplates: ColumnTemplateRequest[];
}

export interface UpdateBoardTemplateRequest {
  id?: string;
  name?: string;
  description?: string;
  favourite?: boolean;
}
