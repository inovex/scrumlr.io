import {ApplicationState} from "types/store";
import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {voteConfigurationReducer} from "../voteConfiguration";
import {ActionFactory} from "../../action";

describe("vote configuration reducer", () => {
  let initialState: ApplicationState;

  beforeEach(() => {
    initialState = {
      voteConfiguration: {board: "test_board", votingIteration: 0, voteLimit: 0, allowMultipleVotesPerNote: false, showVotesOfOtherUsers: true},
    };
  });

  test("add vote conmfiguration", () => {
    const voteConfiguration = {
      board: "test_board",
      votingIteration: 1,
      voteLimit: 5,
      allowMultipleVotesPerNote: false,
      showVotesOfOtherUsers: true,
    } as VoteConfigurationClientModel;
    const newState = voteConfigurationReducer(initialState, ActionFactory.addedVoteConfiguration({voteConfiguration}));
    expect(newState.voteConfiguration).toEqual(voteConfiguration);
  });

  test("add vote conmfiguration", () => {
    const newState = voteConfigurationReducer(initialState, ActionFactory.removeVoteConfiguration(null));
    expect(newState.voteConfiguration).toEqual(initialState.voteConfiguration);
  });
});
