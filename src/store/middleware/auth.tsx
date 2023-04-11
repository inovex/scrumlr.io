import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Actions, ReduxAction} from "store/action";
import {AuthAction} from "store/action/auth";
import {API} from "api";
import {ViewAction} from "store/action/view";
import {Toast} from "utils/Toast";
import i18n from "i18n";
import store from "store";

export const passAuthMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ViewAction.InitApplication) {
    API.getCurrentUser()
      .then((user) => {
        if (user) {
          dispatch(Actions.signIn(user.id, user.name, user.avatar));
        }
        dispatch(Actions.userCheckCompleted(true));
      })
      .catch(() => {
        i18n.on("loaded", () => {
          Toast.error({
            title: i18n.t("Error.serverConnection"),
            buttons: [i18n.t("Error.retry")],
            firstButtonOnClick: () => store.dispatch(Actions.initApplication()),
            autoClose: false,
          });
        });
        dispatch(Actions.userCheckCompleted(false));
      });
  }

  if (action.type === AuthAction.SignOut) {
    API.signOut()
      .then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      })
      .catch(() => {
        i18n.on("loaded", () => {
          Toast.error({
            title: i18n.t("Error.logout"),
            buttons: [i18n.t("Error.retry")],
            firstButtonOnClick: () => store.dispatch(Actions.signOut()),
            autoClose: false,
          });
        });
      });
  }
};
