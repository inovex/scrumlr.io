import {VotingsState} from "store/features/votings/voting";
import {Action, ReduxAction} from "store/action";

/**
 * Default vote configuration if the state is undefined (e.g. no default vote configuration available in the database)
 */
const INITIAL_VOTING_STATE: VotingsState = {open: undefined, past: []};

// eslint-disable-next-line @typescript-eslint/default-param-last
export const votingReducer = (state: VotingsState = INITIAL_VOTING_STATE, action: ReduxAction): VotingsState => {
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
