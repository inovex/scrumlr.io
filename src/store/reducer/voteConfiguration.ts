import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {ActionType, ReduxAction} from "store/action";

export const voteConfigurationReducer = (
  state: VoteConfigurationClientModel = {votingIteration: 0, voteLimit: 10, showVotesOfOtherUsers: true, allowMultipleVotesPerNote: true},
  action: ReduxAction
): VoteConfigurationClientModel => {
  switch (action.type) {
    case ActionType.InitializeVoteConfiguration:
    case ActionType.RemovedVoteConfiguration:
    case ActionType.AddedVoteConfiguration: {
      return action.voteConfiguration;
    }
    default: {
      return state;
    }
  }
};
