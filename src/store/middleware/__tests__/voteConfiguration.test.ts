import {passVoteConfigurationMiddlware} from "store/middleware/voteConfiguration";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    addVoteConfiguration: jest.fn(),
    removeVoteConfiguration: jest.fn(),
  },
}));

beforeEach(() => {
  (API.addVoteConfiguration as jest.Mock).mockClear();
  (API.removeVoteConfiguration as jest.Mock).mockClear();
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
  /*
  Causes unhandled exceptions: Reason -> await and the Toast error message
  test("add voteConfiguration", () => {
    passVoteConfigurationMiddlware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.addVoteConfiguration({
      board: "boardId",
      votingIteration: 1,
      voteLimit: 5,
      allowMultipleVotesPerNote: true,
      showVotesOfOtherUsers: false
    }));
    expect(API.addVoteConfiguration).toHaveBeenCalledWith({
      board: "boardId",
      votingIteration: 1,
      voteLimit: 5,
      allowMultipleVotesPerNote: true,
      showVotesOfOtherUsers: false
    });
  });
  */

  test("remove VoteConfiguration", () => {
    passVoteConfigurationMiddlware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.removeVoteConfiguration("boardId"));
    expect(API.removeVoteConfiguration).toHaveBeenCalledWith("boardId");
  });
});
