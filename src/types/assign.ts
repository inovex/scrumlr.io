import {AvataaarProps} from "components/Avatar";

export interface Assign {
  name: string;
  id?: string;
  avatar?: AvataaarProps;
}

export type AssignState = Assign[];
