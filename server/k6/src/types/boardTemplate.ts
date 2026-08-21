import {ColumnTemplate} from "./columnTemplate.ts"

export interface BoardTemplate {
  id: string;
  name: string;
  description?: string;
  favourite: boolean;
  creator: string;
}

export interface BoardTemplateFull {
  template: BoardTemplate;
  columns: ColumnTemplate[];
}
