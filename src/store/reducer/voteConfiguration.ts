import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {ActionType, ReduxAction} from "store/action";

export const voteConfigurationReducer = (state: VoteConfigurationClientModel[] = [], action: ReduxAction): VoteConfigurationClientModel[] => {
  switch (action.type) {
    case ActionType.AddedVoteConfiguration: {
      const newState = [...state, action.voteConfiguration];
      return newState;
    }
    case ActionType.RemovedVoteConfiguration: {
      return state.filter((voteConfiguration) => voteConfiguration.votingIteration !== action.voteConfiguration.votingIteration);
    }
    case ActionType.InitializeVoteConfigurations: {
      return [...action.voteConfigurations];
    }
    default: {
      return state;
    }
  }
};
