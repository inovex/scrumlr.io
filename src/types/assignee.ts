import {AvataaarProps} from "components/Avatar";

export interface Assignee {
  name: string;
  id: string;
  assigned: boolean;
  avatar?: AvataaarProps;
}

export type AssigneeState = Assignee[];
