import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {API} from "api";
import {Action, Actions, ReduxAction} from "store/action";
import {ApplicationState} from "types";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import store from "../index";

export const passColumnMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.EditColumn) {
    API.editColumn(action.context.board!, action.id, action.column).catch(() => {
      Toast.error({
        title: i18n.t("Error.editColumn"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.editColumn(action.id, action.column)),
      });
    });
  }
  if (action.type === Action.CreateColumn) {
    API.createColumn(action.context.board!, action.column).catch(() => {
      Toast.error({
        title: i18n.t("Error.createColumn"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.createColumn(action.column)),
      });
    });
  }
  if (action.type === Action.DeleteColumn) {
    API.deleteColumn(action.context.board!, action.id).catch(() => {
      Toast.error({
        title: i18n.t("Error.deleteColumn"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.deleteColumn(action.id)),
      });
    });
  }
  // if (action.type === Action.UpdatedColumns) {
  //   const {phase, step} = store.getState().onboarding;
  //   if (phase === "board_check_in" && step === 2 && action.columns[0].name === "Check-In" && action.columns[0].visible) {
  //     dispatch(Actions.incrementStep());
  //   }
  // }
};
