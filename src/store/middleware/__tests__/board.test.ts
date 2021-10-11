import {passBoardMiddleware} from "store/middleware/board";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    editBoard: jest.fn(),
  },
}));

beforeEach(() => {
  (API.editBoard as jest.Mock).mockClear();
});

const stateAPI = {
  getState: () => ({
    board: {
      data: {
        id: "boardId",
      },
    },
  }),
};

describe("board middleware", () => {
  test("Set moderation", () => {
    passBoardMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.editBoard({id: "test_board", name: "Name", moderation: {userId: "test_user", status: "active"}}));
    expect(API.editBoard).toHaveBeenCalledWith({id: "test_board", name: "Name", moderation: {userId: "test_user", status: "active"}});
  });
});
