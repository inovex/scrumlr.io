import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import Socket from "sockette";
import {ApplicationState} from "types";
import store from "store";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import i18n from "i18next";
import {Toast} from "../../utils/toast";
import {Button} from "../../components/Button";
import {SERVER_WEBSOCKET_PROTOCOL} from "../../config";

let socket: Socket | undefined;

export const passRequestMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.JoinBoard) {
    API.joinBoard(action.boardId, action.passphrase)
      .then((r) => {
        if (r.status === "ACCEPTED") {
          store.dispatch(Actions.permittedBoardAccess(action.boardId));
        } else if (r.status === "REJECTED") {
          store.dispatch(Actions.rejectedBoardAccess());
        } else if (r.status === "WRONG_PASSPHRASE") {
          store.dispatch(Actions.requirePassphraseChallenge());
        } else if (r.status === "PENDING") {
          store.dispatch(Actions.pendingBoardAccessConfirmation(action.boardId, r.joinRequestReference!));
        } else if (r.status === "TOO_MANY_JOIN_REQUESTS") {
          store.dispatch(Actions.tooManyJoinRequests());
        }
      })
      .catch(() => {
        Toast.error({
          title: i18n.t("Error.joinBoard"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.joinBoard(action.boardId, action.passphrase)),
          autoClose: false,
        });
      });
  }

  if (action.type === Action.SetRoute) {
    if (socket) {
      socket.close();
      socket = undefined;
    }
  }

  if (action.type === Action.PendingBoardAccessConfirmation) {
    // change protocol of url
    const websocketURL = new URL(action.requestReference);
    websocketURL.protocol = SERVER_WEBSOCKET_PROTOCOL;

    socket = new Socket(websocketURL.toString(), {
      timeout: 5000,
      maxAttempts: 0,
      onmessage: async (evt: MessageEvent<string>) => {
        const message = JSON.parse(evt.data);
        if (message === "SESSION_ACCEPTED") {
          store.dispatch(Actions.permittedBoardAccess(action.board));
        } else if (message === "SESSION_REJECTED") {
          store.dispatch(Actions.rejectedBoardAccess());
        }
      },
    });
  }

  if (action.type === Action.AcceptJoinRequests) {
    action.userIds.forEach((userId) => {
      API.acceptJoinRequest(action.context.board!, userId).catch(() => {
        Toast.error({
          title: i18n.t("Error.acceptJoinRequests"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.acceptJoinRequests(action.userIds)),
          autoClose: false,
        });
      });
    });
  }

  if (action.type === Action.RejectJoinRequests) {
    action.userIds.forEach((userId) => {
      API.rejectJoinRequest(action.context.board!, userId).catch(() => {
        Toast.error({
          title: i18n.t("Error.rejectJoinRequest"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.rejectJoinRequests(action.userIds)),
          autoClose: false,
        });
      });
    });
  }
};
