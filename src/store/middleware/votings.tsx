import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18next";
import {Toast} from "../../utils/Toast";
import store from "../index";

export const passVotingMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.CreateVoting) {
    API.createVoting(action.context.board!, action.voting).catch(() => {
      Toast.error({
        title: i18n.t("Error.createVoting"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.createVoting(action.voting)),
        autoClose: false,
      });
    });
  }

  if (action.type === Action.CloseVoting) {
    API.changeVotingStatus(action.context.board!, action.voting, "CLOSED").catch(() => {
      Toast.error({
        title: i18n.t("Error.closeVoting"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.closeVoting(action.voting)),
        autoClose: false,
      });
    });
    API.updateReadyStates(action.context.board!, false);
  }
};
