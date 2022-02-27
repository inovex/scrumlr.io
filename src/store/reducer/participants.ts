import Parse from "parse";
import union from "lodash/union";
import without from "lodash/without";
import {ActionType, ReduxAction} from "../action";
import {ParticipantsState} from "../../types/participant";
import store from "../index";

// eslint-disable-next-line default-param-last
export const usersReducer = (state: ParticipantsState = undefined, action: ReduxAction): ParticipantsState => {
  switch (action.type) {
    case ActionType.SetUserReadyStatus: {
      let {ready} = state;
      if (ready !== undefined) {
        const userId = Parse.User.current()!.id;
        if (action.ready) {
          ready = union(ready, [userId]);
        } else {
          ready = without(ready, userId);
        }
        return mapReadyState(state, ready);
      }
      return state;
    }

    case ActionType.SetRaisedHandStatus: {
      let {raisedHands} = state;
      if (raisedHands !== undefined) {
        if (action.configuration.raisedHand) {
          raisedHands = union(raisedHands, action.configuration.userId);
        } else {
          raisedHands = raisedHands.filter((id) => action.configuration.userId.find((user) => user === id) === undefined);
        }
        return mapRaisedHandState(state, raisedHands);
      }
      return state;
    }

    case ActionType.InitializeBoard:
    case ActionType.SetParticipants: {
      const ownUserId = store.getState().user.user!.id;
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
