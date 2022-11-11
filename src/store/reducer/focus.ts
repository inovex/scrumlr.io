import {Action, ReduxAction} from "store/action";
import {Focus} from "types/focus";

export const focusReducer = (state: Focus = {initiator: null}, action: ReduxAction): Focus => {
  switch (action.type) {
    case Action.SetInitiator:
      state.initiator = action.participant;
      return state;

    case Action.ClearInitiator:
      state.initiator = null;
      return state;

    default:
      return state;
  }
};
