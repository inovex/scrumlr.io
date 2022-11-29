import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18next";
import {Toast} from "../../utils/Toast";
import {Button} from "../../components/Button";
import store from "../index";

export const passVotingMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.CreateVoting) {
    API.createVoting(action.context.board!, action.voting).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.createVoting")}</div>
          <Button onClick={() => store.dispatch(Actions.createVoting(action.voting))}>{i18n.t("Error.retry")}</Button>
        </div>,
        false
      );
    });
  }

  if (action.type === Action.CloseVoting) {
    API.changeVotingStatus(action.context.board!, action.voting, "CLOSED").catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.closeVoting")}</div>
          <Button onClick={() => store.dispatch(Actions.closeVoting(action.voting))}>{i18n.t("Error.retry")}</Button>
        </div>,
        false
      );
    });
    API.updateReadyStates(action.context.board!, false);
  }

  if (action.type === Action.AbortVoting) {
    API.changeVotingStatus(action.context.board!, action.voting, "ABORTED").catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.abortVoting")}</div>
          <Button onClick={() => store.dispatch(Actions.abortVoting(action.voting))}>{i18n.t("Error.retry")}</Button>
        </div>,
        false
      );
    });
    API.updateReadyStates(action.context.board!, false);
  }
};
