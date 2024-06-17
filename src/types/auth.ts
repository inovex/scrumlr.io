import {AvataaarProps} from "components/Avatar";

// as retrieved from backend
export interface AuthDto {
  id: string;
  name: string;
  accountType: string;
  avatar?: AvataaarProps;
}

// as used in frontend
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
