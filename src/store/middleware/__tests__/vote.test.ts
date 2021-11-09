import {passVoteMiddlware} from "store/middleware/vote";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    addVote: jest.fn(),
    deleteVote: jest.fn(),
  },
}));

beforeEach(() => {
  (API.addVote as jest.Mock).mockClear();
  (API.addVote as jest.Mock).mockReturnValue({status: "Success"});
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

describe("vote middleware", () => {
  test("add vote", () => {
    passVoteMiddlware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.addVote("noteId"));
    expect(API.addVote).toHaveBeenCalledWith("boardId", "noteId");
  });

  test("delete vote", () => {
    passVoteMiddlware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.deleteVote("noteId"));
    expect(API.deleteVote).toHaveBeenCalledWith("boardId", "noteId");
  });
});
