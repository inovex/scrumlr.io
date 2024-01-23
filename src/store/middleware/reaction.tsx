import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {Action, Actions, ReduxAction} from "store/action";
import {ApplicationState} from "../../types";
import {API} from "../../api";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import store from "../index";

export const passReactionMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddReaction) {
    API.addReaction(action.context.board!, action.noteId, action.reactionType).catch(() => {
      Toast.error({
        title: i18n.t("Error.addReaction"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.addReaction(action.noteId, action.reactionType)),
      });
    });
  }
  if (action.type === Action.DeleteReaction) {
    API.deleteReaction(action.context.board!, action.reactionId).catch(() => {
      Toast.error({
        title: i18n.t("Error.deleteReaction"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.deleteReaction(action.reactionId)),
      });
    });
  }
  if (action.type === Action.UpdateReaction) {
    API.updateReaction(action.context.board!, action.reactionId, action.reactionType).catch(() => {
      Toast.error({
        title: i18n.t("Error.updateReaction"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.updateReaction(action.reactionId, action.reactionType)),
      });
    });
  }
};
