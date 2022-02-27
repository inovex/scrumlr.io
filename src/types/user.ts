export interface User {
  id: string;
  name: string;
}

export interface UserState {
  user: User | undefined;
  initialized: boolean;
}
