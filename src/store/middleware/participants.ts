import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "../action";
import {API} from "../../api";

export const passParticipantsMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.SetRaisedHandStatus) {
    API.editParticipant(action.context.board!, action.user, {raisedHand: action.raisedHand}).catch(() => {
      // TODO show error toast
    });
  }

  if (action.type === Action.SetUserReadyStatus) {
    API.editParticipant(action.context.board!, action.user, {ready: action.ready}).catch(() => {
      // TODO show error toast
    });
  }

  if (action.type === Action.SetShowHiddenColumns) {
    API.editParticipant(action.context.board!, action.context.user!, {showHiddenColumns: action.showHiddenColumns}).catch(() => {
      // TODO show error toast
    });
  }

  if (action.type === Action.ChangePermission) {
    API.editParticipant(action.context.board!, action.userId, {
      role: action.moderator ? "MODERATOR" : "PARTICIPANT",
    }).catch(() => {
      // TODO show error toast
    });
  }
};
