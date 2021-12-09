import {VoteClientModel} from "types/vote";
import {ActionType, ReduxAction} from "store/action";
import Parse from "parse";

// eslint-disable-next-line default-param-last
export const voteReducer = (state: VoteClientModel[] = [], action: ReduxAction): VoteClientModel[] => {
  switch (action.type) {
    case ActionType.CreatedVote: {
      const newState = [...state];
      const foundExistingVoteIndex = newState.findIndex(
        (vote) => !vote.id && vote.note === action.vote.note && vote.user === action.vote.user && vote.votingIteration === action.vote.votingIteration
      );
      if (foundExistingVoteIndex >= 0) {
        newState.splice(foundExistingVoteIndex, 1, action.vote);
      } else {
        newState.push(action.vote);
      }
      return newState;
    }
    case ActionType.AddVote: {
      const localVote: VoteClientModel = {
        note: action.note,
        board: action.boardId,
        user: Parse.User.current()!.id,
        votingIteration: action.votingIteration,
      };
      return [...state, localVote];
    }
    case ActionType.DeletedVote: {
      return state.filter((vote) => vote.id !== action.voteId);
    }
    case ActionType.InitializeVotes: {
      return [...action.votes];
    }
    default: {
      return state;
    }
  }
};
