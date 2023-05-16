import {Action, ReduxAction} from "../action";
import {ReactionState} from "../../types/reaction";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const reactionReducer = (state: ReactionState = [], action: ReduxAction): ReactionState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.UpdatedReactions:
      return action.reactions;
    case Action.DeletedReaction:
      const newReactions = state.slice();
      const index = state.findIndex((r) => r.id === action.reactionId);
      if (index >= 0) {
        newReactions.splice(index, 1);
      }
      return newReactions;

    default:
      return state;
  }
};
