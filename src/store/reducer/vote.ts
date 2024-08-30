import {Action, ReduxAction} from "store/action";
import {VotesState} from "store/features/votes/types";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const voteReducer = (state: VotesState = [], action: ReduxAction): VotesState => {
  if (action.type === Action.InitializeBoard) {
    return action.votes;
  }

  if (action.type === Action.CreatedVote) {
    return [action.vote, ...state];
  }

  if (action.type === Action.DeletedVote) {
    const newVotes = state.slice();
    const index = newVotes.findIndex((v) => v.voting === action.vote.voting && v.note === action.vote.note);
    if (index >= 0) {
      newVotes.splice(index, 1);
      return newVotes;
    }
  }

  if (action.type === Action.UpdatedVotes) {
    return action.votes;
  }

  return state;
};
