import {Dispatch, MiddlewareAPI} from "redux";
import {API} from "api";
import {Action, Actions, ReduxAction} from "store/action";
import {ApplicationState} from "types";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import {Button} from "../../components/Button";
import store from "../index";

export const passColumnMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.EditColumn) {
    API.editColumn(action.context.board!, action.id, action.column).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.editColumn")}</div>
          <Button onClick={() => store.dispatch(Actions.editColumn(action.id, action.column))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }
};
