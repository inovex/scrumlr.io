import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18next";
import {Toast} from "../../utils/Toast";
import {Button} from "../../components/Button";
import store from "../index";

export const passViewMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.InitApplication) {
    API.getServerInfo()
      .then((r) => {
        dispatch(Actions.setServerInfo(r.authProvider || [], new Date(r.serverTime)));
      })
      .catch(() => {
        Toast.error(
          <div>
            <div>{i18n.t("Error.initApplication")}</div>
            <Button onClick={() => store.dispatch(Actions.initApplication())}>{i18n.t("Error.retry")}</Button>
          </div>,
          false
        );
      });
  }
};
