import {AvataaarProps} from "types/avatar";

export interface Auth {
  id: string;
  name: string;
  avatar?: AvataaarProps;
}

export interface AuthState {
  user: Auth | undefined;
  initializationSucceeded: boolean | null;
}
