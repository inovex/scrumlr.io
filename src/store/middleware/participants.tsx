import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import store from "../index";

export const passParticipantsMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.SetRaisedHandStatus) {
    API.editParticipant(action.context.board!, action.user, {raisedHand: action.raisedHand}).catch(() => {
      Toast.error({
        title: i18n.t("Error.setRaiseHand"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.setRaisedHand(action.user, action.raisedHand)),
      });
    });
  }

  if (action.type === Action.SetUserReadyStatus) {
    API.editParticipant(action.context.board!, action.user, {ready: action.ready}).catch(() => {
      Toast.error({
        title: i18n.t("Error.setUserReady"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.setUserReadyStatus(action.user, action.ready)),
      });
    });
  }

  if (action.type === Action.SetShowHiddenColumns) {
    API.editParticipant(action.context.board!, action.context.user!, {showHiddenColumns: action.showHiddenColumns}).catch(() => {
      Toast.error({
        title: i18n.t("Error.setShowHiddenColumns"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.setShowHiddenColumns(action.showHiddenColumns)),
      });
    });
  }

  if (action.type === Action.SetUserBanned) {
    API.editParticipant(action.context.board!, action.user, {
      banned: action.banned,
    }).then(
      () => {
        Toast.info({title: i18n.t(action.banned ? "Toast.bannedParticipant" : "Toast.unbannedParticipant", {user: action.userName})});
      },
      () => {
        Toast.error({
          title: i18n.t("Error.setUserBanned"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.setUserBanned(action.user, action.userName, action.banned)),
        });
      }
    );
  }

  if (action.type === Action.ChangePermission) {
    API.editParticipant(action.context.board!, action.userId, {
      role: action.moderator ? "MODERATOR" : "PARTICIPANT",
    }).catch(() => {
      Toast.error({
        title: i18n.t("Error.changePermission"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.changePermission(action.userId, action.moderator)),
      });
    });
  }

  if (action.type === Action.EditSelf) {
    API.editUser(action.user).catch(() => {
      Toast.error({
        title: i18n.t("Error.editSelf"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.editSelf(action.user)),
      });
    });
  }
};
