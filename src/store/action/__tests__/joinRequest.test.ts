import {AssertTypeEqual} from "testUtils";
import {JoinRequestClientModel} from "types/joinRequest";
import {JoinRequestActionFactory, JoinRequestActionType, JoinRequestReduxAction} from "../joinRequest";
import {ReduxAction} from "../index";

describe("joinRequest actions", () => {
  const id = "joinRequestId";
  const boardId = "boardId";
  const userId = "userId";
  const userIds = ["userId1", "userId2"];
  const joinRequest: JoinRequestClientModel = {
    id,
    boardId,
    userId,
    status: "accepted",
    displayName: "displayName",
  };

  test("equal number of action types and factory functions", () => {
    expect(Object.keys(JoinRequestActionType).length).toEqual(Object.keys(JoinRequestActionFactory).length);
  });

  describe("acceptJoinRequests", () => {
    test("type is listed in joinRequest redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.acceptJoinRequests>, JoinRequestReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("type is listed in general redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.acceptJoinRequests>, ReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("should dispatch correct action object", () => {
      const action = JoinRequestActionFactory.acceptJoinRequests(boardId, userIds);
      expect(action).toEqual({
        type: JoinRequestActionType.AcceptJoinRequests,
        boardId,
        userIds,
      });
    });
  });

  describe("rejectJoinRequests", () => {
    test("type is listed in joinRequest redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.rejectJoinRequests>, JoinRequestReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("type is listed in general redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.rejectJoinRequests>, ReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("should dispatch correct action object", () => {
      const action = JoinRequestActionFactory.rejectJoinRequests(boardId, userIds);
      expect(action).toEqual({
        type: JoinRequestActionType.RejectJoinRequests,
        boardId,
        userIds,
      });
    });
  });

  describe("initializeJoinRequests", () => {
    test("type is listed in joinRequest redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>, JoinRequestReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("type is listed in general redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>, ReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("should dispatch correct action object", () => {
      const action = JoinRequestActionFactory.initializeJoinRequests([joinRequest]);
      expect(action).toEqual({
        type: JoinRequestActionType.InitializeJoinRequests,
        joinRequests: [joinRequest],
      });
    });
  });

  describe("createJoinRequest", () => {
    test("type is listed in joinRequest redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.createJoinRequest>, JoinRequestReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("type is listed in general redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.createJoinRequest>, ReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("should dispatch correct action object", () => {
      const action = JoinRequestActionFactory.createJoinRequest(joinRequest);
      expect(action).toEqual({
        type: JoinRequestActionType.CreateJoinRequest,
        joinRequest,
      });
    });
  });

  describe("updateJoinRequest", () => {
    test("type is listed in joinRequest redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>, JoinRequestReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("type is listed in general redux actions", () => {
      const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>, ReduxAction> = true;
      expect(assertion).toBeTruthy();
    });

    test("should dispatch correct action object", () => {
      const action = JoinRequestActionFactory.updateJoinRequest(joinRequest);
      expect(action).toEqual({
        type: JoinRequestActionType.UpdateJoinRequest,
        joinRequest,
      });
    });
  });
});
