import {passVoteConfigurationMiddleware} from "store/middleware/votings";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    createVoting: jest.fn(),
  },
}));

beforeEach(() => {
  (API.createVoting as jest.Mock).mockClear();
  (API.createVoting as jest.Mock).mockReturnValue({status: "Success"});
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

describe("voteConfiguration middleware", () => {
  test("add voteConfiguration", () => {
    passVoteConfigurationMiddleware(
      stateAPI as MiddlewareAPI,
      jest.fn(),
      ActionFactory.addVoteConfiguration({
        boardId: "boardId",
        voteLimit: 5,
        allowMultipleVotesPerNote: true,
        showVotesOfOtherUsers: false,
      })
    );
    expect(API.createVoting).toHaveBeenCalledWith({
      boardId: "boardId",
      voteLimit: 5,
      allowMultipleVotesPerNote: true,
      showVotesOfOtherUsers: false,
    });
  });
});
