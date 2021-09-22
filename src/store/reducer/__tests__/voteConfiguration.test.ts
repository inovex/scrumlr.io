import {ApplicationState} from "types/store";
import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {voteConfigurationReducer} from "../voteConfiguration";
import {ActionFactory} from "../../action";

describe("vote configuration reducer", () => {
  let initialState: ApplicationState;

  beforeEach(() => {
    initialState = {
      voteConfiguration: {boardId: "test_board", votingIteration: 0, voteLimit: 0, allowMultipleVotesPerNote: false, showVotesOfOtherUsers: true},
      board: {status: "unknown"},
      users: {admins: [], basic: [], all: []},
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
    } as VoteConfigurationClientModel;
    const newState = voteConfigurationReducer(initialState.voteConfiguration, ActionFactory.addedVoteConfiguration(voteConfiguration));
    expect(newState).toEqual(voteConfiguration);
  });

  test("update vote configuration", () => {
    const voteConfiguration = {
      boardId: "test_board",
      votingIteration: 1,
      voteLimit: 5,
    } as VoteConfigurationClientModel;
    const newState = voteConfigurationReducer(initialState.voteConfiguration, ActionFactory.addedVoteConfiguration(voteConfiguration));
    expect(newState).toEqual(voteConfiguration);
  });

  test("remove vote configuration", () => {
    const newState = voteConfigurationReducer(initialState.voteConfiguration, ActionFactory.removeVoteConfiguration(""));
    expect(newState).toEqual(initialState.voteConfiguration);
  });
});
