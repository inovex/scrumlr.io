import {ReduxAction} from "../action";
import {ReactionState} from "../../types/reaction";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const reactionReducer = (state: ReactionState = [], action: ReduxAction): ReactionState => {
  switch (action) {
    default:
      return state; // do nothing yet
  }
};
