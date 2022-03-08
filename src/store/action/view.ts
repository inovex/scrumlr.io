export const ViewAction = {
  InitApplication: "scrumlr.io/initApplication" as const,
  SetModerating: "scrumlr.io/setModerating" as const,
  SetLanguage: "scrumlr.io/setLanguage" as const,
  SetEnabledAuthProvider: "scrumlr.io/setEnabledAuthProvider" as const,
};

export const ViewActionFactory = {
  initApplication: () => ({
    type: ViewAction.InitApplication,
  }),

  setModerating: (moderating: boolean) => ({
    type: ViewAction.SetModerating,
    moderating,
  }),

  setLanguage: (language: string) => ({
    type: ViewAction.SetLanguage,
    language,
  }),

  setEnabledAuthProvider: (provider: string[]) => ({
    type: ViewAction.SetEnabledAuthProvider,
    provider,
  }),
};

export type ViewReduxAction =
  | ReturnType<typeof ViewActionFactory.initApplication>
  | ReturnType<typeof ViewActionFactory.setModerating>
  | ReturnType<typeof ViewActionFactory.setLanguage>
  | ReturnType<typeof ViewActionFactory.setEnabledAuthProvider>;
