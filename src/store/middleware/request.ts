import {Dispatch, MiddlewareAPI} from "redux";
import Socket from "sockette";
import {ApplicationState} from "../../types";
import {Action, Actions, ReduxAction} from "../action";
import {API} from "../../api";
import store from "../index";

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
        }
      })
      .catch(() => {
        // FIXME show error
      });
  }

  if (action.type === Action.PendingBoardAccessConfirmation) {
    // FIXME close socket on route change
    new Socket(action.requestReference, {
      timeout: 5000,
      maxAttempts: 0,
      onopen: (e: Event) => console.log("connected", e),
      onerror: (e: Event) => console.log("error", e),
      onclose: (e: CloseEvent) => console.log("closed", e),
      onreconnect: () => console.log("reconnect"),

      onmessage: async (evt: MessageEvent<string>) => {
        const message = evt.data;
        if (message === "SESSION_ACCEPTED") {
          store.dispatch(Actions.permittedBoardAccess(action.board));
        } else if (message === "SESSION_REJECTED") {
          store.dispatch(Actions.rejectedBoardAccess());
        }
      },
    });
  }
};
