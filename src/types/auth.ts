import {AvataaarProps} from "components/Avatar";

export interface Auth {
  id: string;
  name: string;
  anonymous: boolean;
  avatar?: AvataaarProps;
}

export interface AuthState {
  user: Auth | undefined;
  initializationSucceeded: boolean | null;
}
