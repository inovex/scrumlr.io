import {AvataaarProps} from "components/Avatar";

export interface Auth {
  id: string;
  name: string;
  avatar?: AvataaarProps;
}

export interface AuthState {
  user: Auth | undefined;
  initializationSucceeded: boolean | null;
}
