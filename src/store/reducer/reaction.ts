import {Action, ReduxAction} from "../action";
import {ReactionState} from "../../types/reaction";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const reactionReducer = (state: ReactionState = [], action: ReduxAction): ReactionState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.UpdatedReactions: // TODO?
      return action.reactions;
    // TODO: other actions
    default:
      return state;
  }
};
