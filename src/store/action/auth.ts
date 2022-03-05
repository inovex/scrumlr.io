export const AuthActionType = {
  SignIn: "@@SCRUMLR/signIn" as const,
  SignOut: "@@SCRUMLR/signOut" as const,
  UserCheckCompleted: "@@SCRUMLR/userCheckCompleted" as const,
};

export const AuthActionFactory = {
  signIn: (id: string, name: string) => ({
    type: AuthActionType.SignIn,
    id,
    name,
  }),

  signOut: () => ({
    type: AuthActionType.SignOut,
  }),

  userCheckCompleted: () => ({
    type: AuthActionType.UserCheckCompleted,
  }),
};

export type UserReduxAction = ReturnType<typeof AuthActionFactory.signIn> | ReturnType<typeof AuthActionFactory.signOut> | ReturnType<typeof AuthActionFactory.userCheckCompleted>;
