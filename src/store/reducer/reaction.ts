import {Action, ReduxAction} from "../action";
import {ReactionState} from "../../types/reaction";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const reactionReducer = (state: ReactionState = [], action: ReduxAction): ReactionState => {
  switch (action.type) {
    case Action.InitializeBoard:
      return action.reactions;

    case Action.AddedReaction:
      return [...state, action.reaction];

    case Action.DeletedReaction:
      return state.filter((r) => r.id !== action.reactionId);

    default:
      return state;
  }
};
