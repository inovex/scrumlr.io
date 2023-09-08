import {Action, ReduxAction} from "store/action";
import {BoardReactionState} from "types/reaction";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const boardReactionReducer = (state: BoardReactionState = [], action: ReduxAction): BoardReactionState => {
  switch (action.type) {
    case Action.AddedBoardReaction:
      return [...state, action.boardReaction];
    case Action.RemoveBoardReaction:
      return state.filter((br) => br.id !== action.id);
    default:
      return state;
  }
};
