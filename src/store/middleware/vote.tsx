import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18next";
import {Toast} from "../../utils/Toast";
import {Button} from "../../components/Button";
import store from "../index";

export const passVoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddVote) {
    API.addVote(action.context.board!, action.note)
      .then((r) => {
        dispatch(Actions.createdVote(r));
      })
      .catch(() => {
        Toast.error(
          <div>
            <div>{i18n.t("Error.addVote")}</div>
            <Button onClick={() => store.dispatch(Actions.addVote(action.note))}>{i18n.t("Error.retry")}</Button>
          </div>,
          false
        );
      });
  }

  if (action.type === Action.DeleteVote) {
    API.deleteVote(action.context.board!, action.note)
      .then(() => {
        dispatch(Actions.deletedVote({voting: action.context.voting!, note: action.note}));
      })
      .catch(() => {
        Toast.error(
          <div>
            <div>{i18n.t("Error.deleteVote")}</div>
            <Button onClick={() => store.dispatch(Actions.deleteVote(action.note))}>{i18n.t("Error.retry")}</Button>
          </div>,
          false
        );
      });
  }
};
