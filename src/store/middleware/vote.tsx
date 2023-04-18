import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18next";
import {Toast} from "../../utils/toast";
import store from "../index";

export const passVoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddVote) {
    API.addVote(action.context.board!, action.note)
      .then((r) => {
        dispatch(Actions.createdVote(r));
      })
      .catch(() => {
        Toast.error({
          title: i18n.t("Error.addVote"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.addVote(action.note)),
          autoClose: false,
        });
      });
  }

  if (action.type === Action.DeleteVote) {
    API.deleteVote(action.context.board!, action.note)
      .then(() => {
        dispatch(Actions.deletedVote({voting: action.context.voting!, note: action.note}));
      })
      .catch(() => {
        Toast.error({
          title: i18n.t("Error.deleteVote"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.deleteVote(action.note)),
          autoClose: false,
        });
      });
  }
};
