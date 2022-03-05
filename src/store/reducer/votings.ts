import {ReduxAction} from "store/action";
import {VotingsState} from "types/voting";

/**
 * Default vote configuration if the state is undefined (e.g. no default vote configuration available in the database)
 */
const defaultVotingState: VotingsState = {open: undefined, past: []};

// eslint-disable-next-line default-param-last
export const votingReducer = (state: VotingsState = defaultVotingState, action: ReduxAction): VotingsState => 
  // TODO
   state
;
