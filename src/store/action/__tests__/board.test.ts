import {AssertTypeEqual} from "testUtils";
import {BoardClientModel} from "types/board";
import {BoardActionFactory, BoardActionType, BoardReduxAction} from "../board";
import {ReduxAction} from "../index";

describe("board actions", () => {
  test("equal number of action types and factory functions", () => {
    expect(Object.keys(BoardActionType).length).toEqual(Object.keys(BoardActionFactory).length);
  });

  describe("leave board", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.leaveBoard>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.leaveBoard>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.leaveBoard();
      expect(action).toEqual({type: "@@SCRUMLR/leaveBoard"});
    });
  });

  describe("join board", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.joinBoard>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.joinBoard>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.joinBoard("boardId");
      expect(action).toEqual({
        type: "@@SCRUMLR/joinBoard",
        boardId: "boardId",
      });
    });
  });

  describe("initialize board", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.initializeBoard>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.initializeBoard>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.initializeBoard({test: true} as unknown as BoardClientModel);
      expect(action).toEqual({
        type: "@@SCRUMLR/initBoard",
        board: {test: true},
      });
    });
  });

  describe("edit board", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.editBoard>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.editBoard>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.editBoard({id: "test_board", name: "Name", showAuthors: true});
      expect(action).toEqual({
        type: "@@SCRUMLR/editBoard",
        board: {
          id: "test_board",
          name: "Name",
          showAuthors: true,
        },
      });
    });
  });

  describe("updated board", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.updatedBoard>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.updatedBoard>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.updatedBoard({test: true} as unknown as BoardClientModel);
      expect(action).toEqual({
        type: "@@SCRUMLR/updatedBoard",
        board: {test: true},
      });
    });
  });

  describe("delete board", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.deleteBoard>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.deleteBoard>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.deleteBoard("test_board");
      expect(action).toEqual({type: "@@SCRUMLR/deleteBoard", boardId: "test_board"});
    });
  });

  describe("permitted board access", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.permittedBoardAccess>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.permittedBoardAccess>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.permittedBoardAccess("boardId");
      expect(action).toEqual({
        type: "@@SCRUMLR/permittedBoardAccess",
        boardId: "boardId",
      });
    });
  });

  describe("rejected board access", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.rejectedBoardAccess>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.rejectedBoardAccess>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.rejectedBoardAccess();
      expect(action).toEqual({type: "@@SCRUMLR/rejectedBoardAccess"});
    });
  });

  describe("pending board access confirmation", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.pendingBoardAccessConfirmation>, BoardReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof BoardActionFactory.pendingBoardAccessConfirmation>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = BoardActionFactory.pendingBoardAccessConfirmation("requestReference");
      expect(action).toEqual({
        type: "@@SCRUMLR/pendingBoardAccessConfirmation",
        requestReference: "requestReference",
      });
    });
  });
});
