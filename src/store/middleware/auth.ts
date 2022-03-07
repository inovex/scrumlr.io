import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Actions, ReduxAction} from "store/action";
import {AuthAction} from "store/action/auth";
import {API} from "api";
import {ViewAction} from "store/action/view";
import {Toast} from "utils/Toast";
import i18n from "i18next";

export const passAuthMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ViewAction.InitApplication) {
    API.getCurrentUser()
      .then((user) => {
        if (user) {
          dispatch(Actions.signIn(user.id, user.name));
        } else {
          dispatch(Actions.userCheckCompleted());
        }
      })
      .catch(() => {
        // TODO add retry mechanism
        Toast.error(i18n.t("Homepage.errorServerConnection"));
        dispatch(Actions.initFailed());
      });
  }

  if (action.type === AuthAction.SignOut) {
    API.signOut()
      .then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      })
      .catch(() => {
        // FIXME show error
      });
  }
};
