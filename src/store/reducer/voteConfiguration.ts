import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {ActionType, ReduxAction} from "store/action";

/**
 * Default ovte configuration if the state is undefined (e.g. no default vote configuration available in the database)
 */
const defaultVoteConfiguration = {votingIteration: 0, voteLimit: 10, showVotesOfOtherUsers: false, allowMultipleVotesPerNote: true};

export const voteConfigurationReducer = (state: VoteConfigurationClientModel = defaultVoteConfiguration, action: ReduxAction): VoteConfigurationClientModel => {
  switch (action.type) {
    /**
     * If we receive a new vote configuration (e.g. we update the vote configuraton or we receive the intitial vote configuration), we need to update our state too.
     */
    case ActionType.InitializeVoteConfiguration:
    case ActionType.AddedVoteConfiguration: {
      return action.voteConfiguration;
    }
    /**
     * If we remove the vote configuration form our datebase, we don't need to remove it from the state too. The user can change the vote configuraton
     * and can reuse the old state for the new vote configuration.
     */
    case ActionType.RemovedVoteConfiguration:
    default: {
      return state;
    }
  }
};
