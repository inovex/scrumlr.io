import {AvataaarProps} from "components/Avatar";

export type Auth = {
  id: string;
  name: string;
  avatar?: AvataaarProps;
};

export type AuthState = {
  user: Auth | undefined;
  initializationSucceeded: boolean | null;
};
