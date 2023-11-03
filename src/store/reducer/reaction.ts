import {ReactionState} from "types/reaction";
import {Action, ReduxAction} from "../action";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const reactionReducer = (state: ReactionState = [], action: ReduxAction): ReactionState => {
  switch (action.type) {
    case Action.InitializeBoard:
      return action.reactions;

    case Action.AddedReaction:
      return [...state, action.reaction];

    case Action.DeletedReaction:
      return state.filter((r) => r.id !== action.reactionId);

    case Action.UpdatedReaction: {
      const updatedReaction = action.reaction;
      // since we don't mutate our original state we first filter out the old reaction ...
      const filteredState = state.filter((r) => r.id !== updatedReaction.id);
      // ... then add the reaction with the new reactionType
      return [...filteredState, updatedReaction];
    }

    default:
      return state;
  }
};
