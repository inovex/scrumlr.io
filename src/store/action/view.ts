export const ViewAction = {
  InitApplication: "scrumlr.io/initApplication" as const,
  SetModerating: "scrumlr.io/setModerating" as const,
  SetLanguage: "scrumlr.io/setLanguage" as const,
  SetServerInfo: "scrumlr.io/setServerInfo" as const,
  SetRoute: "scrumlr.io/setRoute" as const,
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

  setServerInfo: (enabledAuthProvider: string[], serverTime: Date) => ({
    type: ViewAction.SetServerInfo,
    enabledAuthProvider,
    serverTime,
  }),

  setRoute: (route: string) => ({
    type: ViewAction.SetRoute,
    route,
  }),
};

export type ViewReduxAction =
  | ReturnType<typeof ViewActionFactory.initApplication>
  | ReturnType<typeof ViewActionFactory.setModerating>
  | ReturnType<typeof ViewActionFactory.setLanguage>
  | ReturnType<typeof ViewActionFactory.setRoute>
  | ReturnType<typeof ViewActionFactory.setServerInfo>;
