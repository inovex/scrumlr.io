import {BoardState} from "types/store";
import {ActionFactory} from "store/action";
import {EditBoardRequest} from "types/board";
import {boardReducer} from "../board";

describe("vote configuration reducer", () => {
  let initialState: BoardState;

  beforeEach(() => {
    initialState = {
      status: "unknown",
    };
  });

  test("edit board", () => {
    const data: EditBoardRequest = {
      id: "test_board",
      moderation: {userId: "test_user", status: "active"},
    };
    const newState = boardReducer(initialState, ActionFactory.editBoard(data));
    expect(newState.data?.moderation).toEqual(data.moderation);
  });
});
