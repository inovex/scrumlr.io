import {ApplicationState} from "types/store";
import {VoteClientModel} from "types/vote";
import {voteReducer} from "store/reducer/vote";
import {ActionFactory} from "store/action";

describe("vote reducer", () => {
  let initialState: ApplicationState;

  beforeEach(() => {
    initialState = {
      voteConfiguration: {boardId: "test_board", votingIteration: 0, voteLimit: 0, allowMultipleVotesPerNote: false, showVotesOfOtherUsers: true},
      board: {status: "unknown"},
      users: {admins: [], basic: [], all: [], usersMarkedReady: []},
      notes: [],
      votes: [],
      joinRequests: [],
    };
  });

  test("create vote", () => {
    const vote = {
      id: "test_id",
      board: "test_board",
      note: "test_note",
      user: "test_user",
      votingIteration: 1,
    } as VoteClientModel;
    const newState = voteReducer(initialState.votes, ActionFactory.createdVote(vote));
    expect(newState).toEqual([vote]);
  });

  test("delete vote", () => {
    const vote = {
      id: "test_id",
      board: "test_board",
      note: "test_note",
      user: "test_user",
      votingIteration: 1,
    } as VoteClientModel;
    let newState = voteReducer(initialState.votes, ActionFactory.createdVote(vote));
    expect(newState).toEqual([vote]);
    newState = voteReducer(initialState.votes, ActionFactory.deletedVote("test_id"));
    expect(newState).toEqual([]);
  });

  test("initialize votes", () => {
    const vote = {
      id: "test_id",
      board: "test_board",
      note: "test_note",
      user: "test_user",
      votingIteration: 1,
    } as VoteClientModel;
    const newState = voteReducer(initialState.votes, ActionFactory.initializeVotes([vote, vote]));
    expect(newState).toEqual([vote, vote]);
  });
});
