export const ViewAction = {
  SetModerating: "scrumlr.io/setModerating" as const,
  SignOut: "scrumlr.io/signOut" as const,
  UserCheckCompleted: "scrumlr.io/userCheckCompleted" as const,
};

export const ViewActionFactory = {
  setModerating: (moderating: boolean) => ({
    type: ViewAction.SetModerating,
    moderating,
  }),
};

export type ViewReduxAction = ReturnType<typeof ViewActionFactory.setModerating>;
