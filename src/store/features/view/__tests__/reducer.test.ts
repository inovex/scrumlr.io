import {viewReducer} from "../reducer";
import {setServerInfo} from "../thunks";
import {ViewState, ServerInfo} from "../types";

describe("viewReducer", () => {
  const initialState: ViewState = {
    moderating: false,
    serverTimeOffset: 0,
    anonymousLoginDisabled: false,
    allowAnonymousCustomTemplates: false,
    allowAnonymousBoardCreation: false,
    enabledAuthProvider: [],
    feedbackEnabled: false,
    hotkeysAreActive: true,
    noteFocused: false,
    hotkeyNotificationsEnabled: true,
    showBoardReactions: true,
    theme: "auto",
    legacyCreateBoard: false,
    snowfallEnabled: true,
    snowfallNotificationEnabled: true,
  };

  describe("setServerInfo", () => {
    it("should update state with server info including allowAnonymousBoardCreation", () => {
      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: true,
        enabledAuthProvider: ["google", "github"],
        allowAnonymousCustomTemplates: true,
        allowAnonymousBoardCreation: true,
        serverTime: new Date("2023-01-01T12:00:00Z").getTime(),
        feedbackEnabled: true,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(initialState, action);

      expect(newState.anonymousLoginDisabled).toBe(true);
      expect(newState.enabledAuthProvider).toEqual(["google", "github"]);
      expect(newState.allowAnonymousCustomTemplates).toBe(true);
      expect(newState.allowAnonymousBoardCreation).toBe(true);
      expect(newState.feedbackEnabled).toBe(true);
      expect(newState.serverTimeOffset).toBeCloseTo(new Date().getTime() - serverInfo.serverTime, -2);
    });

    it("should update allowAnonymousBoardCreation to false when server sends false", () => {
      const stateWithBoardCreationEnabled = {
        ...initialState,
        allowAnonymousBoardCreation: true,
      };

      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: false,
        enabledAuthProvider: [],
        allowAnonymousCustomTemplates: false,
        allowAnonymousBoardCreation: false,
        serverTime: new Date().getTime(),
        feedbackEnabled: false,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(stateWithBoardCreationEnabled, action);

      expect(newState.allowAnonymousBoardCreation).toBe(false);
    });

    it("should update allowAnonymousBoardCreation to true when server sends true", () => {
      const stateWithBoardCreationDisabled = {
        ...initialState,
        allowAnonymousBoardCreation: false,
      };

      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: false,
        enabledAuthProvider: [],
        allowAnonymousCustomTemplates: false,
        allowAnonymousBoardCreation: true,
        serverTime: new Date().getTime(),
        feedbackEnabled: false,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(stateWithBoardCreationDisabled, action);

      expect(newState.allowAnonymousBoardCreation).toBe(true);
    });

    it("should handle mixed permission flags correctly", () => {
      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: true,
        enabledAuthProvider: ["microsoft"],
        allowAnonymousCustomTemplates: false,
        allowAnonymousBoardCreation: true,
        serverTime: new Date().getTime(),
        feedbackEnabled: true,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(initialState, action);

      // Anonymous login is disabled but board creation is allowed
      expect(newState.anonymousLoginDisabled).toBe(true);
      expect(newState.allowAnonymousCustomTemplates).toBe(false);
      expect(newState.allowAnonymousBoardCreation).toBe(true);
      expect(newState.feedbackEnabled).toBe(true);
    });

    it("should maintain other state properties when updating server info", () => {
      const customState = {
        ...initialState,
        moderating: true,
        hotkeysAreActive: false,
        theme: "dark" as const,
        noteFocused: true,
      };

      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: false,
        enabledAuthProvider: ["apple"],
        allowAnonymousCustomTemplates: true,
        allowAnonymousBoardCreation: false,
        serverTime: new Date().getTime(),
        feedbackEnabled: false,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(customState, action);

      // Server info should be updated
      expect(newState.allowAnonymousBoardCreation).toBe(false);
      expect(newState.allowAnonymousCustomTemplates).toBe(true);

      // Other state properties should remain unchanged
      expect(newState.moderating).toBe(true);
      expect(newState.hotkeysAreActive).toBe(false);
      expect(newState.theme).toBe("dark");
      expect(newState.noteFocused).toBe(true);
    });

    it("should calculate server time offset correctly", () => {
      const fixedServerTime = new Date("2023-01-01T12:00:00Z").getTime();
      const fixedClientTime = new Date("2023-01-01T12:00:05Z").getTime(); // 5 seconds ahead

      // Mock Date.now to return our fixed client time
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return new originalDate(fixedClientTime);
        }
        static now() {
          return fixedClientTime;
        }
        getTime() {
          return fixedClientTime;
        }
      } as any;

      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: false,
        enabledAuthProvider: [],
        allowAnonymousCustomTemplates: false,
        allowAnonymousBoardCreation: true,
        serverTime: fixedServerTime,
        feedbackEnabled: false,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(initialState, action);

      // Client is 5 seconds ahead of server, so offset should be positive 5000ms
      expect(newState.serverTimeOffset).toBe(5000);

      // Restore original Date
      global.Date = originalDate;
    });

    it("should handle server info with all permission flags disabled", () => {
      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: true,
        enabledAuthProvider: [],
        allowAnonymousCustomTemplates: false,
        allowAnonymousBoardCreation: false,
        serverTime: new Date().getTime(),
        feedbackEnabled: false,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(initialState, action);

      expect(newState.anonymousLoginDisabled).toBe(true);
      expect(newState.allowAnonymousCustomTemplates).toBe(false);
      expect(newState.allowAnonymousBoardCreation).toBe(false);
      expect(newState.feedbackEnabled).toBe(false);
      expect(newState.enabledAuthProvider).toEqual([]);
    });

    it("should handle server info with all permission flags enabled", () => {
      const serverInfo: ServerInfo = {
        anonymousLoginDisabled: false,
        enabledAuthProvider: ["google", "github", "microsoft", "apple"],
        allowAnonymousCustomTemplates: true,
        allowAnonymousBoardCreation: true,
        serverTime: new Date().getTime(),
        feedbackEnabled: true,
      };

      const action = setServerInfo.fulfilled(serverInfo, "requestId");
      const newState = viewReducer(initialState, action);

      expect(newState.anonymousLoginDisabled).toBe(false);
      expect(newState.allowAnonymousCustomTemplates).toBe(true);
      expect(newState.allowAnonymousBoardCreation).toBe(true);
      expect(newState.feedbackEnabled).toBe(true);
      expect(newState.enabledAuthProvider).toEqual(["google", "github", "microsoft", "apple"]);
    });
  });

  describe("initial state", () => {
    it("should have allowAnonymousBoardCreation set to false by default", () => {
      expect(initialState.allowAnonymousBoardCreation).toBe(false);
    });

    it("should maintain default values for all anonymous permission flags", () => {
      expect(initialState.anonymousLoginDisabled).toBe(false);
      expect(initialState.allowAnonymousCustomTemplates).toBe(false);
      expect(initialState.allowAnonymousBoardCreation).toBe(false);
    });
  });
});
