import {VotesState} from "types/vote";
import {Action, ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const voteReducer = (state: VotesState = [], action: ReduxAction): VotesState => {
  if (action.type === Action.InitializeBoard) {
    return action.votes;
  }

  return state;
};
