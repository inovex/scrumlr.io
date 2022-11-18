import {Auth} from "./auth";

export interface Assignee {
  name: string;
  note?: string;
  user?: Auth;
}

export type AssigneeState = Assignee | undefined;
