import {ApplicationState} from "types/store";
import {VotingClientModel} from "types/voting";
import {votingReducer} from "store/reducer/votings";
import {ActionFactory} from "store/action";

describe("vote configuration reducer", () => {
  let initialState: ApplicationState;

  beforeEach(() => {
    initialState = {
      votings: {boardId: "test_board", votingIteration: 0, voteLimit: 0, allowMultipleVotesPerNote: false, showVotesOfOtherUsers: true},
      board: {status: "unknown"},
      participants: {moderators: [], basic: [], participants: [], ready: [], raisedHands: []},
      notes: [],
      votes: [],
      joinRequests: [],
    };
  });

  test("add vote configuration", () => {
    const voteConfiguration = {
      boardId: "test_board",
      votingIteration: 1,
      voteLimit: 5,
      allowMultipleVotesPerNote: false,
      showVotesOfOtherUsers: true,
    } as VotingClientModel;
    const newState = votingReducer(initialState.votings, ActionFactory.addedVoteConfiguration(voteConfiguration));
    expect(newState).toEqual(voteConfiguration);
  });
});
