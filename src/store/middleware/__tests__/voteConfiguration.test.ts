import {passVoteConfigurationMiddlware} from "store/middleware/voteConfiguration";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    addVoteConfiguration: jest.fn(),
  },
}));

beforeEach(() => {
  (API.addVoteConfiguration as jest.Mock).mockClear();
  (API.addVoteConfiguration as jest.Mock).mockReturnValue({status: "Success"});
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
    passVoteConfigurationMiddlware(
      stateAPI as MiddlewareAPI,
      jest.fn(),
      ActionFactory.addVoteConfiguration({
        boardId: "boardId",
        voteLimit: 5,
        allowMultipleVotesPerNote: true,
        showVotesOfOtherUsers: false,
      })
    );
    expect(API.addVoteConfiguration).toHaveBeenCalledWith({
      boardId: "boardId",
      voteLimit: 5,
      allowMultipleVotesPerNote: true,
      showVotesOfOtherUsers: false,
    });
  });
});
