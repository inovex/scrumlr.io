import {VoteClientModel} from "types/vote";
import {ActionType, ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const voteReducer = (state: VoteClientModel[] = [], action: ReduxAction): VoteClientModel[] => {
  switch (action.type) {
    case ActionType.CreatedVote: {
      const newState = [...state, action.vote];
      return newState;
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
