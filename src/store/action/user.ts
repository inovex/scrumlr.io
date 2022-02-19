export const UserActionType = {
  SignIn: "@@SCRUMLR/signIn" as const,
  SignOut: "@@SCRUMLR/signOut" as const,
};

export const UserActionFactory = {
  signIn: (id: string, name: string) => ({
    type: UserActionType.SignIn,
    id,
    name,
  }),

  signOut: () => ({
    type: UserActionType.SignOut,
  }),
};

export type UserReduxAction = ReturnType<typeof UserActionFactory.signIn> | ReturnType<typeof UserActionFactory.signOut>;
