import {Action, ReduxAction} from "store/action";
import {ParticipantsState} from "types/participant";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const participantsReducer = (state: ParticipantsState = null, action: ReduxAction): ParticipantsState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.SetParticipants: {
      const ownUserId = action.context.user;

      const self = action.participants.find((p) => p.user.id === ownUserId)!;
      const others = action.participants.filter((p) => p.user.id !== ownUserId);
      const focusInitiator = null;

      return {
        ...state,
        self,
        others,
        focusInitiator,
      };
    }

    case Action.CreatedParticipant: {
      return {
        ...state!,
        self: state!.self,
        others: [action.participant, ...state!.others],
      };
    }

    case Action.UpdatedParticipant: {
      action.participant.user.unsavedAvatar = state!.self.user.unsavedAvatar; // don't update with db-value
      if (action.participant.user.id === state!.self.user.id) {
        return {
          ...state!,
          self: action.participant,
          others: [...state!.others],
        };
      }

      const index = state!.others.findIndex((p) => p.user.id === action.participant.user.id);

      const newOthers = state!.others.slice();
      newOthers.splice(index, 1, action.participant);

      return {
        ...state!,
        self: state!.self,
        others: newOthers,
      };
    }

    case Action.EditSelf: {
      return {
        ...state!,
        self: {
          ...state!.self,
          user: action.user,
        },
        others: [...state!.others],
      };
    }

    case Action.SetFocusInitiator: {
      const focusInitiator = action.participant;
      return {
        ...state,
        self: state!.self,
        others: [...state!.others],
        focusInitiator,
      };
    }

    case Action.ClearFocusInitiator: {
      return {
        ...state,
        self: state!.self,
        others: [...state!.others],
        focusInitiator: null,
      };
    }

    default: {
      return state;
    }
  }
};
