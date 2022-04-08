import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import {Button} from "../../components/Button";
import store from "../index";

export const passParticipantsMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.SetRaisedHandStatus) {
    API.editParticipant(action.context.board!, action.user, {raisedHand: action.raisedHand}).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.setRaiseHand")}</div>
          <Button onClick={() => store.dispatch(Actions.setRaisedHand(action.user, action.raisedHand))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.SetUserReadyStatus) {
    API.editParticipant(action.context.board!, action.user, {ready: action.ready}).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.setUserReady")}</div>
          <Button onClick={() => store.dispatch(Actions.setUserReadyStatus(action.user, action.ready))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.SetShowHiddenColumns) {
    API.editParticipant(action.context.board!, action.context.user!, {showHiddenColumns: action.showHiddenColumns}).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.setShowHiddenColumns")}</div>
          <Button onClick={() => store.dispatch(Actions.setShowHiddenColumns(action.showHiddenColumns))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.ChangePermission) {
    API.editParticipant(action.context.board!, action.userId, {
      role: action.moderator ? "MODERATOR" : "PARTICIPANT",
    }).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.changePermission")}</div>
          <Button onClick={() => store.dispatch(Actions.changePermission(action.userId, action.moderator))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.EditParticipant) {
    API.editParticipant(action.context.board!, action.participant.user.id, action.participant).catch(() => {
      Toast.error(
        <div>
          <div>{/* {i18n.t("Error.editParticipant")} */}</div>
          {/* <Button onClick={() => store.dispatch(Actions.changePermission(action.userId, action.moderator))}>{i18n.t("Error.retry")}</Button> */}
        </div>
      );
    });
  }
};
