export const ViewAction = {
  InitApplication: "scrumlr.io/initApplication" as const,
  SetModerating: "scrumlr.io/setModerating" as const,
  SetLanguage: "scrumlr.io/setLanguage" as const,
  SetServerInfo: "scrumlr.io/setServerInfo" as const,
  SetRoute: "scrumlr.io/setRoute" as const,
  SetHotkeyState: "scrumlr.io/setHotkeyState" as const,
  EnableHotkeyNotifications: "scrumlr.io/enableHotkeyNotifications" as const,
  DisableHotkeyNotifications: "scrumlr.io/disableHotkeyNotifications" as const,
  SetShowBoardReactions: "scrumlr.io/setShowBoardReactions" as const,
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

  setServerInfo: (enabledAuthProvider: string[], serverTime: Date, feedbackEnabled: boolean) => ({
    type: ViewAction.SetServerInfo,
    enabledAuthProvider,
    serverTime,
    feedbackEnabled,
  }),

  setRoute: (route: string) => ({
    type: ViewAction.SetRoute,
    route,
  }),

  setHotkeyState: (active: boolean) => ({
    type: ViewAction.SetHotkeyState,
    active,
  }),

  enableHotkeyNotifications: () => ({
    type: ViewAction.EnableHotkeyNotifications,
  }),

  disableHotkeyNotifications: () => ({
    type: ViewAction.DisableHotkeyNotifications,
  }),

  setShowBoardReactions: (show: boolean) => ({
    type: ViewAction.SetShowBoardReactions,
    show,
  }),
};

export type ViewReduxAction =
  | ReturnType<typeof ViewActionFactory.initApplication>
  | ReturnType<typeof ViewActionFactory.setModerating>
  | ReturnType<typeof ViewActionFactory.setLanguage>
  | ReturnType<typeof ViewActionFactory.setRoute>
  | ReturnType<typeof ViewActionFactory.setServerInfo>
  | ReturnType<typeof ViewActionFactory.setHotkeyState>
  | ReturnType<typeof ViewActionFactory.enableHotkeyNotifications>
  | ReturnType<typeof ViewActionFactory.disableHotkeyNotifications>
  | ReturnType<typeof ViewActionFactory.setShowBoardReactions>;
