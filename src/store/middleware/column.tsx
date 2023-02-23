import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
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
  if (action.type === Action.CreateColumn) {
    API.createColumn(action.context.board!, action.column).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.createColumn")}</div>
          <Button onClick={() => store.dispatch(Actions.createColumn(action.column))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }
  if (action.type === Action.DeleteColumn) {
    API.deleteColumn(action.context.board!, action.id).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.deleteColumn")}</div>
          <Button onClick={() => store.dispatch(Actions.deleteColumn(action.id))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }
};
