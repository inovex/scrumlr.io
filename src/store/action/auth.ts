import {AvataaarProps} from "components/Avatar";

export const AuthAction = {
  SignIn: "scrumlr.io/signIn" as const,
  SignOut: "scrumlr.io/signOut" as const,
  UserCheckCompleted: "scrumlr.io/userCheckCompleted" as const,
};

export const AuthActionFactory = {
  signIn: (id: string, name: string, avatar?: AvataaarProps) => ({
    type: AuthAction.SignIn,
    id,
    name,
    avatar,
  }),

  signOut: () => ({
    type: AuthAction.SignOut,
  }),

  userCheckCompleted: (success: boolean) => ({
    type: AuthAction.UserCheckCompleted,
    success,
  }),
};

export type AuthReduxAction = ReturnType<typeof AuthActionFactory.signIn> | ReturnType<typeof AuthActionFactory.signOut> | ReturnType<typeof AuthActionFactory.userCheckCompleted>;
