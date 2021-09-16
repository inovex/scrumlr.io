import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {ActionType, ReduxAction} from "store/action";

const defaultVoteConfiguration = {votingIteration: 0, voteLimit: 10, showVotesOfOtherUsers: false, allowMultipleVotesPerNote: true};

export const voteConfigurationReducer = (state: VoteConfigurationClientModel = defaultVoteConfiguration, action: ReduxAction): VoteConfigurationClientModel => {
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
