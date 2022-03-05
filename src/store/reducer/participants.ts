import {Action, ReduxAction} from "../action";
import {ParticipantsState} from "../../types/participant";
import store from "../index";

// eslint-disable-next-line default-param-last
export const usersReducer = (state: ParticipantsState = undefined, action: ReduxAction): ParticipantsState => {
  switch (action.type) {
    case Action.SetUserReadyStatus: {
      // TODO
      return state;
    }

    case Action.InitializeBoard:
    case Action.SetParticipants: {
      const ownUserId = store.getState().auth.user!.id;
      const self = action.participants.find((p) => p.user.id === ownUserId)!;
      const others = action.participants.filter((p) => p.user.id !== ownUserId);
      return {
        ...state,
        self,
        participants: others,
      };
    }
    default: {
      return state;
    }
  }
};
