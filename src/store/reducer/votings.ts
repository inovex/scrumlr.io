import {Action, ReduxAction} from "store/action";
import {VotingsState} from "types/voting";

/**
 * Default vote configuration if the state is undefined (e.g. no default vote configuration available in the database)
 */
const defaultVotingState: VotingsState = {open: undefined, past: []};

// eslint-disable-next-line default-param-last
export const votingReducer = (state: VotingsState = defaultVotingState, action: ReduxAction): VotingsState => {
  if (action.type === Action.InitializeBoard) {
    return {
      ...state,
      open: action.votings.find((v) => v.status === "OPEN"),
      past: action.votings.filter((v) => v.status !== "OPEN"),
    };
  }

  if (action.type === Action.CreatedVoting) {
    return {
      ...state,
      open: action.voting,
    };
  }

  if (action.type === Action.UpdatedVoting) {
    return {
      ...state,
      open: undefined,
      past: [action.voting, ...state.past],
    };
  }
  return state;
};
