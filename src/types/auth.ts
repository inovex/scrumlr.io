export interface Auth {
  id: string;
  name: string;
}

export interface AuthState {
  user: Auth | undefined;
  initialized: boolean;
}
